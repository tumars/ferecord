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
- 权威 DNS：GoDaddy `ns05.domaincontrol.com`、`ns06.domaincontrol.com`。

| 主机名 | 类型 | 目标 | TTL |
| --- | --- | --- | --- |
| `www` | CNAME | `www.ferecord.com.pages.dnsoe4.com` | 1 小时 |
| `ftp` | A | `1.116.135.246` | 1 小时 |

裸域名已配置 GoDaddy Domain Forwarding，以 Permanent (301) 转发到 `https://www.ferecord.com`。GoDaddy 管理转发所需的 A 记录及裸域名证书；证书签发与 DNS 缓存更新可能滞后。Makers 中原来的 `ferecord.com` 直连绑定已停用，后续无需为它添加 CNAME。

### 验证状态

- 修正目录后，生产部署 `dpo91o6x9qto` 成功。
- `https://www.ferecord.com` 返回 HTTP 200，证书校验通过，页面标题为“ferecord · 产品与探索”，内容与仓库主站一致。
- www 已开启强制 HTTPS，`http://www.ferecord.com` 返回 301，Location 为 `https://www.ferecord.com/`。
- GoDaddy 已显示裸域名 Permanent (301) 规则，权威 A 记录已更新为 `15.197.142.173` 和 `3.33.152.147`（由 GoDaddy 管理，不应手动固定）。指定新地址并保留 Host 的 HTTP GET 已返回 301，Location 为 `https://www.ferecord.com`；转发服务对 HEAD 请求返回 405，应使用 GET 检查。
- 本机递归 DNS 仍缓存原服务器 A 地址，普通裸域名请求仍超时；指定新地址的裸域名 HTTPS 也未验证通过。GoDaddy 提示 DNS 全球更新最多 48 小时，HTTPS 证书可能需要几小时。待缓存及证书更新后，再验证 `https://ferecord.com` 的完整跳转链。
- 上述验证仅针对部署与域名接入；正式产品内容和备案号仍待填写，页面继续保留 `noindex`。

### 本次问题与恢复依据

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
- 本机系统解析器暂存此前的失败结果，普通 `curl` 仍报告无法解析，不能据以上定向检查宣称所有网络均已刷新。DNS 缓存传播后再确认本机普通访问；不应将测试用边缘 IP 固定到 DNS 或 hosts。
- 主站已增加博客导航入口。首篇文章与真实 ICP 备案号仍待补充。

首次部署 `dp9opyrj3noz` 在切换 Node.js 24.22.2 时失败。已改用平台设置中实际提供的预装版本 24.18.0，并同步 `.nvmrc`，避免构建时下载不可用版本。

## 官方参考

- [构建指南：根目录、输出目录与构建命令](https://pages.edgeone.ai/zh/document/build-guide)
- [edgeone.json 配置](https://pages.edgeone.ai/zh/document/edgeone-json)
- [中国站域名与 HTTPS 配置](https://edgeone.cloud.tencent.com/pages/document/162936836982489088)
