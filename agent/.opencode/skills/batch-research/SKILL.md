---
name: batch-research
description: Researcher Agent 内置的并发抓取能力，用于从多个数据源高效采集信息。
---

# Batch Research 技能指南

此技能已内置于 Researcher Agent 中，指导如何高效、并发地从多个数据源采集信息。

## 核心原则

1. **并行优先**：同时处理所有数据源
2. **全量抓取**：必须抓取所有配置的数据源，不能跳过
3. **结果导向**：关注最终生成的草稿文件数量和质量

## 参数块格式

Researcher 接收的 YAML 参数块：

```yaml
# 周刊参数
week_id: Y26W12
week_number: 12
year_short: 26
year_full: 2026
start_date: 2026-03-22
end_date: 2026-03-28
timezone: UTC+0
```

## 数据源分类

### 动态 URL 数据源

需要根据日期范围生成多个 URL：

```javascript
import { generateHNUrls } from '.opencode/utils.mjs'

// Hacker News - 每天一个 URL
const hnUrls = generateHNUrls(start_date, end_date)
// 返回: [
//   "https://news.ycombinator.com/front?day=2026-03-22",
//   "https://news.ycombinator.com/front?day=2026-03-23",
//   ...
// ]
```

### 静态 URL 数据源

直接抓取的固定 URL 列表（约 25+ 个源）。

### 分批策略（可选）

如果数据源数量过多（>15），可分批执行：

- **第一批**：Important Resources（高优先级）
- **第二批**：Blogs & Websites
- **第三批**：KOL & Influencers

## 错误处理

- 单个数据源失败不影响其他源
- 内置重试机制（2 次重试 + 指数退避）
- 失败记录写入 `logs/crawl-failures.jsonl`

## 抓取报告

所有任务完成后，生成 `logs/research-report.md`：

```markdown
## 抓取报告

**参数回显**：

- week_id: Y26W12
- 时间范围: 2026-03-22 至 2026-03-28
- 时区: UTC+0

**统计**：

- 总数据源: 30
- 成功: 27
- 失败: 3

**成功列表**：
| 源 | 文章数 | 文件 |
|---|--------|------|
| Hacker News (03-25) | 5 | drafts/2026-03-25-hn-_.md |
| Anthropic Blog | 2 | drafts/2026-03-24-anthropic-_.md |

**失败列表**：
| 源 | 错误 |
|---|------|
| daily.dev | 429 Too Many Requests |
```

## 最佳实践

- **全量抓取**：确保所有数据源都被处理
- **时区一致性**：所有时间判断基于 UTC+0
- **内容筛选**：只保留 AIGC 相关且在时间范围内的内容
- **去重处理**：避免重复抓取已存在的文件
