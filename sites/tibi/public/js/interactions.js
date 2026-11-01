const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 核心布局由本地 CSS 提供；CDN 不可用时继续展示完整的静态截图。
async function enhanceShots() {
  const root = document.querySelector('.shots-carousel');
  const viewport = root.querySelector('.shots-viewport');
  let swiper;
  try {
    const { default: Swiper } = await import('https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.mjs');
    swiper = new Swiper(viewport, {
      init: false,
      slidesPerView: 'auto',
      spaceBetween: 16,
      speed: motion.matches ? 0 : 450,
      grabCursor: true,
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
  }
}

function createHero(THREE) {
  const art = document.querySelector('.hero-art');
  const mount = art.querySelector('.hero-gl');
  // 创建失败时由调用方捕获；原始藏狐图片始终保留。
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.z = 5;
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x686878, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-2, 3, 4);
  scene.add(light);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d52e0, roughness: 0.65 }),
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.025, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8, transparent: true, opacity: 0.3 }),
  );
  ring.rotation.set(0.75, -0.35, 0);
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xf5a043, roughness: 0.75 }),
  );
  satellite.position.set(0.74, 0.32, 0.28);
  group.add(orb, ring, satellite);

  let frame = 0;
  let visible = !('IntersectionObserver' in window);
  let disposed = false;
  const target = { x: 0, y: 0 };

  function render() {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    group.rotation.x += (target.x - group.rotation.x) * 0.14;
    group.rotation.y += (target.y - group.rotation.y) * 0.14;
    renderer.render(scene, camera);
    if (Math.abs(target.x - group.rotation.x) + Math.abs(target.y - group.rotation.y) > 0.001) schedule();
  }
  function schedule() {
    if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }
  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function resize() {
    const size = mount.clientWidth;
    renderer.setSize(size, size, false);
    schedule();
  }
  function point(event) {
    const rect = art.getBoundingClientRect();
    target.x = ((event.clientY - rect.top) / rect.height - 0.5) * 0.5;
    target.y = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7;
    schedule();
  }
  function reset() {
    target.x = target.y = 0;
    schedule();
  }
  function visibility() {
    if (document.hidden) pause();
    else schedule();
  }
  function contextLost(event) {
    event.preventDefault();
    dispose();
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else pause();
  }) : null;

  function dispose() {
    if (disposed) return;
    disposed = true;
    pause();
    observer?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
    art.removeEventListener('pointermove', point);
    art.removeEventListener('pointerdown', point);
    art.removeEventListener('pointerleave', reset);
    art.removeEventListener('pointerup', reset);
    art.removeEventListener('pointercancel', reset);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    group.children.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  try {
    resize();
    // 首帧成功后才插入画布，不覆盖或替换静态素材。
    renderer.render(scene, camera);
    mount.append(renderer.domElement);
    observer?.observe(art);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    art.addEventListener('pointermove', point, { passive: true });
    art.addEventListener('pointerdown', point, { passive: true });
    art.addEventListener('pointerleave', reset);
    art.addEventListener('pointerup', reset);
    art.addEventListener('pointercancel', reset);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}

let disposeHero = () => {};
let heroRequest = 0;
async function enhanceHero() {
  const request = ++heroRequest;
  disposeHero();
  if (motion.matches) return;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    if (request === heroRequest && !motion.matches) disposeHero = createHero(THREE);
  } catch {
    // CDN、WebGL 或驱动不可用：沿用静态首屏。
  }
}

enhanceShots();
enhanceHero();
motion.addEventListener('change', enhanceHero);
