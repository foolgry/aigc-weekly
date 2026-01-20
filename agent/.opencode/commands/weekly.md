---
description: 创建 AIGC 周刊
---

请你作为一名资深的技术编辑，帮助我创建一份关于人工智能生成内容（AIGC）的周刊。

## 时间计算

使用 `.opencode/utils.mjs` 中的 `getWeekInfo()` 函数计算时间参数：

```javascript
import { formatWeekParams, getWeekInfo, getWeeklyFilename, getWeeklyTitle } from '.opencode/utils.mjs'

// 使用用户输入的日期，或默认当前日期
const weekInfo = getWeekInfo($1) // $1 为用户输入的日期参数（可选）

// 生成参数块
const params = formatWeekParams(weekInfo)

// 生成文件名和标题
const filename = getWeeklyFilename(weekInfo) // 如 "aigc-weekly-y25-w02.md"
const title = getWeeklyTitle(weekInfo) // 如 "Agili 的 AIGC 周刊（Y26W12）"
```

## 参数块格式

所有下游任务必须接收并原样传递以下参数块：

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

## 准备工作

在开始各阶段任务前，必须完成：

1. 调用 `getWeekInfo()` 计算时间参数
2. 创建 `drafts/` 和 `logs/` 目录（如不存在）
3. 生成参数块，用于传递给所有下游任务

## 工作流程

请按照以下步骤操作，协调各个子任务完成工作：

### 1. 收集内容 (Phase 1)

使用 `batch-research` 技能进行批量数据采集。

**你需要完成以下步骤**：

1. **读取数据源列表**：从 `.opencode/REFERENCE.md` 获取所有数据源
2. **生成 URL 列表**：
   - 静态 URL：直接使用
   - 动态 URL（Hacker News）：使用 `generateHNUrls(start_date, end_date)` 生成每日 URL
3. **分批调度**：将 URL 按优先级分为 3 批，每批 10-12 个 URL
4. **并发抓取**：每批内并发调用 `researcher` agent，等待当前批次全部完成后再进入下一批
5. **汇总报告**：收集所有 researcher 返回的结果，生成 `logs/research-report.md`

**分批策略**：

| 批次    | 数据源类型          | 说明                          |
| ------- | ------------------- | ----------------------------- |
| Batch 1 | Important Resources | 高优先级，包括 HN、自己频道等 |
| Batch 2 | Blogs & Websites    | 官方博客、技术网站            |
| Batch 3 | KOL & Influencers   | 个人博客、Newsletter          |

**调用 researcher 的参数格式**：

```yaml
url: https://news.ycombinator.com/front?day=2026-03-22
source_name: Hacker News
week_id: Y26W12
start_date: 2026-03-22
end_date: 2026-03-28
timezone: UTC+0
```

**重要约束**：

- 必须抓取所有数据源，不能跳过
- 单个 researcher 失败不影响其他
- 进入 Phase 2 之前，必须完成所有批次的抓取

**产出**：`drafts/` 目录下的草稿文件 + `logs/research-report.md`

### 2. 筛选信息 (Phase 2)

调用 `editor` 子任务：

````
prompt: |
  筛选 drafts/ 目录中的内容。

  ```yaml
  # 周刊参数
  week_id: {weekInfo.weekId}
  start_date: {weekInfo.startDate}
  end_date: {weekInfo.endDate}
  timezone: UTC+0
````

请对内容进行筛选、去重和打分，生成 drafts.yaml。

```

- 产出：`drafts.yaml` 高价值内容列表

### 3. 撰写内容 (Phase 3)

调用 `writer` 子任务：

```

prompt: |
撰写周刊内容。

```yaml
# 周刊参数
week_id: {weekInfo.weekId}
title: {title}
filename: {filename}
start_date: {weekInfo.startDate}
end_date: {weekInfo.endDate}
```

请基于 drafts.yaml 撰写周刊，保存为 {filename}。

```

- 产出：最终的 Markdown 周刊文件

### 4. 审核与修订 (Phase 4)

调用 `reviewer` 子任务：

```

prompt: |
审核周刊文件 {filename}。

```yaml
# 周刊参数
week_id: {weekInfo.weekId}
start_date: {weekInfo.startDate}
end_date: {weekInfo.endDate}
```

```

**循环逻辑**：

- 如果 Reviewer 返回 "PASS"，则任务完成。
- 如果 Reviewer 返回修改意见，调用 `writer` 子任务进行修改。
- 再次调用 `reviewer` 子任务进行复核。
- 此过程最多重复 3 次。

请务必一次性完成所有任务，过程中无需向我确认，向我呈现最终的周刊内容。
```
