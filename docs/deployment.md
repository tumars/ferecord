# EdgeOne Makers 部署说明

## 准备

- GitHub 仓库 `ferecord`，生产分支 `main`。
- 已申请的 Makers 账号。
- 已备案且状态正常的完整域名，以及对应 DNS 管理权限。

仓库默认私有，网站可以公开访问。Makers 关联私有仓库需要通过其 GitHub 应用授权；建议只授权此仓库。应用授权由账号持有人在 GitHub 界面完成，不要将 GitHub token 写入仓库。

## 先部署主站

1. 在 Makers 创建项目，选择从 Git 仓库导入，关联 `ferecord`。
2. 选择 `main` 分支，主站实际项目名为 `ferecord`。
3. 框架选择 `Other`，根目录填 `sites/main`。
4. 确认安装命令 `true`、构建命令 `true`、输出目录 `public`。这些设置已写入该目录的 `edgeone.json`。
5. 选择适合大陆访问的加速区域并部署，检查构建日志与页面预览。
6. 在项目域名设置中添加真实主域名，依据控制台显示的记录配置 DNS。不要使用本文示例域名或自行猜测 CNAME 目标。
7. 启用平台免费 HTTPS 证书并检查证书状态。

根目录是相对于 Git 仓库的路径，输出目录是相对于项目根目录的路径。不要把仓库根目录直接作为公开输出目录。

## 添加一个产品子站

1. 将 `sites/product-example` 复制为真实产品目录并修改内容，提交到 `main`。
2. 再创建一个 Makers 项目，继续关联同一个仓库和分支。
3. 根目录选择 `sites/<产品英文标识>`，其余静态部署设置与主站相同。
4. 绑定 `<产品英文标识>.<真实主域名>`，按平台给出的记录配置 DNS 和 HTTPS。

一个产品对应一个项目和明确的域名记录，当前不需要通配符域名或通配符证书。

## 上线核对

- 页面中的产品名称、介绍和素材均已替换为真实内容。
- 已在页脚填写与网站一致的真实 ICP 备案信息并链接至 `https://beian.miit.gov.cn/`；按实际情况处理其他备案展示要求。
- 已将示例页的 `<meta name="robots" content="noindex, nofollow">` 移除。
- 手机和桌面均能正常显示，两个域名访问到各自正确的站点。
- 站内素材正常加载，HTTPS 无证书报错。
- 不存在指向 `example.com`、示例产品或无效联系方式的链接。

主站已创建 Makers 项目并关联 GitHub，产品示例尚未部署。不要仅因为启用 Makers 就删除原有服务器或备案接入关系。

## 主站实际配置（2026-10-31）

- GitHub：`tumars/ferecord`（私有），生产分支 `main`，自动部署开启。
- Makers 项目：`ferecord`，ID `makers-crfv87f7cyrj`，全球加速（含中国大陆）。
- 根目录 `sites/main`，输出目录 `public`，安装与构建命令均为 `true`。
- 默认预览域名：`ferecord-9xy1s4wr.edgeone.cool`，预览访问可能需要控制台生成的临时验证参数。
- 正式入口：`https://www.ferecord.com`，绑定生产环境，使用 Makers 免费证书。
- 注册商：腾讯云国内站 DNSPod（帝思普）；权威 DNS：`draw.dnspod.net`、`ham.dnspod.net`。

| 主机名 | 类型 | 目标 | TTL |
| --- | --- | --- | --- |
| `www` | CNAME | `www.ferecord.com.pages.dnsoe4.com` | 1 小时 |
| `@` | CNAME | `ferecord.com.pages.dnsoe5.com` | 1 小时 |
| `_dnsauth` | CNAME | `ferecord.com.eoacme0.com` | 10 分钟 |
| `ftp` | A | `1.116.135.246` | 1 小时 |

裸域名由 EdgeOne Makers 返回 301 至 www，HTTPS 证书由 Makers 免费签发并自动续期。主站 `edgeone.json` 使用官方 `$host` → `$wwwhost` 规则，保留路径和查询参数。HTTP 裸域名先跳 HTTP www，再由 www 已有强制 HTTPS 升级。

2026-11-10 转入完成：腾讯云显示 16:43:05 转入成功，注册局 RDAP 核实注册商为 `DNSPod, Inc.`，到期日延长至 2030-11-13；控制台显示正常、已实名认证，自动续费关闭。实付 88 元包含一年续期，无搭购。Makers 裸域名绑定已启用，DNS 委派验证及免费证书已部署；`_dnsauth` 验证记录需保留，以便续期。

DNSPod 原 19 条业务记录导入后，按用户确认删除两条旧 MX 及 `email` CNAME，新增证书验证记录，并将两条 GoDaddy 裸域名转发 A 替换为 Makers CNAME，最终为 16 条。转入前曾返回 NXDOMAIN；转入并接管 NS 后，控制台显示正常，指定两台权威服务器的 TCP 非递归查询 32 项全部通过。公共 Google DoH 也已查到新 CNAME。按公共解析的新边缘地址验证，裸域名 HTTPS 301 正常，www、blog、tibi、app.tibi 均为 HTTPS 200，证书有效。主站生产部署 `dp2qornccxim`（`5d46ed3`）成功；各地旧 DNS 缓存仍可能尚未刷新。

### 原 GoDaddy 接入验证（历史记录，已被上述迁移取代）

- 修正目录后，生产部署 `dpo91o6x9qto` 成功。
- `https://www.ferecord.com` 返回 HTTP 200，证书校验通过，页面标题为“ferecord · 产品与探索”，内容与仓库主站一致。
- www 已开启强制 HTTPS，`http://www.ferecord.com` 返回 301，Location 为 `https://www.ferecord.com/`。
- GoDaddy 已显示裸域名 Permanent (301) 规则，权威 A 记录已更新为 `15.197.142.173` 和 `3.33.152.147`（由 GoDaddy 管理，不应手动固定）。指定新地址并保留 Host 的 HTTP GET 已返回 301，Location 为 `https://www.ferecord.com`；转发服务对 HEAD 请求返回 405，应使用 GET 检查。
- 本机递归 DNS 仍缓存原服务器 A 地址，普通裸域名请求仍超时；指定新地址的裸域名 HTTPS 也未验证通过。GoDaddy 提示 DNS 全球更新最多 48 小时，HTTPS 证书可能需要几小时。待缓存及证书更新后，再验证 `https://ferecord.com` 的完整跳转链。
- 上述验证仅针对部署与域名接入；正式产品内容和备案号仍待填写，页面继续保留 `noindex`。

### 原 GoDaddy 接入问题与恢复依据（历史记录）

原先 Makers 只绑定 `ferecord.com`，但 GoDaddy 将其 CNAME 目标配置在 `www` 上，裸域名仍是 A → `1.116.135.246`，因此 Makers 提示未添加 CNAME。新增 www 绑定后，必须使用它专属的 CNAME 目标，不能沿用裸域名的 `ferecord.com.pages.dnsoe5.com`。

同时，Makers 原构建配置使用仓库根目录 `./` 且未配置输出目录；已修正为上面的主站目录，避免发布仓库文档而找不到首页。

转发前，`ftp` 原为 CNAME → `ferecord.com`，已改为直接 A → `1.116.135.246`，保持原 FTP 解析地址。其他子域名及 MX 邮箱记录不变。

如需恢复原服务器入口，先取消 GoDaddy 裸域名转发，再将 `@` A 记录恢复为 `1.116.135.246`（原 TTL 600 秒）。`ftp` 可继续保留直接 A 记录。原 `www` 的 CNAME 是误配值，不应作为修复方案恢复。

## 博客接入（2026-10-31）

博客使用独立 Makers 项目 `ferecord-blog`，关联相同 GitHub 仓库 `tumars/ferecord` 的 `main` 分支。

| 配置 | 博客 |
| --- | --- |
| 名称 / 作者 | FErecord · Blog / tumars |
| 域名 | `blog.ferecord.com` |
| 框架 | Astro（静态生成） |
| 根目录 | `sites/blog` |
| Node.js | 24.18.0（平台设置与 `.nvmrc` 一致），代码最低要求 `22.23.4` |
| 安装 | `npm ci --no-audit --no-fund` |
| 构建 | `npm run build` |
| 输出目录 | `dist` |

本地使用 Node.js 24.18.0 构建和类型检查通过，已验证中文界面、中文搜索、草稿排除、内部资源与链接、RSS 和站点地图。当前没有正式文章，写作模板为草稿；生产首页显示等待首篇文章的状态。ICP 备案号待用户提供。

线上项目 ID 为 `makers-sneek1fgbw2j`，生产部署 `dpnvfag1xixm`（提交 `2356dec`）成功。默认预览域名 `ferecord-blog-vvdaimj8.edgeone.cool`，可能需要控制台临时验证参数。

GoDaddy 已添加 `blog` CNAME → `blog.ferecord.com.pages.dnsoe4.com`，控制台显示 TTL 为 1 小时，权威 DNS 已查到该记录。Makers 已申请免费证书（自动验证、自动续签），并开启强制 HTTPS 301。`blog` 必须使用博客项目分配的 CNAME，不能复用主站的记录。

### 博客上线验证

- 生产构建成功，Astro 检查 0 errors / 0 warnings；Pagefind 生成中文索引。
- GoDaddy 权威 DNS、Cloudflare `1.1.1.1` 与阿里 `223.5.5.5` 均已解析到博客 CNAME 及边缘地址。
- 指定已解析边缘地址 `117.69.71.114`、保留域名 Host/SNI 的 HTTPS 检查：主页、关于、搜索、RSS、sitemap、Pagefind 脚本均返回 200，TLS 证书校验通过；页面站名和作者正确。
- 同一边缘地址的 HTTP 请求返回 301，Location 为 `https://blog.ferecord.com/`。
- 草稿 `/posts/first-post/` 和源码 `/src/content/posts/first-post.md` 均返回 404。
- Chrome 已通过正式 HTTPS 地址正常打开首页；中文搜索“想法”返回关于页面，站名与作者正确，已保存上线截图。本机系统解析器仍缓存此前的失败结果，普通终端 `curl` 报告无法解析，浏览器与终端使用的解析路径暂不一致。不能宣称所有网络均已刷新，也不应将测试用边缘 IP 固定到 DNS 或 hosts。
- 主站已增加博客导航入口。首篇文章与真实 ICP 备案号仍待补充。

首次部署 `dp9opyrj3noz` 在切换 Node.js 24.22.2 时失败。已改用平台设置中实际提供的预装版本 24.18.0，并同步 `.nvmrc`，避免构建时下载不可用版本。

## 艺术史图谱二级页面（2026-11-02）

- 入口：`https://www.ferecord.com/art-history-atlas/`，首页产品区提供链接。
- 源码：`https://github.com/tumars/art-history-atlas`，首次同步版本 `8d0107c`。
- 发布目录：`sites/main/public/art-history-atlas/`，包括 HTML、打包后的 JS/CSS、作品图片和署名清单；不复制源码或开发文档。
- 复用主站 Makers 项目与现有构建配置，推送 `ferecord/main` 自动部署，无需新增 DNS。
- 使用带尾斜杠的入口，确保图谱相对资源地址从该目录加载。

日常更新：推送或合入 `tumars/art-history-atlas/main` 后，`deploy.yml` 自动构建并将产物提交到本仓库 `main`，不再需要本地手动复制。取图工作流触发的 `deploy.yml` 同样会同步图片。同步凭证为图谱 Actions secret `FERECORD_DEPLOY_KEY`，对应本仓库专用可写 deploy key `art-history-atlas Actions sync`；不复用个人 GitHub token。该密钥能写整个仓库，工作流限制为仅同步图谱目录、仅在 `main` 执行。失败可手动重跑图谱的 `deploy.yml`。

访问 `/art-history-atlas/source-version.txt` 可核对线上源码 SHA，自动提交消息也会记录相同 SHA。旧哈希资源会随同步清理，其他主站文件保留；主站有并发提交时先 rebase，冲突则失败，不强制覆盖。

紧急手动更新时，在干净的图谱源码目录执行（路径按实际本地仓库位置调整）：

```sh
npm ci --no-audit --no-fund
npm run build -- --outDir ../ferecord/sites/main/public/art-history-atlas --emptyOutDir
```

这里 `--emptyOutDir` 只清理图谱产物目录，不要指向主站 `public/`。构建包含 TypeScript 检查和内容校验。手动发布时也应将源码 SHA 写入产物目录的 `source-version.txt`。回滚时恢复上一版产物再推送部署，同时在图谱源码仓库回退对应改动，避免下一次自动同步重新发布问题版本。

### 首次上线验证

- 2026-11-02，提交 `fc5a4bc` 已部署至生产，Makers 部署 ID `dp0ffz37yjro`，控制台显示成功。
- 本次推送后未观察到自动部署任务，已在主站「构建部署 → 新建部署」选择 `main` 最新提交手动发布。以后推送应检查任务是否生成，未生成时使用此入口；自动触发原因尚未排查。
- HTTPS 首页、图谱页面、JS/CSS、图片署名 JSON 与抽查的《蒙娜丽莎》原图均返回 200，响应内容与本地产物逐字节一致。
- Chrome 从首页点击入口可进入图谱，切换至第 08 展厅成功，作品图片和缩略图显示正常；本地已核对全部 65 件作品的原图及缩略图文件存在。

### 自动同步验证（2026-11-02）

- 图谱提交 `eb8c622` 触发 Actions 运行 `41458076922`，构建、GitHub Pages 发布和 `sync-ferecord` 均成功；自动生成主站提交 `a6ab3fd`。
- EdgeOne 生产环境保持 `main` 自动部署开启，自动生成部署 `dpqre9j2l8sz`，状态成功，本次没有手动触发。前述首次上线未触发的原因未确定；后续文档提交 `199c66e` 也已观察到自动部署记录 `dpksythmjjvh`。
- 图谱源码与主站分开维护，后续只需更新图谱 `main`；如连续推送，现有工作流并发策略会取消旧任务、优先发布最新版本。

## 构建额度优化与平台限制（2026-11-02）

按目录调用三个部署钩子的方案未启用，相关候选工作流已撤下。控制台实测：生产环境自动部署开关 disabled，提示“生产环境默认开启”；关联分支固定。主站尝试解除并重新关联同一仓库后，没有出现分支选择步骤，已恢复关联 `tumars/ferecord`，生产仍为 `main`。解除关联时部署钩子编辑不可用，不能把解除 Git 关联当作仅关闭自动部署。

现状：仍由 Makers 监听 main 自动部署，本仓库的纯文档提交也可能触发各关联项目；不能声称图谱更新只消耗一次构建。图谱源码仓库已增加 push 路径过滤：纯 README/设计文档变更不构建、不同步到本仓库；源码、内容、公开资源、构建配置变化仍自动上线，手动运行不受路径过滤影响。

主站已创建 `github-actions-main` 钩子，但未调用、未接入工作流；博客和 Tibi 钩子未创建。钩子 URL 不写入代码或日志。未来若验证了可替代 Git 自动触发的发布方式，再决定启用或移除。

下一步可评估独立发布仓库或 Actions 构建后通过 CLI 上传；需要先确认能否复用现有项目、域名及构建计数规则，再迁移。构建命令为 `true` 或直接上传都不能据此推断不计次数。额度不足时可向腾讯云申请提额；不要通过增加钩子重复触发来解决额度问题。

## 官方参考

- [构建指南：根目录、输出目录与构建命令](https://pages.edgeone.ai/zh/document/build-guide)
- [edgeone.json 配置](https://pages.edgeone.ai/zh/document/edgeone-json)
- [中国站域名与 HTTPS 配置](https://edgeone.cloud.tencent.com/pages/document/162936836982489088)

## Tibi 产品站接入（2026-11-01）

产品站目录为 `sites/tibi`，目标域名 `tibi.ferecord.com`，静态发布 `public/`（安装 / 构建命令均为 `true`）。

建议 Makers 项目名：`ferecord-tibi`。关联同一个 GitHub 仓库 `tumars/ferecord` 的 `main` 分支，根目录填 `sites/tibi`，输出目录 `public`。

DNS（GoDaddy）需在创建 Makers 项目并添加自定义域名后，按控制台给出的 **专属** CNAME 目标配置，例如形如：

| 主机名 | 类型 | 目标 | TTL |
| --- | --- | --- | --- |
| `tibi` | CNAME | `tibi.ferecord.com.pages.dnsoe4.com`（以控制台实际值为准） | 1 小时 |

**不要**复用 `www` 或 `blog` 的 CNAME 目标。启用平台免费 HTTPS，并开启强制 HTTPS。

上线核对：

- 页面标题含「Tibi 缇比」，吉祥物与截图资源可加载。
- `https://tibi.ferecord.com` 返回 200，证书有效。
- 主站 `https://www.ferecord.com` 已包含指向 Tibi 的链接。
- ICP 备案号仍待用户提供；页脚暂留注释占位。

当前状态：仓库内页面与素材已就绪；Makers 项目创建与 GoDaddy `tibi` CNAME 需账号持有人在控制台完成（本机无 EdgeOne / GoDaddy CLI）。
