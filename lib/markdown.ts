import markdownIt from 'markdown-it-ts'

const markdownRenderer = markdownIt({
  html: false,
  typographer: true,
})

// 超链接新窗口打开，添加安全属性
const defaultRender = markdownRenderer.renderer.rules.link_open
  || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

markdownRenderer.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href')
  if (href && /^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultRender(tokens, idx, options, env, self)
}

const defaultImageRender = markdownRenderer.renderer.rules.image
  || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

markdownRenderer.renderer.rules.image = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('loading', 'lazy')
  tokens[idx].attrSet('decoding', 'async')
  return defaultImageRender(tokens, idx, options, env, self)
}

export function renderMarkdown(content: string): string {
  return markdownRenderer.render(content)
}
