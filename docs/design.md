# ferecord 多产品站点设计

## 目标与范围

主要面向中国大陆用户，使用已有腾讯云备案域名和 EdgeOne Makers，低成本展示多个产品。当前任务是初始化仓库与部署骨架，具体产品文案和视觉设计后续按真实需求制作。

“多个二级站点”按独立子域名理解，例如 `product-a.example.com`、`product-b.example.com`，不采用主域名下的路径分站。完整主域名尚待提供，本文中的 `example.com` 不代表实际配置。

## 架构决策

使用一个 GitHub 私有仓库 `ferecord`，站点目录统一放在 `sites/` 下。每个目录对应一个 Makers 项目，项目分别绑定域名。

```text
GitHub: ferecord / main
  ├─ sites/main            → Makers: ferecord-main            → 主域名
  └─ sites/product-example → Makers: ferecord-product-example → 产品子域名
```

多个域名仅绑定同一个静态项目，会展示同一份页面；因此这里通过独立项目选择不同的站点目录，不添加按 Host 分流的后端。

每个站点只发布自身 `public/` 目录，设计文档、Git 文件和部署配置不作为公开资源发布。站点资源不得依赖另一个站点目录中的文件，因为每个项目的发布范围独立。

## 技术选择

- 原生 HTML/CSS，当前不引入框架、数据库、登录系统或运行时依赖。
- 每个站点的 `edgeone.json` 记录 `installCommand`、`buildCommand` 和 `outputDirectory`。
- 安装和构建命令均为 `true`，直接发布 `public/`。
- Git 生产分支为 `main`，由 Makers 的 Git 集成执行部署，不另建 GitHub Actions 部署流程。
- 初始占位页设置 `noindex`，避免示例内容进入搜索引擎；真实内容就绪后移除。

未来产品确实需要组件或交互时，可单独升级该站点的技术栈，不要求其他站点一起迁移。

## 站点清单

| 目录 | 用途 | 真实域名 | Makers 接入状态 |
| --- | --- | --- | --- |
| `sites/main` | ferecord 主站 | 待提供 | 未接入 |
| `sites/product-example` | 产品站点示例 | 待提供 | 未接入 |

当前不建立虚假的产品跳转链接。真实产品上线后，再更新主站和本表。

## 发布与维护

每个项目可独立配置、重新部署和回滚。但同一个仓库的提交可能触发多个关联项目构建，初始化不承诺只构建变更目录；是否配置构建忽略规则，待实际需要时确认 Makers 能力后再增加。

新增产品时复制现有示例，维护自己的公开文件，并更新站点清单。涉及结构、域名或部署行为的变更，必须同步修改本文和部署说明。
