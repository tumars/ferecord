import {
  BufferGeometry, CanvasTexture, Color, DirectionalLight, ExtrudeGeometry, Group,
  HemisphereLight, Line, LineBasicMaterial, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, OrthographicCamera, PlaneGeometry, Scene, Shape,
  SphereGeometry, SRGBColorSpace, TorusGeometry, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 角色保留选定的插画；这里负责真实 3D 环境，不改变角色和衣着。
export function createUniverse({ root, paused, reduced, onReady, onStarPosition, onError }) {
  const stage = root.querySelector('.work-stage');
  const planet = root.querySelector('.planet-scene');
  const host = root.querySelector('.scene-backdrop');
  const resources = new Set();
  const items = [];
  const orbits = [];
  const sparkles = [];
  const pointer = new Vector2();
  const smoothPointer = new Vector2();
  const state = { paused, reduced, theme: 'day', focus: null };
  let renderer;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let pulse = 0;
  let visible = true;
  let lost = false;
  let disposed = false;
  let settling = 0;
  let width = 0;
  let height = 0;
  let mobile = false;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3000);
  camera.position.z = 1500;
  const world = new Group();
  scene.add(world);
  const ambient = new HemisphereLight('#fff7e8', '#a2b9bb', 2.3);
  scene.add(ambient);
  const sunlight = new DirectionalLight('#fff0d7', 2.8);
  sunlight.position.set(-400, 600, 800);
  scene.add(sunlight);

  const track = value => { resources.add(value); return value; };
  const materials = new Map();
  function clay(color, metalness = 0) {
    const key = color + metalness;
    if (!materials.has(key)) materials.set(key, track(new MeshStandardMaterial({ color, roughness: .72, metalness })));
    return materials.get(key);
  }
  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const object = new Mesh(track(geometry), material);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function roundedBox(w, h, depth, radius, material, parent, x = 0, y = 0, z = 0) {
    const s = new Shape();
    const left = -w / 2, bottom = -h / 2;
    s.moveTo(left + radius, bottom);
    s.lineTo(left + w - radius, bottom);
    s.quadraticCurveTo(left + w, bottom, left + w, bottom + radius);
    s.lineTo(left + w, bottom + h - radius);
    s.quadraticCurveTo(left + w, bottom + h, left + w - radius, bottom + h);
    s.lineTo(left + radius, bottom + h);
    s.quadraticCurveTo(left, bottom + h, left, bottom + h - radius);
    s.lineTo(left, bottom + radius);
    s.quadraticCurveTo(left, bottom, left + radius, bottom);
    const geometry = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: .022, bevelThickness: .022, bevelSegments: 2, steps: 1, curveSegments: 4 });
    geometry.translate(0, 0, -depth / 2);
    return mesh(geometry, material, parent, x, y, z);
  }
  function book(color) {
    const group = new Group();
    const cover = clay(color);
    roundedBox(.77, 1, .055, .055, cover, group, 0, 0, -.085);
    roundedBox(.77, 1, .055, .055, cover, group, 0, 0, .085);
    roundedBox(.68, .90, .11, .025, clay('#fff7df'), group, .025);
    roundedBox(.07, .98, .21, .02, cover, group, -.36);
    roundedBox(.37, .016, .006, .004, clay('#d3bf88'), group, .03, .17, .122);
    roundedBox(.24, .012, .006, .004, clay('#d3bf88'), group, .03, .07, .122);
    return group;
  }
  function paintingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#dce6dc'; ctx.fillRect(0, 0, 128, 160);
    ctx.fillStyle = '#d8b46c'; ctx.beginPath(); ctx.arc(87, 42, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8babaf'; ctx.beginPath(); ctx.moveTo(0, 85); ctx.bezierCurveTo(45, 115, 70, 45, 128, 87); ctx.lineTo(128, 160); ctx.lineTo(0, 160); ctx.fill();
    ctx.fillStyle = '#426c87'; ctx.beginPath(); ctx.moveTo(0, 119); ctx.bezierCurveTo(42, 75, 76, 155, 128, 110); ctx.lineTo(128, 160); ctx.lineTo(0, 160); ctx.fill();
    const texture = track(new CanvasTexture(canvas));
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
  function pictureFrame() {
    const group = new Group();
    const gold = clay('#c5a76b', .28);
    roundedBox(1, 1.24, .08, .065, gold, group);
    const pictureMaterial = track(new MeshBasicMaterial({ map: paintingTexture() }));
    mesh(new PlaneGeometry(.84, 1.07), pictureMaterial, group, 0, 0, .065);
    return group;
  }
  function cloud() {
    const group = new Group();
    const mat = track(new MeshStandardMaterial({ color: '#e8eee9', roughness: 1, transparent: true, opacity: .76, depthWrite: false }));
    [[-.5, 0, .34], [-.12, .14, .45], [.32, .04, .37], [.66, -.05, .25]].forEach(([x, y, r]) => {
      const puff = mesh(new SphereGeometry(r, 20, 12), mat, group, x, y, 0);
      puff.scale.z = .7;
    });
    return group;
  }
  function starGeometry(size) {
    const shape = new Shape();
    [[0, .5], [.12, .12], [.5, 0], [.12, -.12], [0, -.5], [-.12, -.12], [-.5, 0], [-.12, .12]].forEach(([x, y], i) => {
      if (i) shape.lineTo(x * size, y * size); else shape.moveTo(x * size, y * size);
    });
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, { depth: size * .12, bevelEnabled: true, bevelSize: size * .035, bevelThickness: size * .035, bevelSegments: 2, steps: 1 });
    geometry.translate(0, 0, -size * .06);
    return geometry;
  }
  function addItem(object, kind, phase, rotation) {
    const item = { object, kind, phase, base: new Vector3(), rotation: new Vector3(...rotation), size: 1 };
    object.rotation.set(...rotation);
    world.add(object); items.push(item);
    return item;
  }
  const bookA = addItem(book('#657c95'), 'tibi', .5, [.2, -.45, -.28]);
  const bookB = addItem(book('#a5b39c'), 'tibi', 2.7, [-.3, .45, .33]);
  const frameA = addItem(pictureFrame(), 'huahai', 1.8, [.2, -.3, .23]);
  const frameB = addItem(pictureFrame(), 'huahai', 4.4, [-.15, .45, -.24]);
  const cloudA = addItem(cloud(), 'cloud', 1.4, [0, .1, -.1]);
  const cloudB = addItem(cloud(), 'cloud', 3.1, [0, -.1, .08]);
  function loadCloud() {
    new GLTFLoader().load(new URL('./soft-cloud.glb', import.meta.url).href, gltf => {
    if (disposed) {
      gltf.scene.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
      return;
    }
    gltf.scene.traverse(object => {
      if (object.geometry) track(object.geometry);
      if (object.material) track(object.material);
    });
    [cloudA, cloudB].forEach(item => { item.object.clear(); item.object.add(gltf.scene.clone(true)); });
    settle();
    }, undefined, () => { /* 简单云团可在模型加载失败时继续显示。 */ });
  }
  const saturn = new Group();
  mesh(new SphereGeometry(.45, 28, 18), clay('#c4d6ca'), saturn);
  const saturnRing = mesh(new TorusGeometry(.78, .025, 8, 64), clay('#c2b792', .15), saturn);
  saturnRing.rotation.set(1.05, .2, -.2);
  const saturnItem = addItem(saturn, 'planet', 3.5, [.2, -.1, -.23]);
  const starMaterial = track(new MeshStandardMaterial({ color: '#d7b66e', roughness: .5, metalness: .28, emissive: '#b17e26', emissiveIntensity: 0 }));
  const star = mesh(starGeometry(1), starMaterial, world);
  star.rotation.set(.12, -.25, -.12);

  ['tibi', 'huahai'].forEach(kind => {
    const lineMaterial = track(new LineBasicMaterial({ color: '#a9bdb4', transparent: true, opacity: .30 }));
    const line = new Line(track(new BufferGeometry()), lineMaterial);
    world.add(line); orbits.push({ line, kind });
  });
  const sparkleGeometry = track(starGeometry(1));
  const sparkleMaterial = track(new MeshBasicMaterial({ color: '#b9a273', transparent: true, opacity: .72 }));
  for (let i = 0; i < 12; i++) {
    const sparkle = new Mesh(sparkleGeometry, sparkleMaterial);
    world.add(sparkle); sparkles.push(sparkle);
  }
  const gold = new Color('#b8a177');
  const duskGold = new Color('#dfc58e');
  let focusAmount = 0;
  let themeAmount = 0;

  function position(item, x, y, z, size) {
    item.base.set(x - width / 2, height / 2 - y, z);
    item.size = size; item.object.scale.setScalar(size);
  }
  function resize() {
    if (disposed) return;
    mobile = root.clientWidth <= 760;
    const rr = root.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const pr = planet.getBoundingClientRect();
    width = root.clientWidth;
    height = Math.ceil(mobile ? sr.top - rr.top + 445 : sr.bottom - rr.top + 20);
    host.style.height = height + 'px';
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5, Math.sqrt(2200000 / (width * height)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.left = -width / 2; camera.right = width / 2;
    camera.top = height / 2; camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    const stageTop = sr.top - rr.top;
    const heroTop = pr.top - rr.top;
    const heroBottom = heroTop + pr.height;
    const tablet = width > 760 && width <= 900;
    const size = mobile ? .62 : Math.min(width / 1440, 1.1);
    position(bookA, mobile ? width * .12 : width * .315, mobile ? heroTop + 170 : tablet ? heroTop + 125 : stageTop + 155, 70, 54 * size);
    position(bookB, width * .14, mobile ? heroTop + 310 : stageTop + 624, 130, 34 * size);
    position(frameA, mobile ? width * .88 : width * .675, mobile ? heroTop + 110 : tablet ? heroTop + 110 : stageTop + 35, -45, 57 * size);
    position(frameB, width * .84, mobile ? heroTop + 300 : stageTop + 610, 100, 36 * size);
    position(cloudA, width * .04, mobile ? heroBottom - 30 : stageTop + 630, 180, 74 * size);
    position(cloudB, width * .86, mobile ? heroTop + 48 : stageTop - 18, -160, 60 * size);
    position(saturnItem, width * .10, mobile ? heroTop + 45 : stageTop - 30, -140, 41 * size);
    star.position.set(width * .88 - width / 2, height / 2 - (mobile ? heroTop + 28 : tablet ? heroTop + 100 : stageTop - 28), 75);
    star.scale.setScalar(mobile ? 21 : 25);
    const centerY = mobile ? heroTop + pr.height * .65 : stageTop + 340;
    orbits.forEach(({ line }, index) => {
      const coords = [];
      const radius = mobile ? width * .57 : width * .43;
      const oval = mobile ? 67 : 165;
      for (let i = 0; i <= 180; i++) {
        const a = i / 180 * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * oval + Math.cos(a) * (index ? -100 : 70);
        coords.push(new Vector3(x, height / 2 - centerY + y, Math.sin(a) * 180 - 90 - index * 30));
      }
      line.geometry.dispose(); resources.delete(line.geometry);
      line.geometry = track(new BufferGeometry().setFromPoints(coords));
    });
    sparkles.forEach((object, i) => {
      const x = width * (.12 + ((i * .287) % .76));
      const y = stageTop + ((i * 117) % (mobile ? 370 : 650));
      object.position.set(x - width / 2, height / 2 - y, -220 + i * 17);
      object.scale.setScalar(i % 3 ? 3 : 6);
    });
    settle();
  }
  function settle() {
    if (disposed) return;
    settling = state.paused || state.reduced ? 1 : 24;
    requestFrame();
  }
  function requestFrame() {
    if (!disposed && !lost && visible && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }
  function render(now) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    const moving = !state.paused && !state.reduced;
    const delta = last ? Math.min((now - last) / 1000, .05) : 0;
    if (moving && mobile && delta < 1 / 31 && last) { requestFrame(); return; }
    last = now;
    if (moving) elapsed += delta;
    const immediate = state.paused || state.reduced;
    smoothPointer.lerp(immediate ? new Vector2() : pointer, immediate ? 1 : .07);
    camera.position.x = smoothPointer.x * 28;
    camera.position.y = smoothPointer.y * 16;
    camera.lookAt(0, 0, 0);
    world.rotation.y = smoothPointer.x * .018;
    world.rotation.x = -smoothPointer.y * .012;
    root.style.setProperty('--parallax-x', (smoothPointer.x * 7).toFixed(2) + 'px');
    root.style.setProperty('--parallax-y', (-smoothPointer.y * 4).toFixed(2) + 'px');
    focusAmount += ((state.focus ? 1 : 0) - focusAmount) * (immediate ? 1 : .12);
    themeAmount += ((state.theme === 'dusk' ? 1 : 0) - themeAmount) * (immediate ? 1 : .08);
    items.forEach(item => {
      const active = state.focus === item.kind;
      const offset = active ? focusAmount * (item.base.x < 0 ? 14 : -14) : 0;
      item.object.position.set(item.base.x + offset, item.base.y + (moving ? Math.sin(elapsed * .55 + item.phase) * (item.kind === 'cloud' ? 6 : 4) : 0), item.base.z);
      item.object.rotation.z = item.rotation.z + (moving ? Math.sin(elapsed * .3 + item.phase) * .045 : 0);
      item.object.scale.setScalar(item.size * (active ? 1 + focusAmount * .1 : 1));
    });
    orbits.forEach(({ line, kind }) => {
      line.material.color.copy(gold).lerp(duskGold, themeAmount);
      line.material.opacity = state.focus === kind ? .60 : .25 + themeAmount * .12;
    });
    sparkleMaterial.color.copy(gold).lerp(duskGold, themeAmount);
    sparkles.forEach((object, i) => { object.rotation.z = moving ? Math.sin(elapsed * .3 + i) * .2 : 0; });
    pulse = moving ? Math.max(0, pulse - delta * 1.2) : 0;
    const starSize = mobile ? 21 : 25;
    star.scale.setScalar(starSize * (1 + Math.sin(pulse * Math.PI) * .4));
    starMaterial.emissiveIntensity = .05 + themeAmount * .22 + pulse;
    ambient.intensity = 2.3 - themeAmount * .6;
    sunlight.intensity = 2.8 - themeAmount * .6;
    renderer.render(scene, camera);
    const p = star.getWorldPosition(new Vector3()).project(camera);
    onStarPosition((p.x * .5 + .5) * width, (-p.y * .5 + .5) * height);
    settling--;
    if (moving || settling > 0) requestFrame();
  }
  function pointerMove(event) {
    if (event.pointerType !== 'mouse' || state.paused || state.reduced) return;
    const rect = host.getBoundingClientRect();
    pointer.set(Math.max(-1, Math.min(1, (event.clientX - rect.left) / width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / Math.min(height, innerHeight) * 2)));
  }
  const pointerLeave = () => { pointer.set(0, 0); settle(); };
  const visibilityChange = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!document.hidden) settle();
  };
  const contextLost = event => {
    event.preventDefault(); lost = true;
    cancelAnimationFrame(frame); frame = 0;
    root.dataset.sceneState = 'fallback';
    onError();
  };
  const contextRestored = () => {
    lost = false; last = 0;
    resize(); renderer.render(scene, camera);
    root.dataset.sceneState = 'ready'; onReady(); settle();
  };
  let observer, resizeObserver;
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect(); resizeObserver?.disconnect();
    root.removeEventListener('pointermove', pointerMove);
    root.removeEventListener('pointerleave', pointerLeave);
    document.removeEventListener('visibilitychange', visibilityChange);
    renderer?.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer?.domElement.removeEventListener('webglcontextrestored', contextRestored);
    resources.forEach(value => value.dispose());
    renderer?.dispose(); renderer?.domElement.remove();
    root.style.removeProperty('--parallax-x'); root.style.removeProperty('--parallax-y');
  }
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    host.append(renderer.domElement);
    resize();
    renderer.render(scene, camera);
    root.dataset.sceneState = 'ready';
    onReady();
    loadCloud();
    root.addEventListener('pointermove', pointerMove, { passive: true });
    root.addEventListener('pointerleave', pointerLeave);
    document.addEventListener('visibilitychange', visibilityChange);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else settle();
    });
    observer.observe(host);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
  } catch (error) { dispose(); throw error; }
  return {
    setPaused(value, reduce) { state.paused = value; state.reduced = reduce; root.dataset.sceneMotion = value || reduce ? 'paused' : 'running'; pointer.set(0, 0); settle(); },
    setTheme(value) { state.theme = value; settle(); },
    setFocus(value) { state.focus = value; root.dataset.sceneFocus = value || ''; settle(); },
    spark() { if (!state.paused && !state.reduced) { pulse = 1; settle(); } },
    dispose,
  };
}
