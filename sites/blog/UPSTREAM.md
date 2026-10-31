# AstroPaper 来源

- 上游仓库：https://github.com/satnaing/astro-paper
- 基础版本：v7.0.0（官方发布归档，2026-10-31 接入）。
- 许可证：MIT，原文保留在 `LICENSE`。
- 本项目只引入主题源码，未引入上游示例文章、截图、GitHub 工作流和部署身份。
- 定制：中文界面、ferecord 配色、系统字体、静态分享图、ICP 页脚入口、草稿本地预览和写作脚本。
- 动态 OG 图片已关闭并移除生成路由，避免构建依赖远程字体；文章仍可通过 `ogImage` 指定分享图。
- 依赖的精确解析版本由 `package-lock.json` 固定，部署使用 `npm ci`。升级时一起核对主题、Astro 和 Node.js 版本。
