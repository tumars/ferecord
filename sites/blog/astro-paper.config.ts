import { defineAstroPaperConfig } from "./src/types/config";

// 填写网站真实的 ICP 备案号后，页脚会自动显示备案链接。
export const ICP_RECORD = "";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.ferecord.com/",
    title: "FErecord · Blog",
    description: "记录想法、实践与探索。",
    author: "tumars",
    profile: "https://www.ferecord.com/",
    ogImage: "social.png",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: { perPage: 10, perIndex: 6, scheduledPostMargin: 0 },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [],
});
