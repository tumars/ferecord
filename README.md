# ferecord

产品介绍网站仓库：一个 Git 仓库管理多个站点，每个站点使用独立的 EdgeOne Makers 项目和域名。

当前包含主站、博客与产品站 Tibi。主站正式入口为 `https://www.ferecord.com`，博客为 `https://blog.ferecord.com`，Tibi 目标域名为 `https://tibi.ferecord.com`。域名配置与验证状态见部署说明。

艺术史图谱位于主站二级页面：<https://www.ferecord.com/art-history-atlas/>。源码独立维护，主站托管其构建产物；更新流程见 [部署说明](docs/deployment.md#艺术史图谱二级页面2026-11-02)。

## 目录

```text
sites/
  blog/                  # FErecord · Blog，Astro + AstroPaper
    src/content/posts/   # Markdown/MDX 文章
    public/              # 图片、图标等公开静态资源
    edgeone.json
  main/                  # ferecord 主站
    edgeone.json
    public/index.html
  tibi/                  # Tibi 缇比产品介绍
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

| 配置 | 主站 | Tibi | 产品示例 |
| --- | --- | --- | --- |
| Git 仓库 | 同一个 ferecord 仓库 | 同一个 ferecord 仓库 | 同一个 ferecord 仓库 |
| 生产分支 | `main` | `main` | `main` |
| 项目名 | `ferecord`（已创建） | `ferecord-tibi`（建议） | `ferecord-product-example`（建议，未创建） |
| 框架预设 | `Other` | `Other` | `Other` |
| 根目录 | `sites/main` | `sites/tibi` | `sites/product-example` |
| 安装命令 | `true` | `true` | `true` |
| 构建命令 | `true` | `true` | `true` |
| 输出目录 | `public` | `public` | `public` |
| 域名 | `www.ferecord.com` | `tibi.ferecord.com` | 示例域名，未配置 |

`true` 是 Bash 的成功空操作：当前纯静态文件无需安装或构建。每个站点的 `edgeone.json` 已记录安装、构建和输出目录设置；项目根目录需要在 Makers 中选择。

裸域名 `ferecord.com` 使用 GoDaddy 301 转发到 www，产品子站按需添加独立域名。

完整操作见 [部署说明](docs/deployment.md)，架构约定见 [设计文档](docs/design.md)。

## 新增产品

博客已选择 Astro + AstroPaper，名称为 **FErecord · Blog**，作者 **tumars**。写作、预览和发布流程见 [博客说明](sites/blog/README.md)。博客需要安装依赖并构建，不能使用主站的 `true` 命令直接发布。

1. 复制 `sites/product-example` 为 `sites/<产品英文标识>`。
2. 修改该目录下的页面标题、描述、正文及素材。
3. 在 Makers 中关联同一个仓库，选择新目录作为项目根目录。
4. 绑定 `<产品英文标识>.<真实主域名>`。
5. 将产品域名登记到设计文档；主站添加真实产品链接。

正式上线前，替换示例内容，在页脚添加真实备案信息，并移除初始化页面中的 `noindex`。
