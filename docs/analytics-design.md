# 网站与 App 使用分析

2026-11-18。选型依据见 [调研](analytics-research-2026-11-18.md)。本文记录已授权实施的方案；实际验证与发布状态在文末更新。

## 范围与口径

使用 Mixpanel 官方 JavaScript SDK 2.86.0 的 core loader，不打包回放与实验模块。首版共用现有 `tumars` 项目（4084746，US），以 `product`、`site`、`platform` 区分主站、博客、官网、画海和 Tibi。项目不保存姓名、邮箱、广告 ID，不做跨设备身份合并。网站每个来源域独立保存随机浏览器标识；App 按本机安装标识统计，不能把 UV 称为精确自然人数。

所有入口均主动选择后才发送统计，客户端默认关闭；网站提供轻量选择与常驻的“访问统计”设置入口，应用在设置里提供“使用统计”。关闭会停止采集并清除 SDK 的本地标识与待发队列；其他标签页同步关闭。DNT / GPC 请求被尊重。统计失败不影响内容和业务操作。

SDK 随站点或应用打包，关闭自动点击、页面自动采集、回放、热图、营销参数自动采集、完整来源 URL 和页面 URL。只发送下表允许的事件与属性；IP 地理解析关闭。服务器接收连接时仍会看到网络 IP，不能宣传为“不上传任何信息”。仅网站手动读取来源域、规范化公开路径及白名单 UTM；不发送查询词、自由文本、完整链接、文件名、文章、生词、对话、密钥或收据。

主站、博客、Tibi 官网各自发布自己的统计 bundle 和隐私说明，不依赖另一个站点目录。画海统计从源码仓库构建同步，不能直接编辑 ferecord 的画海发布产物。

## 事件

| 事件 | 触发 | 附加属性 |
| --- | --- | --- |
| `page_view` | 网站初次加载、博客路由切换 | `page_path`、`referrer_domain`、白名单 UTM |
| `product_link_clicked` | 主站或博客进入产品 | `target_product`、`placement` |
| `download_link_clicked` | 官网下载安装包入口 | `target_product`、`placement`；仅表示点击 |
| `app_store_link_clicked` | 进入 Apple 商店 | `target_product`、`placement`；仅表示点击 |
| `app_opened` | 已开启统计的应用启动 | 平台、版本、语言 |
| `artwork_opened` | 画海打开作品 | `artwork_id` |
| `close_look_started` | 画海进入细看 | `artwork_id` |
| `paywall_viewed` | 画海打开付费页 | `entry_type`，有限分类 |
| `purchase_succeeded` / `purchase_restored` | 原生购买流程成功返回 | 不上传交易收据或交易 ID；恢复不计新购买 |
| `import_succeeded` | Tibi 导入完成事件成功且非重复 | 不上传导入内容或来源 |
| `word_lookup_used` | Tibi 成功查词 | 无文本属性 |
| `review_answered` | Tibi 成功提交复习答案 | 无原词、答案或评分属性 |

公共属性为 `product`、`site`、`platform`、`environment`、`locale`、`app_version`、`schema_version`。SDK 的必要协议字段与随机标识允许通过，其余默认属性在发送前白名单过滤。主站、博客、官网和应用使用 SDK 持久队列负责短时断网重试；画海网页采用即时发送，避免与同源主站的按 token 命名的队列互相消费，不保证离线补发。各 SDK 使用独立的 SDK 同意标记前缀，避免同一域名的产品互相撤回或开启。不开设自建数据平台或额外重试框架。

生产网站仅在登记的正式域名启用。开发默认不采集，显式本地验收使用 `analytics-test=1`，事件带 `environment=development`，生产看板必须过滤 `environment=production`。应用的开发构建同样默认不发送。

## 看板与维护

首版看板包含：每日访问人数、页面浏览量、站点分布、来源域、产品导流、下载/商店入口点击、核心事件。客户端积累足够样本后再建立激活漏斗与 7 日留存；不用测试事件冒充真实用户增长。App 商店下载、销售、退款沿用 App Store Connect。

已保存 [ferecord · 网站与产品分析](https://mixpanel.com/project/4084746/view/4581503/app/boards#id=11657077)，共四份报告：页面浏览唯一用户趋势（按 site）、网站页面浏览次数（按 site）、网站来源（按 referrer_domain）、产品功能与导流事件（All Events，按事件名称和 product）。统一过滤 `environment=production`，过去 30 天。只有开发验收数据时生产报表应为空。

项目时区统一 UTC+8；保留免费套餐，不添加支付方式、付费功能或公共分享。项目令牌是 SDK 使用的公开采集标识，不具备读取或管理数据的权限；不提交服务账号、API Secret 或个人认证信息。

画海与 Tibi 的隐私政策、界面说明必须与“默认关闭、可选使用统计”一致；画海的隐私清单与 App Store Connect 数据披露需按实际收集行为更新。没有广告归因，不使用 IDFA，不因普通产品分析自动要求 ATT。

## 实施与验收状态

本轮提交与发布：主站、博客、Tibi 官网为 ferecord `4e28300`，线上 HTML、隐私页与统计 bundle 已逐站验证，bundle 与提交产物一致。主站 Makers 部署 `dpseh2lj411z` 成功。Tibi `3a87ec4` 的 Web 工作流 [44352921670](https://github.com/tumars/tibi/actions/runs/44352921670) 成功，部署 `dpncru8xpdad`；完整 CI 也成功。本地 Node 22 下 60 个测试文件全部通过（342 passed、1 skipped），默认 Node 23 的运行时兼容失败不作为发布结果。

画海网站源码为 `e5225cd`、隐私政策补充 `b0a660c`。GitHub 工作流 [44352919463](https://github.com/tumars/art-history-atlas/actions/runs/44352919463) 因账户付款失败或额度限制未能启动构建，因此采用本地独立工作区的 `npm ci && npm run build` 产物同步到 ferecord，保留 `source-version.txt` 作为验收依据，没有更改支付或额度设置。完整 App 统计另提交在 `codex/huahai-app-analytics-20261118`（`781c71c`，基于本地 App 基线 6ab3945）；其 `npm run build:app` 与 Capacitor 同步通过，未上传或发布新原生 App。

代码已接入，发布时从各仓库远端 main 创建独立工作区，只带入统计相关改动。画海网站以 6d5c0b5 为基线，不带入本地领先的 12 个提交与其他未提交功能，因此本次网站实际发送页面、作品打开和商店入口点击；完整 App 的细看、购买、恢复事件随原生版本发布。Mixpanel 时区已保存为 `Asia/Singapore`，US 驻留，未添加支付方式或公共分享。

2026-11-18 验证：

- `sites/main/scripts/check-analytics.mjs` 使用真实 SDK 与浏览器、拦截采集请求，验证选择前零上报、真实入口点击、路由去重、UTM 与属性过滤、离线补发、跨标签页撤回、待发队列清除、标识重置、DNT/GPC，全部通过。
- `sites/main/scripts/check-product-analytics.mjs` 在画海和 Tibi 的 Vite 服务上加载实际 SDK 模块，验证默认关闭、有限事件、未知事件和敏感属性过滤、开发环境标记、关闭后停止发送、清除标识和重新允许，全部通过。
- 另通过真实 SDK 向实际项目发送了少量 `environment=development` 的网站、画海与 Tibi 验收事件，API 返回 HTTP 200、`status=1`；Mixpanel 事件选择器已出现 `page_view`、`artwork_opened` 等事件。此为开发验收，不是生产用户流量。
- 主站脚本检查、画海网站构建、画海 App 网页包及 Capacitor iOS 同步、Tibi 桌面/移动网页包构建通过；画海隐私清单 `plutil -lint` 通过。没有做本轮 Xcode 原生编译、Tauri 原生编译、真机安装或真实购买。
- 博客原锁文件存在 Astro markdown 依赖与 MDX peer 不匹配，已仅修复这部分锁定关系，保持 Astro 7.4.4。`npm ci --ignore-scripts`、Node 24.18.0 下完整 `npm run build` 通过（Astro 检查 0 errors/warnings/hints、静态构建与 Pagefind）。生成的 SDK bundle 从 Astro 源码诊断范围排除。

复现：先在 `sites/main` 运行 `npm ci && npm run build:analytics`，会为三个独立站点各生成自己的 `public/assets/analytics.js`。测试需要可用的 Playwright/Chrome，设置 `PLAYWRIGHT_MODULE` 指向现有 Playwright 包；产品模块检查要求画海服务在 5181、Tibi 服务在 5182。

大陆真实网络、原生生命周期与存储恢复、StoreKit 真交易及新 App 发布尚未验证。发布包含统计的新画海构建前还需同步 App Store Connect 数据披露；已发布旧构建仍不含 SDK。
