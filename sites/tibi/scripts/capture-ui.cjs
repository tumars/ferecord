// 采集产品页截图：真实 Tibi 界面（产品仓库的 Vite 界面 + demo-core.mts 演示 Core），不读本机学习数据。
// 先按 1280×800、DPR 2 截原图到 TIBI_CAPTURE_RAW，再裁成发布图写入 ../public/img。运行方法见 ../design.md。
const { createRequire } = require('node:module');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const deps = process.env.TIBI_CAPTURE_DEPS
  ? createRequire(path.resolve(process.env.TIBI_CAPTURE_DEPS, 'package.json')) : require;
const { chromium } = deps('playwright-core');
const sharp = deps('sharp');
const APP = process.env.TIBI_APP_URL || 'http://localhost:1430';
const CORE = 'ws://127.0.0.1:3466';
const raw = process.env.TIBI_CAPTURE_RAW || '/tmp/tibi-capture-raw';
const output = path.resolve(__dirname, '../public/img');
mkdirSync(raw, { recursive: true });

async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.waitForTimeout(300);
}
const shot = async (page, name) => { await ready(page); await page.screenshot({ path: path.join(raw, `${name}.png`), animations: 'disabled' }); console.log('截好', name); };
async function go(page, hash) { await page.goto(`${APP}/#${hash}`); await page.waitForTimeout(1500); }
async function docId(page, title) {
  return page.evaluate(async ([url, t]) => {
    const ws = new WebSocket(url);
    await new Promise(r => { ws.onopen = r; });
    const res = await new Promise(r => { ws.onmessage = e => r(JSON.parse(e.data)); ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'documents.list', params: { limit: 50 } })); });
    ws.close(); return res.result.items.find(d => d.title === t)?.id;
  }, [CORE, title]);
}

const SHOTS = {
  async home(page) { await go(page, '/'); await shot(page, 'home'); },
  async reader(page) {
    await go(page, `/read/${await docId(page, 'How a Compiler Sees Your Code')}`);
    const panel = page.locator('.rpanel');
    // 右侧面板：null 关掉，或 '总结' / 'Tibi'；开关状态会被应用记住，所以先看现在开着哪个
    const setPanel = async want => {
      const open = await panel.count() ? ((await panel.innerText()).includes('Tibi · 讲解') ? 'Tibi' : '总结') : null;
      if (open === want) return;
      if (open) await page.getByRole('button', { name: open, exact: true }).first().click();
      await page.waitForTimeout(300);
      if (want) { await page.getByRole('button', { name: want, exact: true }).first().click(); await page.waitForTimeout(800); }
    };
    // 面板默认偏窄，往左拖宽一些，表格和总结不至于挤
    const widen = async () => {
      const h = await page.locator('.rpanel-resize').boundingBox(); if (!h) return;
      await page.mouse.move(h.x + 3, h.y + 300); await page.mouse.down();
      await page.mouse.move(h.x - 130, h.y + 300, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(300);
    };
    await setPanel(null);
    await page.locator('.rdwrap .scroll').first().evaluate(el => { el.scrollTop = 0; });
    await setPanel('总结'); await widen();
    await shot(page, 'reader-summary');
    await setPanel(null);
    // 滚到 Lexing 一节，点一个标过的生词
    const word = page.locator('.w').filter({ hasText: /^ambiguity$/ }).first();
    await word.evaluate(el => { const sc = el.closest('.scroll'); sc.scrollTop += el.getBoundingClientRect().top - 330; });
    await word.click();
    await page.locator('.wc').waitFor(); await page.waitForTimeout(1000);
    await shot(page, 'reader-card');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.locator('.rdwrap .scroll').first().evaluate(el => { el.scrollTop = 0; });
    await setPanel('Tibi'); await widen();
    await shot(page, 'reader-ask');
    await setPanel(null);
  },
  async chat(page) {
    await go(page, '/');
    await page.locator('aside a, nav a').filter({ hasText: 'affect' }).first().click(); await page.waitForTimeout(1500);
    await page.locator('.scroll').last().evaluate(el => { el.scrollTop = 0; });
    await shot(page, 'chat-compare');
    await page.locator('aside a, nav a').filter({ hasText: '推荐一篇' }).first().click(); await page.waitForTimeout(1500);
    await shot(page, 'chat-scout');
  },
  async feeds(page) {
    await go(page, '/feeds');
    await page.getByText('News in Levels', { exact: true }).first().click(); await page.waitForTimeout(800);
    await shot(page, 'feeds-levels');
  },
  async dict(page) {
    await go(page, '/dict');
    await page.locator('input').first().fill('affect'); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    await shot(page, 'dict');
  },
  async review(page) {
    await go(page, '/review'); await shot(page, 'review-overview');
    await page.getByRole('button', { name: /接着复习|开始复习/ }).first().click(); await page.waitForTimeout(4500);
    // 矮一点的视口让选项贴近题干，裁出来更紧凑
    await page.setViewportSize({ width: 1280, height: 600 }); await page.waitForTimeout(500);
    await shot(page, 'review-card');
    await page.setViewportSize({ width: 1280, height: 800 });
  },
  async aloud(page) {
    await go(page, `/read/${await docId(page, 'Why Cities Are Getting Hotter')}`);
    if (await page.locator('.rpanel').count()) { await page.getByRole('button', { name: '总结', exact: true }).first().click(); await page.waitForTimeout(400); }
    await page.getByRole('button', { name: /朗读/ }).first().click(); await page.waitForTimeout(2500);
    await shot(page, 'aloud');
    await page.getByRole('button', { name: /朗读|停止|暂停/ }).first().click().catch(() => {});
  },
  async stats(page) { await go(page, '/stats'); await shot(page, 'stats'); },
};

// 完整截图 1920×1200 JPEG（轮播）
const FULL = { home: 'home', reader: 'reader-card', chat: 'chat-compare', feeds: 'feeds-levels', review: 'review-overview', stats: 'stats' };
// 功能图 16:10 WebP：[原图, x, y, 宽]（CSS 像素，高 = 宽 × 10/16）；big 为重点大图 1600 / 800，其余 1200 / 600
const CROPS = {
  feeds: ['feeds-levels', 230, 8, 1000, true],
  lookup: ['reader-card', 430, 210, 830, true],
  chat: ['chat-compare', 300, 60, 960, true],
  review: ['review-card', 374, 56, 768, true],
  ask: ['reader-ask', 496, 40, 768],
  summary: ['reader-summary', 512, 60, 768],
  scout: ['chat-scout', 380, 70, 768],
  aloud: ['aloud', 300, 160, 912],
  dict: ['dict', 300, 50, 960],
  stats: ['stats', 270, 60, 1000],
};

async function publish() {
  for (const [name, src] of Object.entries(FULL)) {
    await sharp(path.join(raw, `${src}.png`)).resize(1920, 1200).jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(path.join(output, 'screenshots', `${name}.jpg`));
  }
  for (const [name, [src, x, y, w, big]] of Object.entries(CROPS)) {
    const region = { left: x * 2, top: y * 2, width: w * 2, height: Math.round(w * 10 / 16) * 2 };
    for (const width of big ? [1600, 800] : [1200, 600]) {
      await sharp(path.join(raw, `${src}.png`)).extract(region).resize(width, width * 10 / 16).webp({ quality: 90, effort: 6 })
        .toFile(path.join(output, 'features', `${name}${width <= 800 ? '.sm' : ''}.webp`));
    }
  }
  console.log(`已生成 ${Object.keys(FULL).length} 张完整截图、${Object.keys(CROPS).length * 2} 张功能 WebP`);
}

(async () => {
  const only = process.argv.slice(2);
  if (!only.includes('--publish-only')) {
    const browser = await chromium.launch({ headless: true,
      executablePath: process.env.TIBI_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'reduce', locale: 'zh-CN' });
      const page = await context.newPage();
      page.on('pageerror', e => console.error('页面错误', e.message));
      for (const [name, fn] of Object.entries(SHOTS)) {
        if (only.length && !only.includes(name)) continue;
        await fn(page);
      }
    } finally { await browser.close(); }
  }
  await publish();
})().catch(error => { console.error(error); process.exitCode = 1; });
