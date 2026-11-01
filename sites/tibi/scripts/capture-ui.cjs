// 只读应用预览与原型；不启动 Core、不写入产品仓库或用户数据。
// 运行方法、依赖及预览服务见 ../design.md。
const { createRequire } = require('node:module');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const deps = process.env.TIBI_CAPTURE_DEPS
  ? createRequire(path.resolve(process.env.TIBI_CAPTURE_DEPS, 'package.json')) : require;
const { chromium } = deps('playwright');
const sharp = deps('sharp');
const appPath = process.env.TIBI_APP_PATH;
if (!appPath) throw new Error('请设置只读产品仓库路径 TIBI_APP_PATH');
const appURL = process.env.TIBI_APP_URL || 'http://127.0.0.1:8871';
const protoURL = process.env.TIBI_PROTO_URL || 'http://127.0.0.1:8872';
const output = path.resolve(__dirname, '../public/img');
const proof = process.env.TIBI_CAPTURE_PROOF || '/tmp/tibi-capture-proof';
mkdirSync(proof, { recursive: true });

// 直接读取 shipping app 的三条声明，避免复制后随版本漂移。
const appCSS = readFileSync(path.join(appPath, 'apps/desktop/src/styles.css'), 'utf8');
const fontDeclarations = ['ui', 'read', 'mono'].map(kind => {
  const declaration = appCSS.match(new RegExp(`--f-${kind}:\\s*[^;]+;`))?.[0];
  if (!declaration || /PuHui/i.test(declaration)) throw new Error(`应用字体栈异常：${kind}`);
  return declaration;
});
const fontCSS = `:root { ${fontDeclarations.join('\n')} }`;
const audit = [];

async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function fonts(page, name, selectors) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const used = [];
  for (const selector of selectors) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (!nodeId) throw new Error(`找不到字体检查节点：${name} ${selector}`);
    used.push({ selector, ...(await cdp.send('CSS.getPlatformFontsForNode', { nodeId })) });
  }
  const stack = await page.evaluate(() => ['ui', 'read', 'mono'].map(k =>
    getComputedStyle(document.documentElement).getPropertyValue(`--f-${k}`).trim()));
  if (/PuHui/i.test(JSON.stringify({ stack, used }))) throw new Error(`${name} 仍在使用普惠体`);
  audit.push({ name, stack, used });
  await cdp.detach();
}

async function feature(page, name, clip) {
  await ready(page);
  const png = await page.screenshot({ clip, animations: 'disabled' });
  for (const width of [1200, 600]) {
    await sharp(png).resize(width, width * 5 / 8).webp({ quality: 92, effort: 6 })
      .toFile(path.join(output, 'features', `${name}${width === 600 ? '.sm' : ''}.webp`));
  }
}

async function fullShot(page, name) {
  await ready(page);
  await sharp(await page.screenshot({ animations: 'disabled' })).resize(1920, 1200)
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toFile(path.join(output, 'screenshots', `${name}.jpg`));
}

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.TIBI_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'reduce', locale: 'zh-CN' });
    // 不加载外部字体或其它第三方服务。原型 CSS 在响应进入浏览器前处理。
    const requests = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      requests.push(url.href);
      if (![new URL(appURL).origin, new URL(protoURL).origin].includes(url.origin)) return route.abort();
      if (url.pathname.endsWith('/v2.css')) {
        let css = readFileSync(path.join(appPath, 'docs/prototypes/v2.css'), 'utf8');
        css = css.replace(/@font-face\s*\{[^}]*\}/g, '')
          .replace(/"Alibaba PuHuiTi 3\.0",?\s*/g, '');
        for (const declaration of fontDeclarations) {
          css = css.replace(new RegExp(`${declaration.split(':')[0]}:\\s*[^;]+;`, 'g'), declaration);
        }
        return route.fulfill({ contentType: 'text/css', body: css });
      }
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(`${appURL}/?mock=1`);
    await page.locator('.composer').waitFor();
    await page.addStyleTag({ content: fontCSS });
    // 首页自然滚动到导入框，截图聚焦真实操作区，不把欢迎插画当营销素材。
    await page.locator('.composer').evaluate(el => {
      const scroll = el.closest('.scroll');
      scroll.scrollTop += el.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 24;
    });
    await ready(page);
    await fonts(page, 'home', ['.nav a span', '.lead .t', '.composer textarea']);
    await fullShot(page, 'home');
    const composer = await page.locator('.composer').boundingBox();
    await feature(page, 'import', { x: composer.x - 20, y: composer.y - 16, width: 800, height: 500 });

    await page.goto(`${appURL}/?mock=1#/read/d1`);
    await page.locator('.rd .w').first().waitFor();
    // 示例数据带有已读进度，恢复完成后回到文章开头。
    await page.waitForTimeout(500);
    await page.locator('.rdwrap .scroll').first().evaluate(el => { el.scrollTop = 0; });
    await ready(page);
    await fonts(page, 'reader', ['.crumb', '.rd h1', '.rd p', '.rd pre']);
    const article = await page.locator('.rd').last().boundingBox();
    await feature(page, 'mark', { x: article.x, y: 74, width: 720, height: 450 });
    await page.locator('.w').filter({ hasText: /^upshot$/ }).click();
    await page.locator('.wc .dict').waitFor();
    await ready(page);
    await fonts(page, 'lookup', ['.wc .h b', '.wc .dict', '.wc .stages button']);
    await fullShot(page, 'reader');
    const word = await page.locator('.wc').boundingBox();
    await feature(page, 'lookup', { x: Math.min(640, Math.max(260, word.x - 140)),
      y: Math.min(400, Math.max(64, word.y - 60)), width: 640, height: 400 });

    await page.goto(`${appURL}/?mock=1#/words`);
    await page.getByText('distinctive', { exact: true }).waitFor();
    await fonts(page, 'words', ['.crumb', '.wrow.h span']);
    await fullShot(page, 'words');

    // mock 暂缺完整 AI、统计接口，复习示例的答案数据也未与当前界面对齐。
    // 使用明确标注的原型，不伪造真实应用响应。
    for (const [file, name, selectors] of [
      ['reader', 'ai', ['.crumb', '#page h1', '#page p']],
      ['review', 'review', ['.prompt', '.sentence', '.opt']],
      ['stats', 'progress', ['.tile .k', '.tile .v', '.ph h2']],
    ]) {
      await page.goto(`${protoURL}/${file}.html`);
      await page.locator(selectors[1]).first().waitFor();
      await ready(page);
      await fonts(page, name, selectors);
      if (name === 'ai') {
        await page.locator('#sumBtn').click();
        await page.locator('#pane-sum .gloss').first().waitFor();
        await page.waitForTimeout(400);
        await page.locator('#reader').evaluate(el => { el.scrollTop = 0; });
        await ready(page);
        await fonts(page, 'ai-summary', ['#pane-sum .gloss', '#page .w']);
        await feature(page, name, { x: 0, y: 0, width: 1280, height: 800 });
      } else if (name === 'review') {
        const card = await page.locator('#rv').boundingBox();
        await feature(page, name, { x: card.x, y: 72, width: 720, height: 450 });
      } else {
        await feature(page, name, { x: 260, y: 64, width: 1000, height: 625 });
      }
      await page.screenshot({ path: path.join(proof, `${name}.png`), animations: 'disabled' });
    }
    if (requests.some(url => /Alibaba|PuHui/i.test(url))) throw new Error('采集期间请求了普惠体资源');
    writeFileSync(path.join(proof, 'fonts.json'), JSON.stringify({ fontDeclarations, audit,
      fontRequests: requests.filter(url => /font|woff/i.test(url)) }, null, 2));
    console.log(`已生成 12 张功能 WebP、3 张完整截图；字体报告：${proof}/fonts.json`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
