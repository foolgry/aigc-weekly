# AGENTS.md

为 AI 代码助手提供本仓库的开发指南。

## 全局约定

- **语言**：所有对话、提交信息与界面交互均使用简体中文。
- **工作目录**：位于仓库根目录；临时/生成文件应写入 `data/` 或 `.next/` 等路径，避免使用外部目录。
- **环境**：Node.js 22 与 pnpm 10 是默认运行时；脚本假定 `pnpm` 在 PATH 中。
- **约束**：忽略 `agent/.claude` 目录中的文件。

## 常用命令

### 开发与构建

```bash
# Next.js 应用
pnpm dev              # 开发服务器 (localhost:3000)
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# Cloudflare Worker
pnpm dev:worker       # Worker 开发 (localhost:2442)
pnpm deploy:worker    # 部署 Worker

# 整体部署
pnpm deploy           # 完整部署（数据库 + 应用）
pnpm deploy:database  # 仅部署数据库迁移
pnpm deploy:app       # 仅部署应用
```

### 工具与维护

```bash
pnpm generate:types   # 生成 Cloudflare + Payload 类型定义
pnpm lint:fix         # 代码检查并自动修复（优先使用）
pnpm payload          # Payload CLI（迁移等操作）
pnpm clean            # 清理构建产物
```

### 单文件操作

```bash
# 检查单个文件
pnpm eslint path/to/file.ts

# 修复单个文件
pnpm eslint --fix path/to/file.ts
```

## 代码风格规范

本项目使用 [@antfu/eslint-config](https://github.com/antfu/eslint-config) 统一代码风格，并配置了 pre-commit hooks。

### 导入规范

```typescript
// 1. 类型导入单独一行，使用 `import type`
import type { CollectionConfig } from 'payload'
import type { ReactNode } from 'react'

// 2. Node.js 内置模块（带 node: 前缀）
import path from 'node:path'
import process from 'node:process'

// 3. 第三方库
import { getPayload } from 'payload'
import { cache } from 'react'

import { Weekly } from '@/collections/Weekly'
// 4. 项目内部模块（使用 @/ 别名）
import { siteConfig } from '@/lib/config'
```

### 格式规范

- **缩进**：2 空格
- **引号**：单引号（字符串）
- **分号**：不使用分号
- **尾逗号**：多行时使用
- **行宽**：无硬性限制，但保持合理

### 命名规范

```typescript
// 组件：PascalCase
export function ThemeSwitcher() {}
export function PostMeta() {}

// 函数/变量：camelCase
const getPayloadClient = cache(async () => {})
function normalizePositiveInteger(value: number) {}

// 常量：SCREAMING_SNAKE_CASE
const DEFAULT_PAGE_SIZE = 3
const MAX_PAGE_SIZE = 50

// 类型/接口：PascalCase
interface WeeklyListParams {}
type SiteConfig = typeof siteConfig

// 文件名
// - 组件文件：PascalCase.tsx (ThemeSwitcher.tsx)
// - 工具/配置：camelCase.ts (config.ts, data.ts)
// - 集合定义：PascalCase.ts (Weekly.ts, Media.ts)
```

### TypeScript 规范

```typescript
// 优先使用类型推断，避免冗余类型标注
const page = normalizePositiveInteger(params.page, 1)

// 接口定义放在使用前
export interface WeeklyListResult {
  items: WeeklyListItem[]
  pagination: { page: number, pageSize: number }
}

// 函数返回类型：复杂函数建议显式标注
export async function getWeeklyList(params: WeeklyListParams = {}): Promise<WeeklyListResult> {}

// 类型断言：使用 as，但尽量避免
const response = (await payload.find({ })) as PaginatedDocs<Weekly>

// 禁止使用
// - `as any`
// - `@ts-ignore` / `@ts-expect-error`
// - 空 catch 块
```

### React/Next.js 规范

```tsx
// Server Component（默认）
import { useEffect, useState } from 'react'

export default async function HomePage({ searchParams }: HomePageProps) {
  const data = await fetchData()
  return <Component data={data} />
}

// Client Component：文件顶部标记
'use client'

// Props 解构
export default function RootLayout(props: { children: ReactNode }) {
  const { children } = props
  return <>{children}</>
}

// 条件渲染
{ item.summary ? <p>{item.summary}</p> : <p>暂无摘要。</p> }

// 列表渲染：使用唯一 key
{ items.map(item => (
  <article key={item.id}>{item.title}</article>
)) }
```

### 错误处理

```typescript
// 早期返回处理空值
if (!slug) {
  return null
}

// 验证函数返回 true 或错误信息
validate: (value: string) => {
  const pattern = /^Y\d{2}W\d{2}$/
  if (!pattern.test(value)) {
    return '期刊编号格式不正确'
  }
  return true
}

// 可选链安全访问
doc.tags?.map(t => t.value) ?? []
```

### 控制台输出

```typescript
// 禁止使用 console.log（eslint 警告）
// 允许使用：
console.info('信息')
console.warn('警告')
console.error('错误')
```

## 架构概览

```
aigc-weekly/
├── app/                    # Next.js App Router
│   ├── (frontend)/         # 前台页面
│   └── (payload)/          # Payload Admin
├── collections/            # Payload CMS 数据模型
├── components/             # React 组件
│   ├── theme/              # 主题相关组件
│   └── payload/            # Payload 自定义组件
├── lib/                    # 工具函数与配置
│   └── weekly/             # 周刊数据访问层
├── worker/                 # Cloudflare Worker
├── migrations/             # 数据库迁移（自动生成，勿修改）
└── public/                 # 静态资源
```

### 关键文件

| 文件                | 说明            |
| ------------------- | --------------- |
| `payload.config.ts` | CMS 核心配置    |
| `next.config.mjs`   | Next.js 配置    |
| `eslint.config.mjs` | ESLint 配置     |
| `tsconfig.json`     | TypeScript 配置 |

## 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 生成类型
pnpm generate:types

# 3. 启动开发服务器
pnpm dev

# 访问：http://localhost:3000（前台）
# 访问：http://localhost:3000/admin（后台）
```

## 部署说明

- 依赖 Cloudflare 绑定：`D1`（数据库）、`R2`（存储）、`PAYLOAD_SECRET`
- `pnpm deploy` 自动执行数据库迁移并部署应用
- 使用 OpenNext 构建，输出到 `.open-next` 目录

## ESLint 忽略规则

以下文件/目录不参与 lint 检查：

- `migrations/**` - 自动生成的迁移文件
- `*types.ts` - 生成的类型定义
- `**/*.d.ts` - TypeScript 声明文件
- `**/importMap.js` - Payload 导入映射
