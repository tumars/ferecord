// 截图用的 Tibi Core：临时库 + 演示模型 + WebSocket（ws://127.0.0.1:3466），不开 MCP、不同步、不自动刷新订阅。
// 不碰本机真实学习数据和密钥。运行方法见 ../design.md「重新采集」。
const app = process.env.TIBI_APP_PATH;
if (!app) throw new Error('请设置只读产品仓库路径 TIBI_APP_PATH');
const dir = process.env.TIBI_DEMO_DIR || '/tmp/tibi-demo';
const { createCore } = await import(`${app}/packages/core-node/src/create.ts`);
const { startWebSocket } = await import(`${app}/packages/core-node/src/transport.ts`);
const { demoResolver } = await import('./demo-model.mts');
(await import('node:fs')).mkdirSync(dir, { recursive: true });

const core = await createCore({
  dbPath: `${dir}/app.db`, dictPath: `${app}/data/ecdict/dict.db`,
  version: '0.1.0', resolveModel: demoResolver,
});
startWebSocket(core, 3466);
console.error(`[demo-core] ws://127.0.0.1:3466  db=${dir}/app.db`);
