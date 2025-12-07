---
name: screening
description: 从草稿信息中筛选和提取高价值信息。
---

# 信息筛选

## 快速入门

对 `drafts` 目录中的草稿文件进行筛选，提取高价值的信息内容，将筛选后的文章详细信息保存到 `drafts.md` 文件中。

## 要求

- 文章和工具必须严格贴合 AIGC 主题。
- 多次出现和评论多的文章是优先考虑的对象。
- 如果是 GitHub 项目，使用 GitHub Star History 工具来评估其受欢迎程度, 丢弃 100 Stars 以下的项目。
- 判断**原文发布时间**，需要在用户要求的时间段内。
- 给筛选的文章进行打标，确保其内容质量和相关性。
- 尽可能保持文章原本的信息，但要去除冗余和无关内容。务必保留原文超链接。
- 草稿信息应该包含足够的细节，以支持后续的分析和处理。

## 工具

1. GitHub Star History

获取 GitHub 仓库的星标历史数据，`https://github.com/miantiao-me/aigc-weekly` 对于的数据是 `https://api.star-history.com/svg?repos=miantiao-me/aigc-weekly`
