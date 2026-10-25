import MarkdownIt from 'markdown-it'
import katex from 'katex'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import defineSolidity from 'highlightjs-solidity'
import 'katex/dist/katex.min.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('java', java)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)
defineSolidity(hljs)

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="code"><code class="hljs language-${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`
    }
    return `<pre class="code"><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// $수식$ / $$수식$$ → KaTeX. 글자 그대로의 달러는 \$ 로 쓴다.
md.inline.ruler.after('escape', 'math', (state, silent) => {
  const { src, pos } = state
  if (src[pos] !== '$') return false
  const display = src.startsWith('$$', pos)
  const open = display ? 2 : 1
  const end = src.indexOf(display ? '$$' : '$', pos + open)
  if (end < 0 || end === pos + open) return false
  if (!silent) {
    const token = state.push('math', 'math', 0)
    token.content = src.slice(pos + open, end)
    token.meta = { display }
  }
  state.pos = end + open
  return true
})
md.renderer.rules.math = (tokens, idx) =>
  katex.renderToString(tokens[idx].content, {
    displayMode: tokens[idx].meta.display,
    throwOnError: false,
  })

// 외부 링크는 새 탭으로
const defaultLinkOpen = md.renderer.rules.link_open || ((t, i, o, e, self) => self.renderToken(t, i, o))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || ''
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

/** 블록 마크다운(글 본문, 코드 블록이 있는 문항 등) */
export function renderMarkdown(text) {
  return md.render(text ?? '')
}

/** 한 줄짜리 마크다운. 코드 블록이 섞여 있으면 블록 렌더링으로 넘긴다. */
export function renderInline(text) {
  const t = text ?? ''
  return t.includes('```') || t.includes('\n\n') ? md.render(t) : md.renderInline(t)
}
