# Tibi 产品页设计约定

## 定位与页面结构

- 品牌固定为 **Tibi 提比**。首屏讲「读感兴趣的英文，让生词慢慢变熟悉」，紧接下载按钮、使用条件和真实阅读器界面。
- 页面顺序为：产品价值与阅读器 → 无需账号／本地优先／MIT 开源事实条 → 六步功能 → 完整应用截图 → 隐私说明 → 下载与安装说明。
- 不设置吉祥物介绍、角色故事或贴纸展示。已移除原 `#mascot`、首屏藏狐插画、浮动贴纸、隐私卡插画及相关 CSS／JavaScript。导航无吉祥物入口。只保留页头及真实应用界面中的品牌 Logo。
- 首屏图片与分享预览均使用阅读器截图；不增加虚构商店窗口、评价、用户数或媒体背书。
- 功能依次解释导入、标词、查词、AI 理解、复习、回看进步。图片旁保留来源说明，原型卡片各有可见「界面原型」标签。
- 「无需账号、本地优先、MIT 开源」依据产品仓库 README、PRIVACY 和使用指南；AI 请求会发给所配置的模型服务商，网页导入、订阅、首次模型包下载及主动同步也可能联网。平台和可选模型条件紧邻 CTA。
- 下载入口指向 GitHub Releases；安装与模型费用说明使用原生 details。保持域名 `https://tibi.ferecord.com` 和源码链接 `tumars/tibi`。

## 字体根因与修复（2026-11-01）

旧 AI／复习／统计功能图来自 `docs/prototypes/*.html`。其 `v2.css` 注册并回落到 Alibaba PuHuiTi 3.0，原采集日志也记录了普惠体子集下载。字体已被画进图片，修改落地页 CSS 无法修复。正式应用没有使用普惠体。

本轮直接读取只读产品仓库 `apps/desktop/src/styles.css` 的三个字体栈：

```css
--f-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
--f-read: Charter, "Bitstream Charter", "Charis SIL", Georgia, serif;
--f-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

- 真实界面优先：复用已有桌面 Web 构建的 `?mock=1` 截图调试模式，使用应用原生 React/CSS 与内置示例数据，不连接 Core、不访问个人学习记录，也不修改产品仓库。
- AI／统计 mock 接口不完整，复习 mock 的答案数据与当前界面有错位，因此这三张保留原型来源，不能称为真实应用实拍。
- 原型 CSS 在进入浏览器前移除 `@font-face` 和所有普惠体回落项，替换为上述精确字体栈；阻止第三方字体加载。源仓库文件保持只读。
- Mac Chrome headless 以 1280×800、DPR 2、浅色模式采集，等待 `document.fonts.ready` 及图片解码；通过 Chrome `CSS.getPlatformFontsForNode` 记录实际字体，并检查没有请求普惠体资源。
- 旧完整截图与产品仓库图片哈希一致，但位图不足以证明采集字体；本轮全部重新生成，不沿用旧图。

| 素材 | 本轮来源与展示内容 | 输出 |
| --- | --- | --- |
| import | 应用首页，滚动到导入框与继续阅读卡，避开欢迎插画 | 1200×750 / 600×375 WebP |
| mark | 应用阅读器，文章开头与生词标记 | 同上 |
| lookup | 应用阅读器，upshot 词卡与上下文 | 同上 |
| ai | 字体修正后的阅读器原型，原文与 AI 总结侧栏 | 同上 |
| review | 字体修正后的复习原型，原句选义 | 同上 |
| progress | 字体修正后的统计原型，指标与趋势 | 同上 |
| home / reader / words | 应用界面，内置示例数据 | 1920×1200 JPEG |

图片 alt 保留 Tibi／提比，查词词条与画面一致。首屏、功能区和截图区可见文案明确区分「应用界面 · 示例数据」与「界面原型」。

## 布局、交互与性能

- 保持中性暖白背景、白色卡片、深色主按钮和克制蓝色；首屏文案居中，完整阅读器横跨内容区。页面 UI 使用与应用一致的系统字体栈。
- 移动端从 320px 起可读；功能与隐私卡在 900px 以下两列、560px 以下单列，导航逐级精简。按钮至少 44px，360px 以下首屏按钮整行显示。
- 完整截图保留 8:5 原始比例，可打开原图；六张局部图为 16:10，每组提供 `.webp` 与 `.sm.webp`。首屏阅读器高优先级加载，其他图片懒加载，均声明宽高。
- 保留一次性显现动画、焦点样式与跳到正文入口。减少动态效果时关闭动画、位移和滚动过渡；JavaScript 禁用时内容完整可见。
- Swiper 11.2.10 距截图区 600px 内才从固定版本 CDN 加载。不自动播放、不循环，支持触摸、中文读屏提示、分页、前后按钮和区域内方向键；当前截图链接进入 Tab 顺序。
- 基础布局全在本地 CSS。CDN 失败或禁用脚本时回退静态截图网格；打印展开所有截图。已彻底删除 Three.js、WebGL 和贴纸动画，无对应网络请求。
- 无构建步骤，仅发布本站 `public/`。设计文档和截图脚本不发布；不更改 DNS、域名映射或其他站点。

## 重新采集

工具脚本：`scripts/capture-ui.cjs`。需要本机 Chrome、Node、Playwright 和 sharp；不为静态站增加运行时依赖。

先在两个终端分别启动只读本机服务（示例产品路径按实际位置设置）：

```sh
python3 -m http.server 8871 --bind 127.0.0.1 --directory /path/to/tibi/apps/desktop/dist
python3 -m http.server 8872 --bind 127.0.0.1 --directory /path/to/tibi/docs/prototypes
```

再运行：

```sh
TIBI_APP_PATH=/path/to/tibi node sites/tibi/scripts/capture-ui.cjs
```

如果依赖不在 Node 默认搜索路径，设置 `TIBI_CAPTURE_DEPS` 指向包含 playwright、sharp 的 node_modules；可用 `TIBI_CHROME` 指定 Chrome 可执行文件。脚本生成 15 张发布图片，字体报告和原型核对截图默认写入 `/tmp/tibi-capture-proof/`。

## 验证记录

- Chrome 实测 320、390、560、768、900、1280、1440px 七种宽度：增强前后均无横向溢出，图片加载成功，无页面脚本错误。
- 实际 CDN Swiper 验证通过：临近截图区才请求，前后按钮、分页、方向键与当前截图 Tab 顺序正常。CDN 阻断和禁用 JavaScript 时回退静态网格；减少动态效果时切换时长为零。
- 字体报告确认 PingFang SC、SF、Charter 与 Menlo；没有请求普惠体文件。全部 12 张 WebP 和 3 张 JPEG 尺寸正确，图片均有 alt 和宽高，页内锚点有效。
- 已逐张目视检查功能图，检查桌面与手机首屏、功能区截图；不添加 App Store 外壳。清除 32 张无引用的吉祥物 WebP，保留品牌 Logo。
- JavaScript 语法与 git diff 空白检查通过。本轮仅修改本地文件，未提交、推送或部署；DNS 与其他站点未改动。
