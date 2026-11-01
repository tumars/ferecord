/* 提比首屏装饰：改编自产品 apps/desktop/src/lib/fox.js。
   保留原造型与配色，用纯 CSS 串起待机小动作，无状态机、交互或框架依赖。
   固定尺寸容器内替换 WebP，脚本不可用时保留原图。 */
(() => {
  const host = document.querySelector('.hero-fox');
  if (!host) return;

  const C = { fur: '#f5a043', furDk: '#e3842a', cream: '#fff4e2', flank: '#cfc3b4', inner: '#ffc7a6', ink: '#2b1f17', blush: '#ff8f7d', tongue: '#f2766a', mouth: '#8a2e24' };
  const style = document.createElement('style');
  style.textContent = `
.hero-fox svg { display: block; overflow: visible; }
.hero-fox svg * { transform-box: view-box; }
.hero-fox .all { transform-origin: 100px 186px; animation: tibi-fox-hop 10s ease-in-out infinite; }
.hero-fox .shadow { transform-origin: 100px 189px; animation: tibi-fox-shadow 10s ease-in-out infinite; }
.hero-fox .tail { transform-origin: 130px 168px; animation: tibi-fox-tail 10s ease-in-out infinite; }
.hero-fox .body { transform-origin: 100px 182px; animation: tibi-fox-breathe 3.4s ease-in-out infinite; }
.hero-fox .head { transform-origin: 100px 140px; animation: tibi-fox-bob 3.4s ease-in-out infinite; }
.hero-fox .ear-l { transform-origin: 66px 46px; animation: tibi-fox-ear-l 10s ease-in-out infinite; }
.hero-fox .ear-r { transform-origin: 134px 46px; animation: tibi-fox-ear-r 10s ease-in-out infinite; }
.hero-fox .eyes { transform-origin: 100px 80px; animation: tibi-fox-blink 10s linear infinite; }
.hero-fox .pupils { animation: tibi-fox-glance 10s ease-in-out infinite; }
.hero-fox .blush { opacity: .5; animation: tibi-fox-blush 10s ease-in-out infinite; }
.hero-fox .m-shut { opacity: 1; animation: tibi-fox-mouth-shut 10s ease-in-out infinite; }
.hero-fox .m-open { opacity: 0; animation: tibi-fox-mouth 10s ease-in-out infinite; }
/* 10 秒主循环：偷瞄、错峰抖耳、双眨眼，最后微笑并轻跳一次。
   嘴形用互补透明度交替，不依赖路径变形或 JS 定时器。 */
@keyframes tibi-fox-tail {
  0%, 32%, 64%, 100% { transform: rotate(-6deg); }
  16%, 48%, 86% { transform: rotate(8deg); }
  70%, 76% { transform: rotate(12deg); }
  73%, 80% { transform: rotate(-9deg); }
}
@keyframes tibi-fox-breathe { 50% { transform: scale(1.02, .985); } }
@keyframes tibi-fox-bob { 50% { transform: translateY(1.5px); } }
@keyframes tibi-fox-blink {
  0%, 14%, 17%, 53%, 56%, 57%, 60%, 90%, 93%, 100% { transform: scaleY(1); }
  15.5%, 54.5%, 58.5%, 91.5% { transform: scaleY(.08); }
}
@keyframes tibi-fox-ear-l {
  0%, 38%, 45%, 68%, 80%, 100% { transform: rotate(0); }
  40% { transform: rotate(-11deg); } 42% { transform: rotate(3deg); }
  72%, 76% { transform: rotate(-6deg); }
}
@keyframes tibi-fox-ear-r {
  0%, 20%, 27%, 70%, 82%, 100% { transform: rotate(0); }
  22% { transform: rotate(12deg); } 24% { transform: rotate(-3deg); }
  74%, 78% { transform: rotate(8deg); }
}
@keyframes tibi-fox-glance {
  0%, 19%, 30%, 37%, 48%, 100% { transform: translate(0, 0); }
  22%, 27% { transform: translate(2px, -1px); }
  40%, 45% { transform: translate(-2px, 0); }
}
@keyframes tibi-fox-blush {
  0%, 65%, 87%, 100% { opacity: .5; } 72%, 79% { opacity: .75; }
}
@keyframes tibi-fox-mouth {
  0%, 67%, 84%, 100% { opacity: 0; } 70%, 81% { opacity: 1; }
}
@keyframes tibi-fox-mouth-shut {
  0%, 67%, 84%, 100% { opacity: 1; } 70%, 81% { opacity: 0; }
}
@keyframes tibi-fox-hop {
  0%, 68%, 79%, 100% { transform: translateY(0) scale(1); }
  71% { transform: translateY(0) scale(1.025, .975); }
  74% { transform: translateY(-4px) scale(.99, 1.015); }
  77% { transform: translateY(0) scale(1.015, .985); }
}
@keyframes tibi-fox-shadow {
  0%, 71%, 79%, 100% { transform: scaleX(1); opacity: .1; }
  74% { transform: scaleX(.92); opacity: .07; }
}
@media (prefers-reduced-motion: reduce), print {
  .hero-fox svg * { animation: none !important; transition: none !important; }
}
`;
  document.head.appendChild(style);
  host.innerHTML = `<svg viewBox="0 0 200 200" width="96" height="96" aria-hidden="true" focusable="false">
  <ellipse class="shadow" cx="100" cy="189" rx="54" ry="7" fill="currentColor" opacity=".1"/>
  <g class="all">
  <g class="tail">
    <path d="M128 170c38 6 66-18 60-48-4-16-24-18-27-3-2 10 3 19-1 28-4 10-14 16-32 23z" fill="${C.fur}"/>
    <path d="M161 119c-3-17 22-22 27-3-8 5-18 6-27 3z" fill="${C.cream}"/>
  </g>
  <g class="body">
    <path d="M50 150c0-30 22-48 50-48s50 18 50 48c0 22-18 34-50 34s-50-12-50-34z" fill="${C.fur}"/>
    <path d="M52 158c-4-18 4-34 16-42-4 16-4 36 4 58-10-3-17-8-20-16z" fill="${C.flank}"/>
    <path d="M148 158c4-18-4-34-16-42 4 16 4 36-4 58 10-3 17-8 20-16z" fill="${C.flank}"/>
    <ellipse cx="100" cy="154" rx="30" ry="26" fill="${C.cream}"/>
    <ellipse cx="80" cy="183" rx="15" ry="7" fill="${C.furDk}"/><ellipse cx="120" cy="183" rx="15" ry="7" fill="${C.furDk}"/>
    <g fill="${C.furDk}"><ellipse cx="78" cy="146" rx="9" ry="7.5"/><ellipse cx="122" cy="146" rx="9" ry="7.5"/></g>
  </g>
  <g class="head">
    <g class="ear-l"><path d="M48 60c-8-24-4-46 8-50 10-2 24 14 32 32z" fill="${C.fur}"/><path d="M57 50c-4-14-2-28 4-30 6 0 14 10 19 21z" fill="${C.inner}"/></g>
    <g class="ear-r"><path d="M152 60c8-24 4-46-8-50-10-2-24 14-32 32z" fill="${C.fur}"/><path d="M143 50c4-14 2-28-4-30-6 0-14 10-19 21z" fill="${C.inner}"/></g>
    <rect x="30" y="28" width="140" height="108" rx="50" fill="${C.fur}"/>
    <path d="M30 104c0-10 22-8 44-6 10 1 16 1 26 1s16 0 26-1c22-2 44-4 44 6 0 22-26 34-70 34s-70-12-70-34z" fill="${C.cream}"/>
    <g class="blush"><ellipse cx="52" cy="110" rx="11" ry="6" fill="${C.blush}"/><ellipse cx="148" cy="110" rx="11" ry="6" fill="${C.blush}"/></g>
    <g class="eyes">
      <circle cx="74" cy="80" r="19" fill="#fff"/><circle cx="126" cy="80" r="19" fill="#fff"/>
      <g class="pupils"><circle cx="76" cy="82" r="10" fill="${C.ink}"/><circle cx="124" cy="82" r="10" fill="${C.ink}"/><circle cx="80" cy="78" r="3.6" fill="#fff"/><circle cx="128" cy="78" r="3.6" fill="#fff"/></g>
      <path d="M57.8 70a19 19 0 0 1 32.4 0z" fill="${C.fur}"/><path d="M109.8 70a19 19 0 0 1 32.4 0z" fill="${C.fur}"/><path d="M58.5 70.6q15.5-3.6 31 0M110.5 70.6q15.5-3.6 31 0" stroke="${C.furDk}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </g>
    <path d="M90 100c0-6 20-6 20 0 0 6-6 10-10 10s-10-4-10-10z" fill="${C.ink}"/><ellipse cx="96" cy="100" rx="3" ry="1.8" fill="#fff" opacity=".6"/>
    <path class="m-shut" d="M100 110v4M100 114c-3 5-10 5-12 1M100 114c3 5 10 5 12 1" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    <g class="m-open"><path d="M88 113c3 14 21 14 24 0z" fill="${C.mouth}"/><path d="M94 121q6-5 12 0-6 5-12 0z" fill="${C.tongue}"/></g>
  </g>
  </g>
</svg>`;
})();
