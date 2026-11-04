// 产品页截图用的演示模型：不联网、不花钱。按截图里会问的几句话给出写好的回答和工具调用，
// 其余提示（总结、批改、统计观察）给出形状正确、读起来自然的内容。只在临时库里用，由 demo-core.mts 加载。
// pi-ai 必须和产品 Core 用同一份，所以从产品仓库的 core-node 依赖里取。
const app = process.env.TIBI_APP_PATH;
if (!app) throw new Error('请设置只读产品仓库路径 TIBI_APP_PATH');
const { createAssistantMessageEventStream, createProvider } = await import(`${app}/packages/core-node/node_modules/@earendil-works/pi-ai/dist/index.js`);

const MODEL: any = { id: 'deepseek-chat', name: 'DeepSeek', api: 'openai-completions', provider: 'demo', baseUrl: 'http://demo', input: ['text'], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 100_000, maxTokens: 4000 };

type Call = { name: string; args: unknown };
type Rule = { match: RegExp; think: string; call?: Call; text: string; after?: string };

const RULES: Rule[] = [
  {
    match: /affect.*effect|effect.*affect/i,
    think: '用户想区分 affect 和 effect。调出辨析卡，再用一句话帮他记住。',
    call: { name: 'compare_words', args: { words: ['affect', 'effect'] } },
    text: '',
    after: '一句话记：**affect 是动作，effect 是结果**——A 在前（Action），E 在后（End）。\n\n- The heat **affects** sleep.（高温影响睡眠）\n- The heat has a big **effect** on sleep.（高温对睡眠影响很大）\n\n要不要我用这两个词出两道小题？',
  },
  {
    match: /推荐|找.*文章/,
    think: '用户想找 10 分钟能读完的科技文章，水平 B2 左右。先从订阅里挑几篇长度合适的，让用户勾选。',
    call: { name: 'ask_user', args: { question: '挑了 3 篇 10 分钟左右能读完的科技文章，想读哪几篇？', multi: true, options: [
      { label: 'How a Compiler Sees Your Code', description: '约 6 分钟 · B2 · 从词法到代码生成，一个小函数走完编译器全流程' },
      { label: 'Why the Sky Is Blue, Revisited', description: '约 9 分钟 · B2 · Quanta Magazine，科普物理，长难句不多' },
      { label: 'What Is a Vector Database?', description: '约 8 分钟 · B1 · 概念讲解为主，生词集中在技术名词' },
    ] } },
    text: '',
    after: '好的，已经开始导入，读完可以回来问我。',
  },
  {
    match: /练习|出.*题|小测/,
    think: '用户想练习这周的生词。挑最近标过、还没掌握的词，出三道题。',
    call: { name: 'create_quiz', args: { count: 3 } },
    text: '',
    after: '做完告诉我哪道没把握，我们再细讲。',
  },
  {
    match: /lexer|parser|词法|语法分析/i,
    think: '用户在读编译器那篇，分不清 lexer 和 parser。用表格对比输入、输出和会报的错。',
    text: '两者是编译器的前两道工序，**一个切词，一个搭结构**：\n\n| | lexer（词法分析器） | parser（语法分析器） |\n|---|---|---|\n| 输入 | 一串字符 | 一串 token |\n| 输出 | token 列表 | 抽象语法树（AST） |\n| 会报的错 | 非法字符 | 语法错误，如少了分号 |\n\n文中这句很好地概括了 parser 的工作：\n\n> The parser takes the tokens and checks them against the grammar of the language.\n\n这里 **checks them against** 是「对照……检查」，比 compare with 更强调「以它为标准」。',
  },
  {
    match: /longest match|这句|讲讲|什么意思/i,
    think: '用户选中了文中一句，想知道结构和意思。先拆主干，再讲 as long as 和 longest match。',
    text: '这句的主干是 **Most lexers follow the rule**，后面冒号解释这条规则：\n\n> keep consuming characters **as long as** the result is still a valid token\n\n- **the rule of the longest match**：最长匹配原则——能多吃一个字符就多吃一个\n- **keep doing**：一直做某事\n- **as long as**：只要……（条件），不是「和……一样长」\n\n整句意思：大多数词法分析器遵循最长匹配原则——只要拼出来的还是合法 token，就继续往下读字符。所以 `->` 会被当成一个箭头，而不是减号加大于号。',
  },
];

function plain(all: string, last: string): string {
  if (all.includes('"summary"')) return JSON.stringify({ summary: '文章用一个求面积的小函数，依次讲了编译器的几道工序：词法分析把字符切成 token，语法分析搭出抽象语法树，语义分析检查名字和类型，最后经过中间表示、优化，生成机器能执行的代码。', keywords: ['compiler'], advice: '技术名词多但句子不难，先抓住每一节的第一句。' });
  if (all.includes('"phrases"')) return JSON.stringify({ phrases: [] });
  if (all.includes('"hard_sentences"')) return JSON.stringify({ hard_sentences: [] });
  if (all.includes('只输出这个词在这句话里的中文意思')) return '（在这句里）结果';
  if (all.includes('学生用目标词写了一个英文句子')) return JSON.stringify({ score: 86, ok: true, feedback: '意思清楚，用法正确。as long as 后面用一般现在时表示将来，这里很地道；只是 keep 后面要接动名词 reading。', better: 'I will keep reading as long as the story stays interesting.' });
  if (all.includes('英语学习教练')) return JSON.stringify({ text: '连续读了 8 天，每天 20 分钟左右，节奏很稳。复习记得率 82%，错得多的是 parsimony、vestibule 这类小说里的书面语——它们出现少，认得就行，不必死记。科技文章里的生词掌握得快，下周可以多读一篇小说，换换口味。', actions: ['library', 'review'] });
  if (all.includes('英语阅读材料作者')) return 'A Quiet Upshot\n\nMia kept consuming coffee as long as the bug was still alive. ';
  if (/Reply with exactly: OK/.test(all)) return 'OK';
  return `好问题。${last.slice(0, 40)}——可以先看它在原句里的作用，再看词典释义。需要的话我再举几个例子。`;
}

const usage = { input: 820, output: 160, cacheRead: 0, cacheWrite: 0, totalTokens: 980, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const ALWAYS = ['lookup_word', 'add_to_wordbook', 'ask_user', 'import_document', 'show_link', 'get_context', 'get_document', 'search_memory', 'remember', 'run_skill'];

const stream = (model: any, context: any, options: any) => {
  const s = createAssistantMessageEventStream();
  const msgs = context.messages as { role: string; content: any; toolName?: string }[];
  const all = JSON.stringify(msgs);
  const lastUser = [...msgs].reverse().find(m => m.role === 'user');
  const c = lastUser?.content;
  const last = (typeof c === 'string' ? c : Array.isArray(c) ? c.map((x: any) => x.text ?? '').join('') : '').replace(/<attachment>[\s\S]*?<\/attachment>/g, '').trim();
  const chat = (JSON.stringify(context.systemPrompt ?? '') + all).includes('你是 Tibi');
  const tail = msgs[msgs.length - 1];
  // 技能（找文章等）的系统提示不一定是"你是 Tibi"，按用户这句话本身匹配；长文本是一次性的分析提示
  const rule = last.length < 300 ? RULES.find(r => r.match.test(last)) : undefined;
  const base: any = { role: 'assistant', content: [], api: model.api, provider: model.provider, model: model.id, usage, stopReason: 'stop', timestamp: Date.now() };

  // 工具调用：常用工具直接调，其余先 tool_search（和真实主对话一样按需加载）
  let call: Call | undefined;
  if (rule?.call && tail?.role === 'user') call = ALWAYS.includes(rule.call.name) ? rule.call : { name: 'tool_search', args: { query: rule.call.name } };
  else if (rule?.call && tail?.role === 'toolResult' && tail.toolName === 'tool_search') call = rule.call;
  const think = tail?.role === 'user' ? (rule?.think ?? '') : '';

  void (async () => {
    s.push({ type: 'start', partial: base });
    const pre: any[] = [];
    if (think) {
      s.push({ type: 'thinking_start', contentIndex: 0, partial: base });
      for (const ch of think.match(/.{1,6}/gs) ?? []) { await sleep(15); s.push({ type: 'thinking_delta', contentIndex: 0, delta: ch, partial: base }); }
      s.push({ type: 'thinking_end', contentIndex: 0, content: think, partial: base });
      pre.push({ type: 'thinking', thinking: think });
    }
    if (call) {
      const toolCall = { type: 'toolCall', id: `demo_${Date.now()}`, name: call.name, arguments: call.args };
      const i = pre.length;
      s.push({ type: 'toolcall_start', contentIndex: i, partial: base });
      s.push({ type: 'toolcall_end', contentIndex: i, toolCall, partial: base });
      const final = { ...base, stopReason: 'toolUse', content: [...pre, toolCall] };
      s.push({ type: 'done', reason: 'toolUse', message: final }); s.end(final);
      return;
    }
    const text = rule ? (tail?.role === 'toolResult' ? (rule.after ?? '') : rule.text) : (tail?.role === 'toolResult' ? '好了。' : plain(all, last));
    const ti = pre.length;
    s.push({ type: 'text_start', contentIndex: ti, partial: base });
    let said = '';
    for (const ch of text.match(/.{1,8}/gs) ?? []) {
      await sleep(chat ? 12 : 1);
      if (options?.signal?.aborted) break;
      said += ch;
      s.push({ type: 'text_delta', contentIndex: ti, delta: ch, partial: { ...base, content: [...pre, { type: 'text', text: said }] } });
    }
    s.push({ type: 'text_end', contentIndex: ti, content: text, partial: base });
    const final = { ...base, content: [...pre, { type: 'text', text }] };
    s.push({ type: 'done', reason: 'stop', message: final }); s.end(final);
  })();
  return s;
};

const provider = createProvider({ id: MODEL.provider, name: MODEL.provider, baseUrl: MODEL.baseUrl, auth: { apiKey: { name: MODEL.provider, resolve: async () => ({ auth: {} }) } } as never, models: [MODEL] as never, api: { stream, streamSimple: stream } as never });
export async function demoResolver(): Promise<any> { return { model: MODEL, apiKey: 'demo', streamFn: stream, provider }; }
