import{b as a,e as p,$ as o}from"./index-C5NtlbJX.js";const t="/art-history-atlas/assets/icon-Dae1WWug.webp",e="/art-history-atlas/assets/app-store-qr-D1KDAKyL.png";function i(){const r=document.querySelector("#ios-app");r.innerHTML=`<div class="app-promo-inner">
    <img class="app-promo-icon" src="${t}" alt="" width="64" height="64" loading="lazy">
    <div class="app-promo-copy">
      <div class="app-promo-brand">${a("画海 iOS App")}</div>
      <h2 id="app-promotion-title">${a("把画海带在身边")}</h2>
      <ul class="app-promo-features"><li>${a("细看作品")}</li><li>${a("问题导读")}</li><li>${a("收藏作品")}</li><li>${a("离线浏览")}</li></ul>
    </div>
    <div class="app-promo-download">
      <div class="app-promo-store">
        <a class="app-store-button" href="${p(o.appStore)}" target="_blank" rel="noopener noreferrer">${a("在 App Store 下载")} <span aria-hidden="true">↗</span></a>
        <span class="tipw"><button type="button" class="tip app-promo-info" aria-label="${a("下载与地区说明")}" aria-expanded="false" aria-controls="app-download-note" aria-describedby="app-download-note">①</button><span class="tip-pop" id="app-download-note" role="tooltip" hidden>${a("中国大陆 App Store 暂未上架")}<br>${a("App 备案办理中，目前可在其他已上架地区下载。")}</span></span>
      </div>
      <a class="app-promo-qr" href="${p(o.appStore)}" target="_blank" rel="noopener noreferrer" aria-labelledby="app-qr-label"><img src="${e}" alt="" width="96" height="96" loading="lazy"><span id="app-qr-label">${a("扫码下载")}</span></a>
    </div>
  </div>`}export{i as initAppPromotion};
