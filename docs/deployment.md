# EdgeOne Makers 部署说明

## 准备

- GitHub 仓库 `ferecord`，生产分支 `main`。
- 已申请的 Makers 账号。
- 已备案且状态正常的完整域名，以及对应 DNS 管理权限。

仓库默认私有，网站可以公开访问。Makers 关联私有仓库需要通过其 GitHub 应用授权；建议只授权此仓库。应用授权由账号持有人在 GitHub 界面完成，不要将 GitHub token 写入仓库。

## 先部署主站

1. 在 Makers 创建项目，选择从 Git 仓库导入，关联 `ferecord`。
2. 选择 `main` 分支，项目名可用 `ferecord-main`。
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

本次仓库初始化不代表已完成 Makers 项目创建、GitHub 应用授权、域名绑定或 DNS 变更。不要仅因为启用 Makers 就删除原有服务器、解析记录或备案接入关系。

## 官方参考

- [构建指南：根目录、输出目录与构建命令](https://pages.edgeone.ai/zh/document/build-guide)
- [edgeone.json 配置](https://pages.edgeone.ai/zh/document/edgeone-json)
- [中国站域名与 HTTPS 配置](https://edgeone.cloud.tencent.com/pages/document/162936836982489088)
