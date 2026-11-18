# 网站与 App 分析工具调研

日期：2026-11-18（Asia/Singapore）。下文保留选型调研时的检查事实；用户随后授权实施，SDK 接入与后台配置的最新状态见 [分析方案](analytics-design.md)。

## 建议

优先试用 **Mixpanel 免费版作为产品分析主工具，配合 App Store Connect 的下载、来源和销售分析**。先在 ferecord 网站验证采集和报表，再决定是否扩展到画海与 Tibi 客户端。当前没有必须迁移到 PostHog 的需求，也没有必要同时接入多套统计 SDK。

如果主要问题只是“网站有多少访问、访客从哪里来、哪些文章受欢迎”，而且希望将采集和存储放在国内，改选 **国内自托管 Umami** 更直接；它需要单独运行服务和数据库。只有确实需要独立的网站流量看板时，再考虑与 Mixpanel 并存。

这项建议基于独立维护、多产品、优先低成本的现状，不以尚未确认的用户规模或流量作为依据。Mixpanel 与 PostHog 的境外云服务在大陆网络中的采集成功率，本次未实测；正式选择前需要验证。

## 当前项目与现有 Mixpanel

从当前工作区的依赖、源码检索与文档可见：

| 产品 | 当前技术与部署 | 分析重点 |
| --- | --- | --- |
| ferecord 主站、Tibi 官网 | HTML/CSS/JavaScript，EdgeOne Makers 静态发布 | 来源、访客、产品入口点击、下载入口点击 |
| 博客 | Astro 静态构建，独立子域名 | 文章访问、来源、阅读与产品导流 |
| 画海 | Vite/TypeScript/原生 DOM；iOS 为 Capacitor 与原生能力结合 | 作品浏览、细看使用、免费额度、支持者转化、留存 |
| Tibi | React + Tauri 2，Node.js Core；另有浏览器版 | 首次导入、阅读、查词、复习、回访；官网与应用内使用分开统计 |

在检查的项目依赖及主要源码范围内，没有发现已经接入的 Mixpanel、PostHog、Umami、Plausible、GA 或 Clarity 分析实现。这是本地源码检查，不代表线上发布文件的完整审计。

已通过 Chrome 登录态读取[用户提供的 Mixpanel 项目](https://mixpanel.com/project/4084746/view/4581503/app/home)：

- 项目显示为 **tumars**，视图为 **All Project Data**，项目 ID 为 `4084746`。
- 首页显示“未检测到事件”和首次接入引导。
- 事件页的“今天”及“30天”查询均显示 0 条结果；30 天查询检查了 All Events，未增加属性筛选。
- 30 天选项的时间提示为 `2026-10-18—2026-11-17 (GMT-8)`。这是读取时的报表范围，不应当作新加坡的自然日范围。接入时建议统一报表时区为 `Asia/Singapore` 或 `Asia/Shanghai`，然后固定日报口径。
- 会话回放页提示项目功能可用，但尚无回放数据。平台功能可用不表示客户端已经在录制或上传。
- 未确认该组织的实际套餐、免费项目数量、账单或数据驻留地区。

因此，当前能确定的是 **所查范围没有采集到可分析的事件**；不能从空项目推断网站没有访问，也不能据此证明已经正确接入。下一步应先验证一条真实生产事件的完整链路。

## 应分别回答什么问题

| 问题 | 数据与工具能力 |
| --- | --- |
| 有多少访问、从哪里来、看了哪些页面？ | 网站分析：页面浏览、访客、会话、referrer、UTM、入口页 |
| 用户完成了什么、在哪一步流失、过几天是否回来？ | 产品分析：业务事件、漏斗、分群、留存 |
| App 在商店被多少人看到、下载、购买？ | App Store Connect：商店获取、下载、销售、退款与使用指标 |
| 页面报错、崩溃、卡顿？ | 错误与性能监控，后续按需要独立评估；不以错误数替代用户行为分析 |

Mixpanel 可以使用页面事件和来源属性覆盖基础网站问题，未必需要另配网站统计。它提供 JavaScript SDK、自动采集、手动事件、UTM 和初始来源记录；网站看板仍需要按你的问题配置。[JavaScript SDK](https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript)、[来源归因](https://docs.mixpanel.com/docs/tracking-best-practices/traffic-attribution)

## 工具对比

以下价格与额度为本次读取的公开页面口径，均为美元；不是现有账户套餐核验结果，也不是采购报价。

| 工具 | 适合你的用途 | 成本与限制 | 判断 |
| --- | --- | --- | --- |
| **Mixpanel** | 网站与 App 的事件、漏斗、留存、使用路径 | 免费版每月最高 100 万事件，含漏斗与留存；公开页另列 1 万次会话回放。付费按套餐和用量计算 | **首选试用**。已有项目，核心需求匹配；先用少量业务事件即可 |
| **PostHog** | 希望一处管理网站分析、产品分析、回放、实验、功能开关与错误监控 | 每月 100 万分析事件免费；超额产品分析起价 $0.00005/事件。其他产品各有额度；无卡免费版当前只有 1 个项目 | **主要备选**。若明确需要实验、功能开关或开发工具整合，可优先选它；仅事件分析不足以构成迁移理由 |
| **Umami** | 主站、博客、产品官网的流量与转化；国内自托管 | 自托管需要服务器、Node.js 与 PostgreSQL。Cloud Hobby 当前为每月 10 万事件、1 个网站、6 个月留存；Pro $20/月，含 100 万事件、最多 20 个网站 | **网站流量备选**。国内托管便于控制位置，但维护、升级和备份由自己承担 |
| **Plausible** | 希望开箱即用、付费换简洁的网站流量报表 | 云服务为付费订阅，按流量与功能分档；站点数量、属性、API、漏斗等有套餐差异 | 适合主要分析网站的情况；对当前网站与 App 都要分析的需求，优先级低于 Mixpanel |
| **Firebase Analytics / GA4** | 已使用 Firebase 或重视 Google 营销与广告体系的产品 | Firebase Analytics 公开价格为 no-cost；其他 Firebase 服务及数据导出等按各自计费规则计算 | 可用，但当前项目未依赖 Firebase，接入与报表学习没有明显优势；大陆采集仍需验证 |
| **友盟 U-App** | 国内移动端的渠道、新增、留存与事件分析 | 官网提供免费体验，具体长期额度与付费边界需另查实际套餐 | 国内移动渠道运营成为重点时再深入评估；当前混合技术栈应先验证集成成本 |

依据：[Mixpanel 价格](https://mixpanel.com/pricing/)、[PostHog 价格与项目限制](https://posthog.com/pricing)、[PostHog 产品分析计费](https://posthog.com/product-analytics/pricing)、[Umami 价格](https://umami.is/pricing)、[Umami 自托管要求](https://docs.umami.is/docs/install)、[Plausible 价格与能力](https://plausible.io/)、[Firebase 价格](https://firebase.google.com/pricing)、[友盟移动统计](https://www.umeng.com/analytics)。

注意两点：

- Mixpanel 与 Umami 都已提供比旧印象更多的能力。Mixpanel 并非只能手动埋点，Umami 也不只提供 PV/UV；判断重点应是你的报表需求、客户端适配与维护成本。[Mixpanel 自动采集](https://docs.mixpanel.com/docs/tracking-methods/autocapture)、[Umami 文档](https://docs.umami.is/docs/collect-data)
- PostHog 官方文档中的 Capacitor 接入目前标记为第三方插件路线。画海与 Tibi 都需要额外检查生命周期、离线队列、存储与网络权限，不能把浏览器 SDK 能安装当作原生端验证完成。[PostHog Capacitor](https://posthog.com/docs/libraries/capacitor)

## Mixpanel 是否可以作为唯一主工具

可以先这样做。你真正需要的是三组报表：

1. **流量与导流**：各站点访客、来源、入口页、产品入口点击率、下载或商店入口点击率。
2. **激活与使用**：画海“打开作品 → 使用细看”，Tibi“成功导入 → 开始阅读 → 完成首次查词或复习”。
3. **留存与转化**：完成核心行为的用户是否在第 1、7、30 天回来；支持者入口与成功购买之间的转化。

Mixpanel 支持相应事件与留存分析。网站来源通过 UTM 与 referrer 采集，App 商店来源和下载继续由 Apple 的平台数据补充。Mixpanel 不会自动获得 App Store 的真实下载与完整收入，也不会自动将网站访客与之后安装的 App 用户关联起来。

若仅需主站与博客的阅读流量，Mixpanel 的报表配置成本可能高于 Umami/Plausible；若明确要多种开发与实验能力集中管理，PostHog 的价值会增加。

## 首批事件建议

先围绕能影响决策的问题选取约 10—15 个事件，分阶段覆盖产品；不是把下表所有项一次性上线。自动采集先限制在页面浏览等必要项，不直接采用文档中全量点击、全量回放的示例配置。

| 场景 | 候选事件 | 关键属性与口径 |
| --- | --- | --- |
| 网站流量 | `page_view` | `product`、`site`、规范化路径、来源域、允许的 UTM；过滤敏感查询参数 |
| 产品导流 | `product_link_clicked` | 目标产品、入口位置 |
| 下载与商店入口 | `download_link_clicked`、`app_store_link_clicked` | 产品、平台、入口位置；只能表示点击 |
| 画海作品 | `artwork_opened` | 稳定作品 ID、入口类型；不上传阅读或收藏清单 |
| 画海细看 | `close_look_started`、`close_look_completed` | 作品 ID、免费/样本/支持者等来源；完成必须先定义到达终点的标准 |
| 画海付费 | `paywall_viewed`、`purchase_started`、`purchase_succeeded` | 入口与商品 ID；成功以 StoreKit 验证交易为准，恢复购买单独计数，不传收据或 Apple 账号 |
| Tibi 激活 | `import_succeeded`、`reading_started` | 材料类型、内置示例/自行导入；不传文件名、完整 URL、标题或正文 |
| Tibi 核心使用 | `word_lookup_used`、`review_session_completed` | 词典/AI、复习数量等有限属性；不传原词、原句、答案或对话 |
| App 使用 | `app_opened` | 平台、版本、语言；过滤后台自动唤醒与重复生命周期回调 |

公共属性优先采用有限值：`product`、`platform`、`app_version`、`environment`、`locale`。开发、预览与测试流量应从生产报表排除；页面浏览只能有一个上报入口，避免 SDK 自动采集与手写事件重复。

正式实施前在各自仓库维护事件说明：事件名、触发位置、一次行为是否只触发一次、必要属性、是否涉及标识符。无需先搭建通用数据平台或跨仓库埋点框架。

## 隐私与指标边界

这里存在需要实际处理的产品约定：

- 相邻仓库的 `art-history-atlas/public/privacy.html` 明确适用于画海网站和 iOS App，并写着“不使用广告或第三方统计、追踪服务”；原生 `ios/App/App/PrivacyInfo.xcprivacy` 的收集类型也为空。新增统计需更新各语言政策、按实际 SDK 行为核对隐私清单，并维护 App Store Connect 的数据收集声明。
- 相邻仓库的 `tibi/README.md` 和 `tibi/PRIVACY.md` 宣称“不收集使用数据”。即使只上传随机安装 ID 和功能计数，也会改变这项承诺。建议客户端采用清晰、可关闭的自愿使用统计；这个建议基于本产品定位，不是宣称所有分析都依法必须采用同一种同意方式。
- 随机安装 ID 是持续标识符，不等于“完全匿名、不收集数据”。若要多日留存，需要识别同一安装或同一浏览器；若坚持不保留持续标识符，应接受留存分析的相应限制。
- 不采集文章、文件路径、私人 URL、搜索内容、词句、聊天内容、API Key、同步地址或购买收据。Tibi 首期不启用会话回放和页面文本自动采集，画海也优先只上报明确事件。
- App 是否需要 ATT 要看是否按 Apple 定义进行跨公司广告追踪、广告标识符访问等实际行为，不能简单把“有分析 SDK”等同于“必须弹 ATT”。数据收集声明与 ATT 是两项不同判断。[Apple 数据披露](https://developer.apple.com/app-store/app-privacy-details/)、[Apple 隐私与 ATT](https://developer.apple.com/app-store/user-privacy-and-data-use/)

另外，报表应保留以下解释：

- UV 是工具按浏览器或安装标识估计的访客，不能称为精确的自然人数；无账号时不承诺跨设备或跨网页/App 去重。
- 官网下载点击不等于下载完成、安装或首次启动；商店入口点击不等于购买。Tibi 下载完成可另参考 COS 日志，但 CDN 请求也不是自然人数。
- 离线使用、拒绝统计、广告拦截和网络失败都会影响覆盖率。App 需检查持久队列、事件原始时间、重试和去重；不能靠一个退后台上报调用保证完整采集。
- 购买事件用于产品漏斗，财务与退款以 Apple 平台报表为准。不要把“恢复购买成功”计作新购买。
- App Store Connect 的使用数据来自同意共享诊断和使用数据的用户，且存在隐私阈值；下载、销售、使用等指标按 Apple 各自定义理解，不把使用样本当全量用户。[Apple 分析面板与可用性说明](https://developer.apple.com/help/app-store-connect-analytics/overview/analytics-dashboard)

## 大陆网络与部署选择

主站部署在 EdgeOne，不意味着境外分析请求也自动经过国内服务。选型验证应分别覆盖脚本加载、事件发送、后台入库和弱网失败恢复，至少在真实大陆网络和海外网络各测一次，并记录成功率和额外延迟。

使用自己的域名代理是一个可选技术方案，但需要确认平台支持、部署维护与数据最小化；它不会改变事件最终进入境外云服务的事实，也不应绕过用户已表达的拒绝采集设置。[Mixpanel 采集主机配置](https://docs.mixpanel.com/docs/tracking-methods/autocapture)、[PostHog 代理文档](https://posthog.com/docs/advanced/proxy)

如果确定要求统计数据在国内存储，国内自托管 Umami 是网站部分可控的路线。它是独立动态应用与数据库，不能把它的源码或数据库放进当前 Makers 的静态 `public/` 发布目录。采用时需另外维护域名、服务、升级与备份，并按仓库约定更新 `docs/design.md` 与部署说明。

## 建议的实施顺序

1. **网站试点**：复用现有 Mixpanel 项目，先仅接 ferecord 主站，覆盖页面浏览、产品入口与下载/商店入口；配置生产环境、时区和来源报表，验证大陆与海外采集。
2. **补齐流量入口**：扩展博客和产品官网，明确站点属性，检查子域名间的来源和去重行为；不将主站跳转误记为新的外部获客。
3. **客户端决策与试点**：确认新增使用统计与现有隐私承诺的关系，先接一款 App 的少量核心事件。画海与 Tibi 的长期数据建议分产品项目维护；同产品按 `platform` 比较网页和客户端。创建前核对实际组织的项目数量与计费限制，不默认多项目都免费。
4. **形成固定看板**：每周查看来源、激活、7 日留存与支持者转化；有了足够样本后，再决定是否需要回放、实验或另一套流量工具。

首轮验收应看“真实操作对应一条正确事件、属性不含内容、关闭后不发送、断网恢复不重复、报表能回答问题”，而不是只检查 SDK 安装成功。留存要经过相应时间窗口才能获得有效数据，不应在接入当天承诺已有 7 日留存结论。

调研阶段只新增本文，未安装 SDK 或更改配置。后续已按用户授权实施，详见 [分析方案与验收记录](analytics-design.md)；本文中的空项目检查不代表实施后的状态。
