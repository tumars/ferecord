/* 提比首屏装饰：改编自产品 apps/desktop/src/lib/fox.js。
   保留原造型、配色与 idle 动画；移除其他状态、交互和 React 依赖。
   固定尺寸容器内替换 WebP，脚本不可用时保留原图。 */
(() => {
  const host = document.querySelector('.hero-fox');
  if (!host) return;

  const C = { fur: '#f5a043', furDk: '#e3842a', cream: '#fff4e2', flank: '#cfc3b4', inner: '#ffc7a6', ink: '#2b1f17', blush: '#ff8f7d' };
  const style = document.createElement('style');
  style.textContent = `
.hero-fox svg { display: block; overflow: visible; }
.hero-fox svg * { transform-box: view-box; }
.hero-fox .tail { transform-origin: 130px 168px; animation: tibi-fox-tail 3s ease-in-out infinite; }
.hero-fox .body { transform-origin: 100px 182px; animation: tibi-fox-breathe 3.4s ease-in-out infinite; }
.hero-fox .head { transform-origin: 100px 140px; animation: tibi-fox-bob 3.4s ease-in-out infinite; }
.hero-fox .ear-r { transform-origin: 134px 46px; animation: tibi-fox-ear 6.5s infinite; }
.hero-fox .eyes { transform-origin: 100px 80px; animation: tibi-fox-blink 4.8s infinite; }
@keyframes tibi-fox-tail { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg); } }
@keyframes tibi-fox-breathe { 50% { transform: scale(1.02, .985); } }
@keyframes tibi-fox-bob { 50% { transform: translateY(1.5px); } }
@keyframes tibi-fox-blink { 0%, 90%, 100% { transform: scaleY(1); } 92% { transform: scaleY(.1); } 94% { transform: scaleY(1); } }
@keyframes tibi-fox-ear { 0%, 86%, 100% { transform: rotate(0); } 89% { transform: rotate(14deg); } 92% { transform: rotate(-4deg); } }
@media (prefers-reduced-motion: reduce) {
  .hero-fox svg * { animation: none !important; transition: none !important; }
}
@media print { .hero-fox svg * { animation: none !important; } }
`;
  document.head.appendChild(style);
  host.innerHTML = `<svg viewBox="0 0 200 200" width="96" height="96" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="189" rx="54" ry="7" fill="currentColor" opacity=".1"/>
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
    <g><path d="M48 60c-8-24-4-46 8-50 10-2 24 14 32 32z" fill="${C.fur}"/><path d="M57 50c-4-14-2-28 4-30 6 0 14 10 19 21z" fill="${C.inner}"/></g>
    <g class="ear-r"><path d="M152 60c8-24 4-46-8-50-10-2-24 14-32 32z" fill="${C.fur}"/><path d="M143 50c4-14 2-28-4-30-6 0-14 10-19 21z" fill="${C.inner}"/></g>
    <rect x="30" y="28" width="140" height="108" rx="50" fill="${C.fur}"/>
    <path d="M30 104c0-10 22-8 44-6 10 1 16 1 26 1s16 0 26-1c22-2 44-4 44 6 0 22-26 34-70 34s-70-12-70-34z" fill="${C.cream}"/>
    <ellipse cx="52" cy="110" rx="11" ry="6" fill="${C.blush}" opacity=".5"/><ellipse cx="148" cy="110" rx="11" ry="6" fill="${C.blush}" opacity=".5"/>
    <g class="eyes">
      <circle cx="74" cy="80" r="19" fill="#fff"/><circle cx="126" cy="80" r="19" fill="#fff"/>
      <circle cx="76" cy="82" r="10" fill="${C.ink}"/><circle cx="124" cy="82" r="10" fill="${C.ink}"/><circle cx="80" cy="78" r="3.6" fill="#fff"/><circle cx="128" cy="78" r="3.6" fill="#fff"/>
      <path d="M57.8 70a19 19 0 0 1 32.4 0z" fill="${C.fur}"/><path d="M109.8 70a19 19 0 0 1 32.4 0z" fill="${C.fur}"/><path d="M58.5 70.6q15.5-3.6 31 0M110.5 70.6q15.5-3.6 31 0" stroke="${C.furDk}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </g>
    <path d="M90 100c0-6 20-6 20 0 0 6-6 10-10 10s-10-4-10-10z" fill="${C.ink}"/><ellipse cx="96" cy="100" rx="3" ry="1.8" fill="#fff" opacity=".6"/>
    <path d="M100 110v4M100 114c-3 5-10 5-12 1M100 114c3 5 10 5 12 1" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;
})();
