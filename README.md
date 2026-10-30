# ferecord

产品介绍网站仓库：一个 Git 仓库管理多个站点，每个站点使用独立的 EdgeOne Makers 项目和域名。

当前是初始化骨架，包含主站与一个产品示例。示例文案不代表真实产品，尚未绑定域名、配置 DNS 或发布到 Makers。

## 目录

```text
sites/
  main/                  # ferecord 主站
    edgeone.json
    public/index.html
  product-example/       # 产品站点示例，新增产品时复制
    edgeone.json
    public/index.html
docs/
  design.md              # 设计决策与站点约定
  deployment.md          # Makers 接入、域名绑定与上线步骤
```

## 本地预览

页面采用原生 HTML/CSS，没有 npm 依赖，也不需要编译。可以直接用浏览器打开各站点的 `public/index.html`。

也可在仓库根目录运行（需要 Python 3）：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory sites/main/public
```

打开 `http://127.0.0.1:4173`。预览产品示例时，将目录改为 `sites/product-example/public`；并行预览请使用不同端口。

## 在 Makers 中关联仓库

| 配置 | 主站 | 产品示例 |
| --- | --- | --- |
| Git 仓库 | 同一个 ferecord 仓库 | 同一个 ferecord 仓库 |
| 生产分支 | `main` | `main` |
| 项目名（建议） | `ferecord-main` | `ferecord-product-example` |
| 框架预设 | `Other` | `Other` |
| 根目录 | `sites/main` | `sites/product-example` |
| 安装命令 | `true` | `true` |
| 构建命令 | `true` | `true` |
| 输出目录 | `public` | `public` |
| 域名（示例） | `example.com` | `product.example.com` |

`true` 是 Bash 的成功空操作：当前纯静态文件无需安装或构建。每个站点的 `edgeone.json` 已记录安装、构建和输出目录设置；项目根目录需要在 Makers 中选择。

`example.com` 只是示例。用户已确认主域名名称为 ferecord，但尚未提供完整域名后缀。

完整操作见 [部署说明](docs/deployment.md)，架构约定见 [设计文档](docs/design.md)。

## 新增产品

1. 复制 `sites/product-example` 为 `sites/<产品英文标识>`。
2. 修改该目录下的页面标题、描述、正文及素材。
3. 在 Makers 中关联同一个仓库，选择新目录作为项目根目录。
4. 绑定 `<产品英文标识>.<真实主域名>`。
5. 将产品域名登记到设计文档；主站添加真实产品链接。

正式上线前，替换示例内容，在页脚添加真实备案信息，并移除初始化页面中的 `noindex`。
