import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '页面未找到',
}

export default function NotFoundPage() {
  return (
    <article className="post">
      <h1 className="post-title">页面未找到</h1>
      <div className="post-content">
        <p>未找到对应内容，请返回首页查看其它期刊。</p>
        <Link className="button inline" href="/">
          返回首页
        </Link>
      </div>
    </article>
  )
}
