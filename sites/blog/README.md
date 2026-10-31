# FErecord · Blog

作者：tumars。域名：`https://blog.ferecord.com`。

Astro + AstroPaper 静态博客，源码与文章放在本目录，Makers 仅发布构建后的 `dist/`。

## 本地写作

使用 Node.js 24（本地验证版本 `24.22.2`，最低版本要求见 `package.json`）。在本目录运行：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。开发模式可以预览草稿；正式构建会排除草稿和未到发布日期的文章。

## 新增文章

```sh
npm run new-post -- my-first-post "我的第一篇文章"
```

这会创建 `src/content/posts/my-first-post.md`，默认 `draft: true`，不会覆盖同名文件。也可以复制现有 `first-post.md` 写作模板。

文章头部示例：

```yaml
---
title: 我的第一篇文章
description: 用一两句话概括文章内容。
pubDatetime: 2026-10-31T12:00:00+08:00
draft: false
tags:
  - 随笔
---
```

- 正文使用 Markdown；需要组件时才使用 MDX。
- `## 目录` 会按文章标题自动生成目录。
- 文章文件名决定链接地址，发布后尽量不改。子目录也会进入 URL。
- 图片建议放在文章旁的 `assets/` 目录并使用相对路径引用；不要把私密文件放入 `public/`。
- 草稿、未来文章不会进入生产页面、RSS、站点地图和搜索索引。未来文章到时仍需要触发一次构建，日期本身不会自动触发部署。
- 本地搜索使用最近一次 `npm run build` 的索引，不检索草稿。

## 发布

确认日期和内容，设置 `draft: false`，运行：

```sh
npm run build
npm run preview
```

构建会进行类型检查、生成 HTML、RSS、站点地图及 Pagefind 中文搜索索引。检查后，将源码提交到 GitHub 的 `main` 分支，Makers 自动构建上线。

可直接在 GitHub 网页编辑 Markdown 并提交；无需手动上传 `dist/`。删除文章或撤回为草稿也需要提交并等待部署完成。

## 配置与维护

- `astro-paper.config.ts`：站名、作者、网址、时区、每页篇数、真实 ICP 备案号。
- `src/content/pages/about.md`：关于页面。
- `src/i18n/lang/zh-CN.ts`：中文界面。
- `src/styles/theme.css`：配色与系统字体。
- `public/social.svg`：默认分享图源文件；当前 `social.png` 已生成并提交，修改 SVG 后需重新生成 PNG。
- `UPSTREAM.md`、`LICENSE`：主题来源与许可证。

当前未提供 ICP 备案号，页脚不显示虚构号码。填入 `ICP_RECORD` 后会显示到工信部备案查询网站的链接。

完整部署状态见仓库的 `docs/deployment.md`，架构约定见 `docs/design.md`。
