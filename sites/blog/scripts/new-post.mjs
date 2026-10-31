import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const [slug, ...words] = process.argv.slice(2);
const title = words.join(" ");
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title) {
  console.error('用法：npm run new-post -- my-first-post "文章标题"');
  process.exit(1);
}

const directory = new URL("../src/content/posts/", import.meta.url);
await mkdir(directory, { recursive: true });
const target = new URL(`${slug}.md`, directory);
await writeFile(target, `---
title: ${JSON.stringify(title)}
description: "填写文章摘要"
pubDatetime: ${new Date().toISOString()}
draft: true
tags:
  - 随笔
---

在这里开始写作。确认内容后，将 draft 改为 false，并检查发布日期。

## 目录

## 正文

`, { flag: "wx" });
console.log(`已创建草稿：${fileURLToPath(target)}`);
