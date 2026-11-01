const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

function enhanceReveals() {
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.section-h, .value-band .section-kicker, .trust-bar li, .features .card, .hero-evidence, .shots-carousel, .privacy .card, .download');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer.unobserve(target);
      // 显现结束后移除延迟，悬停立即响应。
      target.addEventListener('transitionend', (event) => {
        if (event.target === target && event.propertyName === 'opacity') target.classList.remove('reveal');
      });
    });
  }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
  items.forEach((item) => {
    // 首次视口内的内容直接显示，尤其不延迟首页截图的呈现。
    if (item.getBoundingClientRect().top < window.innerHeight) return;
    observer.observe(item);
    item.classList.add('reveal');
  });
  motion.addEventListener('change', ({ matches }) => {
    if (!matches) return;
    observer.disconnect();
    items.forEach((item) => item.classList.remove('reveal'));
  });
}

function enhanceNavigation() {
  const header = document.querySelector('.top');
  const links = [...header.querySelectorAll('.nav a[href^="#"]')];
  // 按页面阅读顺序定位：界面 → 功能 → 隐私 → 下载，与页头导航一致。
  const sections = ['shots', 'features', 'privacy', 'download'].map((id) => document.getElementById(id));
  let scheduled = false;
  function update() {
    scheduled = false;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    const readingLine = header.offsetHeight + window.innerHeight * .25;
    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= readingLine) current = index;
    });
    // 下载区靠近页底，即使不足一整屏也能激活。
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.length - 1;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  update();
}

enhanceReveals();
enhanceNavigation();

// 核心布局由本地 CSS 提供；CDN 不可用时继续展示完整的静态截图。
async function enhanceShots() {
  const root = document.querySelector('.shots-carousel');
  const viewport = root.querySelector('.shots-viewport');
  let swiper;
  function updateShotLinks(instance) {
    // 只让当前截图进入 Tab 顺序，避免焦点落在视口外；其他截图仍可由按钮切换。
    instance.slides.forEach((slide, index) => {
      slide.querySelector('a').tabIndex = index === instance.activeIndex ? 0 : -1;
    });
  }
  try {
    const { default: Swiper } = await import('https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.mjs');
    swiper = new Swiper(viewport, {
      init: false,
      slidesPerView: 'auto',
      spaceBetween: 16,
      speed: motion.matches ? 0 : 450,
      grabCursor: true,
      on: { init: updateShotLinks, slideChange: updateShotLinks },
      navigation: {
        prevEl: root.querySelector('.shots-prev'),
        nextEl: root.querySelector('.shots-next'),
      },
      pagination: {
        el: root.querySelector('.shots-pagination'),
        clickable: true,
        renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="查看第 ${index + 1} 张截图"></button>`,
      },
      a11y: {
        containerRoleDescriptionMessage: '界面截图轮播',
        itemRoleDescriptionMessage: '截图',
        slideLabelMessage: '第 {{index}} 张，共 {{slidesLength}} 张',
        prevSlideMessage: '上一张截图',
        nextSlideMessage: '下一张截图',
        firstSlideMessage: '已到第一张截图',
        lastSlideMessage: '已到最后一张截图',
        paginationBulletMessage: '查看第 {{index}} 张截图',
      },
    });
    root.classList.add('is-enhanced');
    swiper.init();
    viewport.tabIndex = 0;
    viewport.setAttribute('aria-label', '界面截图，可用左右方向键切换');
    // 只在轮播获得焦点时处理方向键，不抢占整页键盘操作。
    root.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') swiper.slidePrev();
      else swiper.slideNext();
    });
    motion.addEventListener('change', () => {
      swiper.params.speed = motion.matches ? 0 : 450;
      if (motion.matches) swiper.slideTo(swiper.activeIndex, 0);
    });
  } catch {
    swiper?.destroy(true, true);
    root.classList.remove('is-enhanced');
    root.querySelectorAll('.shot a').forEach((link) => link.removeAttribute('tabindex'));
  }
}

// 轮播临近视口才加载；观察器不可用时仍能增强，CDN 失败则保留静态网格。
if ('IntersectionObserver' in window) {
  const shotsObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    shotsObserver.disconnect();
    enhanceShots();
  }, { rootMargin: '600px 0px' });
  shotsObserver.observe(document.querySelector('.shots-carousel'));
} else {
  enhanceShots();
}
