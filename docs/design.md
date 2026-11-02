# ferecord 多产品站点设计

## 目标与范围

主要面向中国大陆用户，使用已有腾讯云备案域名和 EdgeOne Makers，低成本展示多个产品。当前任务是初始化仓库与部署骨架，具体产品文案和视觉设计后续按真实需求制作。

独立产品站点使用子域名，例如 `product-a.ferecord.com`；主站内的探索页面可以使用二级路径。主域名为 `ferecord.com`，正式入口使用 `https://www.ferecord.com`，裸域名通过 GoDaddy 301 转发至该入口。

## 架构决策

使用一个 GitHub 私有仓库 `ferecord`，站点目录统一放在 `sites/` 下。每个目录对应一个 Makers 项目，项目分别绑定域名。

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

- 主站和产品示例使用原生 HTML/CSS；博客使用 Astro + AstroPaper，静态生成，不引入数据库或登录系统。
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

主站已链接至 Tibi 产品页。

艺术史图谱作为主站二级页面，入口为 `https://www.ferecord.com/art-history-atlas/`，首页产品区提供链接。独立源码维护在 `tumars/art-history-atlas`，每次推送或合入该仓库 `main`，Actions 校验并构建后自动提交产物到本仓库 `sites/main/public/art-history-atlas/`，随主站部署；图片及署名清单一并托管，保留图谱原有交互与 GitHub Pages 发布方式。不使用 iframe，也不增加 Makers 项目或 DNS 记录。同步只替换图谱目录，`source-version.txt` 标记对应源码版本；构建失败不更新主站。具体操作见部署说明。

Tibi 产品页按「产品价值与真实界面 → 六步功能 → 应用截图 → 隐私 → 下载」组织，吉祥物仅作装饰配图，不设介绍文案/专区。保留品牌 Logo，静态 WebP 点缀截图说明、功能、隐私和下载区域，产品 UI 截图仍是主要展示依据。截图统一采用应用字体，并明确区分应用示例数据和界面原型；细节与素材采集方法见 [Tibi 设计约定](../sites/tibi/design.md)。本次只调整该产品页，不改变站点部署目录或域名映射。

DNS 继续由 GoDaddy 托管。每个产品子域名使用对应 Makers 项目分配的 CNAME，不能复用主站的 CNAME 目标。主站与裸域名转发的具体记录、HTTPS 状态及回滚信息维护在 `docs/deployment.md`。

## 发布与维护

### 博客决策

用户选择 Astro + AstroPaper，优先保持简洁、低成本和易维护。文章以 Markdown/MDX 存在 GitHub 私有仓库中，推送生产分支后由独立 Makers 项目自动构建。

博客名称为 `FErecord · Blog`，作者 `tumars`。当前采用 AstroPaper v7.0.0 源码，Astro 7.4.4，由 npm 锁文件固定解析版本；Node.js 使用 Makers 预装的 24.18.0，`.nvmrc` 保持一致。博客日期显示时区为 `Asia/Shanghai`，日期与文章目录使用中文。主站导航提供博客入口。

第一版包含中文导航、文章列表、标签、归档、文章目录、Pagefind 静态搜索、RSS、站点地图和关于页面。沿用 AstroPaper 的阅读布局，不加入评论系统、内容后台或运行时服务。系统字体与站内资源优先，避免访客依赖第三方字体和脚本服务。

框架与主题版本固定，保留主题 MIT 许可；升级时验证构建、中文搜索、草稿排除和 RSS。未提供的作者信息与备案号不得虚构；写作模板默认草稿，不发布主题自带示例文章。

开发模式允许查看草稿，正式构建统一排除草稿与未来文章。搜索索引仅在构建时生成；未来文章到达发布日期后仍需触发构建，不承诺后台定时发布。

### 多站点发布

每个项目可独立配置、重新部署和回滚。但同一个仓库的提交可能触发多个关联项目构建，初始化不承诺只构建变更目录；是否配置构建忽略规则，待实际需要时确认 Makers 能力后再增加。

2026-11-02 实测限制：Makers 生产环境自动部署锁定开启，关联分支固定；重新关联现有仓库也未提供生产分支选择。因此未启用“Actions 按目录调用部署钩子”方案，否则会与原 Git 自动部署重复触发。继续使用 main 自动部署。图谱源码仓库增加 push 路径过滤，纯开发文档变更不再构建同步；本仓库仍未实现按站点隔离触发。后续需先验证独立发布仓库或 CLI 上传的能力及计费，再决定迁移。

新增产品时复制现有示例，维护自己的公开文件，并更新站点清单。涉及结构、域名或部署行为的变更，必须同步修改本文和部署说明。
