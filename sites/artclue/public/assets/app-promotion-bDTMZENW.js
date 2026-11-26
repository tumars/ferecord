import{V as a,b as p,e as o}from"./index-CCu4aE--.js";import{a as i}from"./icon-B2CJkcmJ.js";const e="/assets/app-store-qr-CdcrmmhH.png";function n(){const r=document.querySelector("#ios-app");if(r){if(!a.appStore){r.hidden=!0;return}r.innerHTML=`<div class="app-promo-inner">
    <img class="app-promo-icon" src="${i}" alt="" width="64" height="64" loading="lazy">
    <div class="app-promo-copy">
      <div class="app-promo-brand">iOS App</div>
      <h2 id="app-promotion-title">${p("画海 iOS App")}</h2>
      <ul class="app-promo-features"><li>${p("细看作品")}</li><li>${p("每日一画小组件")}</li><li>${p("策展分享卡片")}</li><li>${p("离线浏览")}</li></ul>
    </div>
    <div class="app-promo-download">
      <a class="app-store-button ui-btn ui-btn--primary ui-btn--lg" href="${o(a.appStore)}" target="_blank" rel="noopener noreferrer">${p("在 App Store 下载")} <span aria-hidden="true">↗</span></a>
      <a class="app-promo-qr" href="${o(a.appStore)}" target="_blank" rel="noopener noreferrer" aria-labelledby="app-qr-label"><img src="${e}" alt="" width="96" height="96" loading="lazy"><span id="app-qr-label">${p("扫码下载")}</span></a>
    </div>
  </div>`}}export{n as initAppPromotion};
