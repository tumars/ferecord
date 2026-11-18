import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core.js';

// Project Token 是公开采集标识，没有读取或管理权限。
const TOKEN = '7c4ccab05daa88f3048b7b6d6997e03c';
const KEY = 'ferecord.analytics.v1';
const tag = document.querySelector('script[data-analytics-site]');
const site = tag?.dataset.analyticsSite;
const hosts = { main: 'www.ferecord.com', blog: 'blog.ferecord.com', tibi: 'tibi.ferecord.com' };
const production = location.hostname === hosts[site];
const available = !!site && (production || new URLSearchParams(location.search).get('analytics-test') === '1');
const blocked = () => navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
const choice = () => { try { return localStorage.getItem(KEY); } catch { return 'deny'; } };
const enabled = () => available && !blocked() && choice() === 'allow';
const events = new Set(['page_view', 'product_link_clicked', 'download_link_clicked', 'app_store_link_clicked']);
const allowed = new Set(['token', 'distinct_id', '$device_id', '$insert_id', 'time', 'mp_lib', '$lib_version', 'product', 'site', 'platform', 'environment', 'locale', 'schema_version', 'page_path', 'referrer_domain', 'utm_source', 'utm_medium', 'utm_campaign', 'target_product', 'placement']);
let sdk;
let lastPage;

function connect() {
  if (!enabled()) return;
  if (!sdk) sdk = mixpanel.init(TOKEN, {
    api_host: 'https://api-js.mixpanel.com', persistence: 'localStorage', persistence_name: `ferecord_${site}`,
    autocapture: false, track_pageview: false, record_sessions_percent: 0,
    track_marketing: false, stop_utm_persistence: true, save_referrer: false, skip_first_touch_marketing: true, ip: false,
    opt_out_tracking_by_default: true, opt_out_tracking_cookie_prefix: `__ferecord_${site}_consent_`, cross_subdomain_cookie: false,
    hooks: { before_send_events: data => {
      if (!enabled() || !events.has(data.event)) return null;
      return { ...data, properties: Object.fromEntries(Object.entries(data.properties).filter(([key]) => allowed.has(key))) };
    } },
  }, `ferecord_${site}`);
  sdk.opt_in_tracking({ track: () => {} });
  return sdk;
}

function track(event, properties = {}) {
  if (!enabled() || !events.has(event)) return;
  try { connect()?.track(event, { ...properties, product: site === 'tibi' ? 'tibi' : 'ferecord', site, platform: 'web', environment: production ? 'production' : 'development', locale: document.documentElement.lang || 'zh-CN', schema_version: 1 }); } catch { /* 统计不能阻塞页面。 */ }
}

function page() {
  if (!enabled() || lastPage === location.pathname) return;
  lastPage = location.pathname;
  const properties = { page_path: location.pathname };
  try { properties.referrer_domain = new URL(document.referrer).hostname; } catch { properties.referrer_domain = 'direct'; }
  const query = new URLSearchParams(location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = query.get(key);
    if (value && /^[a-zA-Z0-9_.-]{1,80}$/.test(value)) properties[key] = value;
  }
  track('page_view', properties);
}

function setChoice(value) {
  try { localStorage.setItem(KEY, value); } catch { return false; }
  sync();
  return true;
}

function sync() {
  if (!enabled()) {
    lastPage = undefined;
    if (sdk) { sdk.reset(); sdk.opt_out_tracking({ clear_persistence: true, delete_user: false }); }
  } else page();
  document.querySelectorAll('[data-analytics-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.analyticsChoice === choice())));
  document.querySelectorAll('[data-analytics-prompt]').forEach(el => { el.hidden = !!choice() || blocked(); });
}

function mount() {
  if (!available || document.querySelector('[data-analytics-controls]')) return;
  const footer = document.querySelector('footer');
  if (!footer) return;
  const controls = document.createElement('div');
  controls.dataset.analyticsControls = '';
  controls.style.cssText = 'font:12px/1.7 system-ui;margin:12px auto;text-align:center;color:inherit';
  controls.innerHTML = `<span data-analytics-prompt>允许访问统计，帮助了解哪些页面有用？ </span><details style="display:inline-block;text-align:left"><summary style="cursor:pointer">访问统计</summary><p>仅在允许后向 Mixpanel 发送页面与入口点击、随机浏览器标识。不录屏、不采集输入内容。<a href="/privacy.html">隐私说明</a></p><button type="button" data-analytics-choice="allow">允许</button> <button type="button" data-analytics-choice="deny">关闭</button></details>`;
  footer.append(controls);
  sync();
}

if (available && !window.ferecordAnalytics) {
  window.ferecordAnalytics = { track, setChoice, enabled };
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-analytics-choice]');
    if (button) { setChoice(button.dataset.analyticsChoice); return; }
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    const target = url.hostname === 'tibi.ferecord.com' ? 'tibi' : url.pathname.startsWith('/art-history-atlas/') ? 'huahai' : null;
    const properties = { target_product: target || (site === 'tibi' ? 'tibi' : 'huahai'), placement: link.closest('header,nav') ? 'navigation' : link.closest('footer') ? 'footer' : 'content' };
    if (url.hostname === 'dl.ferecord.com' && /\.(dmg|zip|exe|msi|apk)$/.test(url.pathname)) track('download_link_clicked', properties);
    else if (url.hostname === 'apps.apple.com') track('app_store_link_clicked', properties);
    else if (target) track('product_link_clicked', properties);
  });
  addEventListener('storage', event => { if (event.key === KEY || event.key === null) sync(); });
  document.addEventListener('astro:page-load', () => { mount(); page(); });
  mount(); page();
}
