import{S as r,b as p,e as o,t}from"./index-CYRP7F8P.js";import{Q as e}from"./hero-space-qaL62UhT.js";import{a as l}from"./icon--KcKB9Tc.js";const s="/art-history-atlas/assets/app-store-qr-D1KDAKyL.png";function c(){const a=document.querySelector("#ios-app");if(!a)return;if(!r.appStore){a.hidden=!0;return}const i=`${p("中国大陆 App Store 暂未上架")}<br>${p("App 备案办理中，目前可在其他已上架地区下载。")}`;a.innerHTML=`<div class="app-promo-inner">
    <img class="app-promo-icon" src="${l}" alt="" width="64" height="64" loading="lazy">
    <div class="app-promo-copy">
      <div class="app-promo-brand">iOS App</div>
      <h2 id="app-promotion-title">${p("画海 iOS App")}</h2>
      <ul class="app-promo-features"><li>${p("细看作品")}</li><li>${p("问题导读")}</li><li>${p("收藏作品")}</li><li>${p("离线浏览")}</li></ul>
    </div>
    <div class="app-promo-download">
      <div class="app-promo-store">
        <a class="app-store-button ui-btn ui-btn--primary ui-btn--lg" href="${o(r.appStore)}" target="_blank" rel="noopener noreferrer">${p("在 App Store 下载")} <span aria-hidden="true">↗</span></a>
        ${e(i,"app-download-note",{label:t("下载与地区说明"),className:"app-promo-info",html:!0})}
      </div>
      <a class="app-promo-qr" href="${o(r.appStore)}" target="_blank" rel="noopener noreferrer" aria-labelledby="app-qr-label"><img src="${s}" alt="" width="96" height="96" loading="lazy"><span id="app-qr-label">${p("扫码下载")}</span></a>
    </div>
  </div>`}export{c as initAppPromotion};
