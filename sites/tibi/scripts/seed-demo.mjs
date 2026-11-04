// 给演示库准备截图数据，全部经演示 Core 的接口写入；只有过去四周的学习记录直接写临时库。
// node seed-demo.mjs [profile|import|mark|known|review|feeds|history]…（不带参数按顺序全做）
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const dir = process.env.TIBI_DEMO_DIR || '/tmp/tibi-demo';
const ws = new WebSocket('ws://127.0.0.1:3466');
let seq = 0; const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(String(e.data)); const p = pending.get(m.id); if (!p) return;
  pending.delete(m.id); m.error ? p.reject(new Error(`${p.method}: ${m.error.message}`)) : p.resolve(m.result);
};
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject, method }); ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params })); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('连不上演示 Core，先运行 demo-core.mts')); });
const steps = process.argv.slice(2);
const want = s => !steps.length || steps.includes(s);
const docs = async () => (await call('documents.list', { limit: 50 })).items;
async function sentencesOf(id) {
  const out = [];
  for (const sec of (await call('documents.get', { id })).sections) out.push(...(await call('sections.get', { id: sec.id })).sentences);
  return out;
}

if (want('profile')) {
  // 等于走完首次引导：称呼、常读材料；模型由演示 Core 提供，不用填 Key
  await call('profile.update', { patch: { interests: ['tech', 'news'], assistant_prefs: { nickname: '小满' } } });
  await call('settings.set', { patch: { 'onboarding.done': true } });
}

if (want('import')) {
  for (const s of await call('documents.samples')) if (!s.document_id) await call('documents.import', { source: { type: 'sample', id: s.id } });
  await sleep(4000);
}

if (want('mark')) {
  // 按原句标词：[词, 状态]，0 生词 … 5 掌握、97 已知
  const plan = {
    'How a Compiler Sees Your Code': [['discarded', 0], ['ambiguity', 1], ['consuming', 0], ['explicitly', 2], ['grammatically', 0], ['surface', 3], ['intermediate', 1], ['trivial', 4], ['resolve', 2], ['recover', 3], ['literal', 1], ['grammar', 5], ['token', 97], ['compiler', 97], ['nonsense', 5], ['compatible', 4]],
    'The Gift of the Magi': [['parsimony', 0], ['mendicancy', 0], ['meretricious', 0], ['imputation', 0], ['instigates', 1], ['vestibule', 0], ['sniffles', 2], ['predominating', 1], ['agile', 3], ['faltered', 1], ['ransacking', 0], ['chaste', 2], ['sacrifice', 5]],
    'Why Cities Are Getting Hotter': [['absorb', 3], ['vulnerable', 1], ['evaporation', 2], ['pavement', 2], ['dense', 5]],
  };
  for (const d of await docs()) {
    const words = plan[d.title]; if (!words) continue;
    const sentences = await sentencesOf(d.id);
    for (const [w, status] of words) {
      const s = sentences.find(x => x.tokens.some(t => t.l === w || t.t.toLowerCase() === w));
      if (!s) { console.log('没找到', d.title, w); continue; }
      await call('terms.mark', { text: s.tokens.find(t => t.l === w || t.t.toLowerCase() === w).t, status, sentence_id: s.id });
    }
  }
}

if (want('known')) {
  // 读者认识的词：每篇第一节里较长、还没标过的词标为已知，凑够 42 个
  const seen = new Set(); let n = 0;
  for (const d of await docs()) {
    const sec = await call('sections.get', { id: (await call('documents.get', { id: d.id })).sections[0].id });
    for (const s of sec.sentences) for (const t of s.tokens) {
      if (n >= 42 || t.status !== undefined || t.l.length < 6 || seen.has(t.l)) continue;
      seen.add(t.l); n++;
      await call('terms.mark', { text: t.t, status: 97, sentence_id: s.id });
    }
  }
}

if (want('review')) {
  // 做掉 9 题后暂停，复习页显示「复习做到一半」
  const s = await call('review.start', { limit: 30 });
  for (const q of s.steps.slice(0, 9)) {
    const answer = q.card_type === 'choice' ? { choice: (q.options.find(o => q.context.answer.includes(o.text)) ?? q.options[0]).id }
      : q.card_type === 'cloze' ? { typed: q.context.answer[0] } : { self_rating: 3 };
    await call('review.answer', { session_id: s.session_id, step: q.step, answer, hints: 0, duration_ms: 6000 });
    await call('review.next', { session_id: s.session_id, step: q.step }).catch(() => undefined);
  }
  await call('review.pause', { session_id: s.session_id }).catch(() => undefined);
}

if (want('feeds')) {
  // 内置源加一个科普源；The Conversation 在本机常超时，关掉免得侧栏显示红色错误
  await call('feeds.add', { url: 'https://www.quantamagazine.org/feed/', folder: '科普' }).catch(e => console.log(e.message));
  await call('feeds.update', { id: 'builtin-conversation', enabled: false }).catch(() => undefined);
  console.log(await call('feeds.refresh', { force: true }));
}

if (want('history')) {
  // 过去四周的阅读、复习记录，让统计和复习面板有趋势；今天的复习按九对一错
  const db = new DatabaseSync(`${dir}/app.db`);
  const cards = db.prepare('SELECT id FROM cards').all().map(r => r.id);
  const total = db.prepare('SELECT count(*) AS n FROM terms WHERE status IN (5, 97) AND deleted_at IS NULL').get().n;
  let rnd = 7; const random = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
  const day = d => { const t = new Date(); t.setHours(20, 0, 0, 0); t.setDate(t.getDate() - d); return t; };
  const iso = t => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  const days = []; for (let d = 28; d >= 1; d--) if (random() >= 0.18) days.push(day(d));
  days.forEach((t, i) => {
    const mins = 9 + Math.floor(random() * 26), reviews = 8 + Math.floor(random() * 19), correct = Math.floor(reviews * (0.8 + random() * 0.15));
    const mastered = Math.round(8 + (total - 8) * (i / days.length) ** 0.9);
    db.prepare('INSERT OR REPLACE INTO daily_stats VALUES (?, ?, ?, ?, ?, ?, ?)').run(iso(t), mins * (130 + Math.floor(random() * 50)), mins * 60000, 3 + Math.floor(random() * 10), mastered, reviews, correct);
    for (let k = 0; k < reviews; k++) {
      db.prepare('INSERT INTO review_logs (id, card_id, rating, card_type, correct, reviewed_at, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), cards[Math.floor(random() * cards.length)], k < correct ? [2, 3, 3, 3, 4][Math.floor(random() * 5)] : 1, ['choice', 'cloze', 'recognize'][k % 3], k < correct ? 1 : 0, t.getTime() + k * 20000, 5000);
    }
  });
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const today = db.prepare('SELECT id FROM review_logs WHERE reviewed_at >= ? ORDER BY reviewed_at').all(start.getTime()).map(r => r.id);
  today.forEach((id, i) => { if (i !== 3) db.prepare('UPDATE review_logs SET correct = 1, rating = 3 WHERE id = ?').run(id); });
  db.prepare('UPDATE daily_stats SET mastered_total = ?, reviews = ?, review_correct = ? WHERE date = ?').run(total, today.length, Math.max(0, today.length - 1), iso(start));
  db.close();
}

console.log('演示数据准备好了'); ws.close(); process.exit(0);
