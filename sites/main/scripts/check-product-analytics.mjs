import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const item of [{ name: 'huahai', origin: 'http://127.0.0.1:5181', base: '/art-history-atlas/', event: 'artwork_opened' }, { name: 'tibi', origin: 'http://127.0.0.1:5182', base: '/', event: 'word_lookup_used' }]) {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const received = [];
    await context.route('**://*.mixpanel.com/**', async route => {
      const data = new URLSearchParams(route.request().postData()).get('data');
      const payload = JSON.parse(data.startsWith('[') || data.startsWith('{') ? data : Buffer.from(data, 'base64').toString());
      received.push(...(Array.isArray(payload) ? payload : [payload]));
      await route.fulfill({ contentType: 'application/json', body: '1', headers: { 'Access-Control-Allow-Origin': '*' } });
    });
    await context.route(`${item.origin}${item.base}?analytics-test=1`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="zh-CN"><body>SDK test</body></html>' }));
    const page = await context.newPage();
    await page.goto(`${item.origin}${item.base}?analytics-test=1`);
    await page.evaluate(async base => { window.usageTest = await import(`${base}src/lib/analytics.ts`); }, item.base);
    await page.evaluate(event => window.usageTest.trackUsage(event), item.event);
    await page.waitForTimeout(400);
    assert.equal(received.length, 0, `${item.name} 默认不发送`);
    await page.evaluate(event => { window.usageTest.setUsageAnalytics(true); window.usageTest.trackUsage(event, { artwork_id: 'michelangelo-david', secret: 'PRIVATE-CONTENT' }); window.usageTest.trackUsage('PRIVATE-EVENT', { secret: 'PRIVATE-CONTENT' }); }, item.event);
    await page.waitForTimeout(6500);
    assert.equal(received.length, 2, `${item.name} 只发送启动与允许的业务事件`);
    assert.ok(received.every(e => e.properties.environment === 'development' && e.properties.product === item.name));
    assert.equal(JSON.stringify(received).includes('PRIVATE'), false, `${item.name} 过滤敏感属性与未知事件`);
    const originalId = received[0].properties.distinct_id;
    await page.evaluate(() => window.usageTest.setUsageAnalytics(false));
    const count = received.length;
    await page.evaluate(event => window.usageTest.trackUsage(event), item.event);
    await page.waitForTimeout(800);
    assert.equal(received.length, count, `${item.name} 撤回后不发送`);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('mp_'))), false, `${item.name} 撤回清除 SDK 标识`);
    await page.evaluate(() => window.usageTest.setUsageAnalytics(true));
    await page.waitForTimeout(6500);
    assert.notEqual(received.at(-1).properties.distinct_id, originalId, `${item.name} 重新允许使用新标识`);
    await page.evaluate(() => window.usageTest.setUsageAnalytics(false));
    await context.close();
    console.log(`${item.name}：真实 SDK 默认关闭、有限事件、属性过滤、环境隔离、撤回、清标识与重新允许通过；无真实上报。`);
  }
} finally { await browser.close(); }
