import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = new URL('../public/', import.meta.url);
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = new URL(path === '/' ? 'index.html' : path.slice(1), root);
    if (!file.href.startsWith(root.href)) throw new Error('path');
    res.setHeader('Content-Type', file.pathname.endsWith('.js') ? 'text/javascript' : file.pathname.endsWith('.css') ? 'text/css' : file.pathname.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
const received = [];
await context.route('**://*.mixpanel.com/**', async route => {
  const request = route.request();
  assert.equal(new URL(request.url()).pathname, '/track/'); // 回放、profile 等请求不应发生。
  const data = new URLSearchParams(request.postData()).get('data');
  const payload = JSON.parse(data.startsWith('[') || data.startsWith('{') ? data : Buffer.from(data, 'base64').toString());
  received.push(...(Array.isArray(payload) ? payload : [payload]));
  await route.fulfill({ status: 200, contentType: 'application/json', body: '1', headers: { 'Access-Control-Allow-Origin': '*' } });
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
async function waitFor(predicate, label) { const until = Date.now() + 15000; while (!predicate() && Date.now() < until) await new Promise(r => setTimeout(r, 100)); assert.ok(predicate(), label); }
try {
  await page.goto(`${origin}/?analytics-test=1&secret=private-value&utm_source=test&utm_campaign=private@example.com`);
  await page.waitForFunction(() => !!window.ferecordAnalytics);
  await page.waitForTimeout(600);
  assert.equal(received.length, 0, '选择前不得发送');
  assert.equal(await page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('mp_'))), false, '选择前不初始化标识');
  await page.locator('[data-analytics-controls] summary').click();
  await page.locator('[data-analytics-choice="allow"]').click();
  await waitFor(() => received.some(e => e.event === 'page_view'), '允许后发送页面事件');
  assert.equal(received.filter(e => e.event === 'page_view').length, 1);
  const firstId = received[0].properties.distinct_id;
  assert.equal(received[0].properties.environment, 'development');
  assert.equal(received[0].properties.utm_source, 'test');
  assert.equal('utm_campaign' in received[0].properties, false);
  assert.equal(JSON.stringify(received).includes('private'), false, '完整 URL 和敏感参数不得发送');
  await page.evaluate(() => { document.dispatchEvent(new Event('astro:page-load')); document.dispatchEvent(new Event('astro:page-load')); });
  await page.waitForTimeout(500);
  assert.equal(received.filter(e => e.event === 'page_view').length, 1, '同一路由不重复');
  await page.evaluate(() => document.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); }));
  await page.locator('.tibi-card .card-link').click();
  await waitFor(() => received.some(e => e.event === 'product_link_clicked'), '真实入口点击发送');
  await context.setOffline(true);
  await page.evaluate(() => window.ferecordAnalytics.track('download_link_clicked', { target_product: 'tibi', secret: 'private-value' }));
  await page.waitForTimeout(300);
  await context.setOffline(false);
  await waitFor(() => received.some(e => e.event === 'download_link_clicked'), '断网队列恢复');
  assert.equal(JSON.stringify(received).includes('private'), false, '业务属性白名单过滤');
  const second = await context.newPage();
  await second.goto(`${origin}/?analytics-test=1`);
  await second.waitForFunction(() => !!window.ferecordAnalytics);
  await page.evaluate(() => window.ferecordAnalytics.track('app_store_link_clicked', { target_product: 'huahai' }));
  await second.evaluate(() => window.ferecordAnalytics.setChoice('deny'));
  await page.waitForFunction(() => !window.ferecordAnalytics.enabled());
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('mp_'))), false, '撤回清除标识');
  const atWithdrawal = received.length;
  await page.evaluate(() => window.ferecordAnalytics.track('page_view'));
  await page.waitForTimeout(6000);
  assert.equal(received.length, atWithdrawal, '跨标签页撤回后不发送');
  await page.evaluate(() => window.ferecordAnalytics.setChoice('allow'));
  await waitFor(() => received.length > atWithdrawal, '重新允许后恢复');
  assert.notEqual(received.at(-1).properties.distinct_id, firstId, '重新允许使用新标识');
  for (const signal of ['doNotTrack', 'globalPrivacyControl']) {
    const isolated = await browser.newContext({ reducedMotion: 'reduce' });
    await isolated.addInitScript(signal => { Object.defineProperty(navigator, signal, { value: signal === 'doNotTrack' ? '1' : true }); localStorage.setItem('ferecord.analytics.v1', 'allow'); }, signal);
    let requests = 0;
    await isolated.route('**://*.mixpanel.com/**', route => { requests++; return route.abort(); });
    const tab = await isolated.newPage(); await tab.goto(`${origin}/?analytics-test=1`); await tab.waitForTimeout(800);
    assert.equal(requests, 0, `${signal} 不发送`); await isolated.close();
  }
  assert.deepEqual(errors, []);
  console.log(`通过：真实 SDK 选择、路由去重、入口点击、属性过滤、离线补发、跨标签页撤回、清队列、标识重置、DNT/GPC；拦截 ${received.length} 条事件，无真实上报。`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
