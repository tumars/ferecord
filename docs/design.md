# ferecord 多产品站点设计

## 目标与范围

ferecord 的含义是「前端记录」（front-end + record）。品牌标识以代码左尖括号、三行手记与暖金色记录点组合，首页左上角搭配小写字标和中文释义；图形不绑定某一件产品或首页的星球场景。设计依据与使用规则见 [Logo 设计记录](logo-2026-11-17.md)。

主要面向中国大陆用户，使用已有腾讯云备案域名和 EdgeOne Makers，低成本展示多个产品。主站以独立创作者的作品墙呈现 Tibi 与画海，产品介绍依据各产品当前源码和文档维护。

独立产品站点使用子域名，例如 `product-a.ferecord.com`；主站内的探索页面可以使用二级路径。主域名为 `ferecord.com`，正式入口使用 `https://www.ferecord.com`，裸域名通过 EdgeOne Makers 301 转发至该入口。

## 架构决策

使用一个 GitHub 仓库 `ferecord`，站点目录统一放在 `sites/` 下。每个目录对应一个 Makers 项目，项目分别绑定域名。

```text
GitHub: ferecord / main
  ├─ sites/main            → Makers: ferecord                 → www.ferecord.com
  ├─ sites/blog            → Makers: ferecord-blog            → blog.ferecord.com
  ├─ sites/tibi            → Makers: ferecord-tibi            → tibi.ferecord.com
  └─ sites/product-example → Makers: ferecord-product-example → 产品子域名示例
```

多个域名仅绑定同一个静态项目，会展示同一份页面；因此这里通过独立项目选择不同的站点目录，不添加按 Host 分流的后端。

主站和产品示例发布自身 `public/`；博客发布 Astro 构建生成的 `dist/`。设计文档、Git 文件、草稿和部署配置不作为公开资源发布。站点资源不得依赖另一个站点目录中的文件，因为每个项目的发布范围独立。

## 技术选择

- 主站使用原生 HTML/CSS/JavaScript，并渐进加载 Three.js 动态背景；产品示例使用原生 HTML/CSS；博客使用 Astro + AstroPaper，均静态发布，不引入数据库或登录系统。
- 每个站点的 `edgeone.json` 记录 `installCommand`、`buildCommand` 和 `outputDirectory`。
- 主站和产品示例安装和构建命令均为 `true`，直接发布 `public/`；博客安装依赖后构建 HTML 与本地搜索索引，发布 `dist/`。
- Git 生产分支为 `main`，由 Makers 的 Git 集成执行部署，不另建 GitHub Actions 部署流程。
- 初始占位页设置 `noindex`，避免示例内容进入搜索引擎；真实内容就绪后移除。

未来产品确实需要组件或交互时，可单独升级该站点的技术栈，不要求其他站点一起迁移。

## 站点清单

| 目录 | 用途 | 真实域名 | Makers 接入状态 |
| --- | --- | --- | --- |
| `sites/main` | ferecord 主站 | `www.ferecord.com` | 已接入，实际配置与验证状态见部署说明 |
| `sites/blog` | 中文博客 | `blog.ferecord.com` | 已部署并绑定域名、HTTPS，验证状态见部署说明 |
| `sites/tibi` | Tibi 提比产品介绍 | `tibi.ferecord.com` | 代码已就绪；Makers 项目与 DNS 待创建（见部署说明） |
| `sites/product-example` | 产品站点示例 | 待提供 | 未接入 |

主站以两张可点击的悬浮作品卡链接至 Tibi 产品页和画海网页，博客保留独立导航入口。

## 主站作品墙（2026-11-17）

首页主题为“把好奇心，做成小世界”。采用奶油白与雾蓝色背景、宋体标题、细轨道和少量星点，以一张原创纸黏土质感的小星球插画承接阅读与艺术两件作品。人物为短前刺、神态阳光并有轻微训练线条的年轻人，穿花衬衣、卷脚棕色长裤、厚袜与棕色系带靴。用户已否定短裤与凉拖方案，恢复此前穿搭。身旁是 Tibi 藏狐：方脸、半垂眼、奶油色脸颊，佩戴与新版应用图标一致的粉色格桑花发卡。Tibi 卡片使用产品仓库当前的蓝紫渐变应用图标。角色保留已选定的透明 WebP；环境采用 Three.js 实时渲染，云团由 Blender 制作并导出 GLB。

作品卡采用轻巧的“悬浮展签”：保留产品图标、分类、两行简短介绍、真实界面缩略图与入口，去掉重复说明、英文分类行、编号和功能标签。桌面卡片宽 252px，高约 260px，截图收成 72px 高的预览条，错位放在星球两侧。整张卡可点击；悬停及键盘聚焦时回正并强化阴影。手机端按“标题 → 插画 → Tibi → 画海”自然滚动，卡片改为约 170px 高的横向短卡：左侧图标与介绍、右侧小截图、底部平台信息与入口，不持续漂浮。保留可见键盘焦点、跳到作品链接，尊重系统减少动态效果的偏好，并提供暂停漂浮按钮。

- **Tibi 提比**：以兴趣阅读、点词语境释义、AI 辅助及原句复习为核心；标记 macOS、本地优先、开源，进入 `https://tibi.ferecord.com`。不把其他平台描述为已发布。
- **画海 Huahai**：使用当前名称，介绍画作漫游、十八间时代展厅、细看与人物联系，进入既有 `/art-history-atlas/`。网站与 iOS 内容权益不同，首页不承诺 App 上架或展示未核验的购买入口。
- **随笔**：保留 `https://blog.ferecord.com`，作为导航及创作手记入口。

页脚增加“来打个招呼”联系区，展示 [X @Tumars](https://x.com/Tumars)、[邮箱 menghui9898@hotmail.com](mailto:menghui9898@hotmail.com) 和 [GitHub tumars](https://github.com/tumars)。X 与邮箱来自画海已有公开隐私政策，GitHub 来自现有产品仓库与博客作者信息。社交链接新窗口打开，邮箱使用 `mailto:`；三个入口可键盘访问，手机自动换行并保留至少 44px 高的触控区域，兼容白昼与蓝调。

HTML、CSS 和原生 JavaScript 分文件维护；所有首页资源独立存放于 `sites/main/public/assets/`，不跨站点读取 Tibi 或画海的文件。主站继续直接发布自己的 `public/`，不改变域名和部署方式。真实备案号仍待提供，保留 `noindex` 与页脚注释占位。

### 动态环境与交互

环境包含真实 3D 书本、画框、云团、小行星、星轨与可点亮的星星；人物与藏狐仍是一体插画，不承诺独立的眨眼、转头或翻书动作。鼠标移动时，环境与主插画产生轻微的分层视差。悬停或键盘聚焦 Tibi 卡片会让书本与对应星轨回应，画海卡片对应画框与艺术星轨。卡片内容与链接保持原生 HTML。

默认“奶油白昼”，可在页脚切换“星海蓝调”。暂停漂浮会同步停止 CSS 动画与 Three.js 连续渲染。页面隐藏或场景离开视口时停帧；手机限制渲染分辨率并以约 30fps 为目标，不绑定拖拽、陀螺仪或滚轮控制。首次已开启系统减少动态效果时不加载 3D 模块，保留静态插画与可用链接；初始化失败、WebGL 上下文丢失时恢复静态背景。

Three.js 固定为 0.187.0，背景源文件位于 `sites/main/src/universe-scene.js`，打包产物提交到本站 `public/assets/`。Blender 云团源脚本位于 `sites/main/scripts/create-cloud.py`。普通部署只发布已有静态文件；修改场景源码后须运行 `npm ci && npm run build:scene && npm run check` 并提交对应产物。调研、制作与验证细节见 [动态首页方案](homepage-3d-2026-11-17.md)。

素材来源、生成提示词与验证记录见 [首页作品墙设计记录](homepage-2026-11-17.md)。

## 产品与域名维护

艺术史图谱作为主站二级页面，入口为 `https://www.ferecord.com/art-history-atlas/`，首页产品区提供链接。独立源码维护在 `tumars/art-history-atlas`，每次推送或合入该仓库 `main`，Actions 校验并构建后自动提交产物到本仓库 `sites/main/public/art-history-atlas/`，随主站部署；图片及署名清单一并托管，保留图谱原有交互与 GitHub Pages 发布方式。不使用 iframe，也不增加 Makers 项目或 DNS 记录。同步只替换图谱目录，`source-version.txt` 标记对应源码版本；构建失败不更新主站。具体操作见部署说明。

Tibi 产品页按「产品价值与真实界面 → 六步功能 → 应用截图 → 隐私 → 下载」组织，吉祥物仅作装饰配图，不设介绍文案/专区。保留品牌 Logo，静态 WebP 点缀截图说明、功能、隐私和下载区域，产品 UI 截图仍是主要展示依据。截图统一采用应用字体，并明确区分应用示例数据和界面原型；细节与素材采集方法见 [Tibi 设计约定](../sites/tibi/design.md)。2026-11-16 下载入口改为 `dl.ferecord.com` 的腾讯云 COS 固定下载名，云端安装包已完成公开下载与校验。站点部署目录与域名映射不变。

注册商及权威 DNS 已于 2026-11-10 从 GoDaddy 转至腾讯云 DNSPod。主站 `edgeone.json` 配置非 www 域名到 www 的 301，已接替 GoDaddy 裸域名转发。每个产品子域名使用对应 Makers 项目分配的 CNAME，不能复用主站的 CNAME 目标。主站与裸域名转发的具体记录、HTTPS 状态及历史恢复信息维护在 `docs/deployment.md`。

## 发布与维护

### 博客决策

用户选择 Astro + AstroPaper，优先保持简洁、低成本和易维护。文章以 Markdown/MDX 存在 GitHub 仓库中，推送生产分支后由独立 Makers 项目自动构建。

博客名称为 `FErecord · Blog`，作者 `tumars`。当前采用 AstroPaper v7.0.0 源码，Astro 7.4.4，由 npm 锁文件固定解析版本；Node.js 使用 Makers 预装的 24.18.0，`.nvmrc` 保持一致。博客日期显示时区为 `Asia/Shanghai`，日期与文章目录使用中文。主站导航提供博客入口。

第一版包含中文导航、文章列表、标签、归档、文章目录、Pagefind 静态搜索、RSS、站点地图和关于页面。沿用 AstroPaper 的阅读布局，不加入评论系统、内容后台或运行时服务。系统字体与站内资源优先，避免访客依赖第三方字体和脚本服务。

框架与主题版本固定，保留主题 MIT 许可；升级时验证构建、中文搜索、草稿排除和 RSS。未提供的作者信息与备案号不得虚构；写作模板默认草稿，不发布主题自带示例文章。

开发模式允许查看草稿，正式构建统一排除草稿与未来文章。搜索索引仅在构建时生成；未来文章到达发布日期后仍需触发构建，不承诺后台定时发布。

### 多站点发布

每个项目可独立配置、重新部署和回滚。但同一个仓库的提交可能触发多个关联项目构建，初始化不承诺只构建变更目录；是否配置构建忽略规则，待实际需要时确认 Makers 能力后再增加。

2026-11-02 实测限制：Makers 生产环境自动部署锁定开启，关联分支固定；重新关联现有仓库也未提供生产分支选择。因此未启用“Actions 按目录调用部署钩子”方案，否则会与原 Git 自动部署重复触发。继续使用 main 自动部署。图谱源码仓库增加 push 路径过滤，纯开发文档变更不再构建同步；本仓库仍未实现按站点隔离触发。后续需先验证独立发布仓库或 CLI 上传的能力及计费，再决定迁移。

新增产品时复制现有示例，维护自己的公开文件，并更新站点清单。涉及结构、域名或部署行为的变更，必须同步修改本文和部署说明。
