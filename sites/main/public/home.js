const root = document.querySelector('.universe');
const motionToggle = document.querySelector('.motion-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const starButton = document.querySelector('.curiosity-star');
const notice = document.querySelector('.scene-notice');
const caption = document.querySelector('.scene-caption-text');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let scene;
let loading;
let manuallyPaused = false;
let theme = 'day';
let focusedProject = null;
let messageTimer;

function updateCaption() {
  caption.textContent = focusedProject === 'tibi' ? '好奇心，从这一页开始。' : focusedProject === 'huahai' ? '下一幅画，会遇见什么？' : '保持好奇，慢慢创造';
}

function syncMotionControl() {
  const paused = manuallyPaused || motionPreference.matches;
  motionToggle.hidden = motionPreference.matches;
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.querySelector('.motion-label').textContent = paused ? '继续漂浮' : '暂停漂浮';
  document.body.classList.toggle('motion-paused', paused);
  scene?.setPaused(paused, motionPreference.matches);
  if (!motionPreference.matches) loadScene();
}

async function loadScene() {
  if (scene || loading || motionPreference.matches) return;
  root.dataset.sceneState = 'loading';
  loading = import('./assets/universe-scene.js').then(({ createUniverse }) => {
    scene = createUniverse({
      root,
      paused: manuallyPaused,
      reduced: motionPreference.matches,
      onReady() { starButton.hidden = false; },
      onStarPosition(x, y) { starButton.style.left = x.toFixed(1) + 'px'; starButton.style.top = y.toFixed(1) + 'px'; },
      onError() { starButton.hidden = true; },
    });
    scene.setTheme(theme);
    scene.setFocus(focusedProject);
    scene.setPaused(manuallyPaused || motionPreference.matches, motionPreference.matches);
  }).catch(() => {
    root.dataset.sceneState = 'fallback';
    starButton.hidden = true;
  });
}

motionToggle.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  syncMotionControl();
});

themeToggle.hidden = false;
themeToggle.addEventListener('click', () => {
  theme = theme === 'day' ? 'dusk' : 'day';
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dusk'));
  themeToggle.setAttribute('aria-label', theme === 'dusk' ? '切换为奶油白昼' : '切换为星海蓝调');
  themeToggle.querySelector('.theme-label').textContent = theme === 'dusk' ? '奶油白昼' : '星海蓝调';
  scene?.setTheme(theme);
});

document.querySelectorAll('.work-card').forEach(card => {
  const project = card.classList.contains('tibi-card') ? 'tibi' : 'huahai';
  const enter = () => {
    clearTimeout(messageTimer);
    focusedProject = project;
    scene?.setFocus(project);
    updateCaption();
  };
  const leave = () => { focusedProject = null; scene?.setFocus(null); updateCaption(); };
  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointerleave', leave);
  card.addEventListener('focusin', enter);
  card.addEventListener('focusout', leave);
});

starButton.addEventListener('click', () => {
  scene?.spark();
  caption.textContent = '好奇心，亮了一下。';
  notice.textContent = '你点亮了一颗好奇星。';
  clearTimeout(messageTimer);
  messageTimer = setTimeout(updateCaption, 2600);
});

motionPreference.addEventListener('change', syncMotionControl);
motionToggle.hidden = motionPreference.matches;
if (motionPreference.matches) document.body.classList.add('motion-paused');
if ('requestIdleCallback' in window) requestIdleCallback(loadScene, { timeout: 1400 });
else setTimeout(loadScene, 200);

window.addEventListener('pagehide', event => {
  clearTimeout(messageTimer);
  if (!event.persisted) scene?.dispose();
});
