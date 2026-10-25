import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFrontmatter } from './src/lib/frontmatter.js'
import site from './src/site.config.js'

const root = import.meta.dirname

// GitHub Pages는 SPA 라우팅을 모르므로 404.html을 index.html과 같게 두어 깊은 링크를 살리고,
// 검색엔진용 sitemap.xml을 함께 만든다.
function pagesExtras() {
  return {
    name: 'pages-extras',
    apply: 'build',
    closeBundle() {
      const dist = resolve(root, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))

      const urls = ['/', '/exams/']
      for (const file of readdirSync(resolve(root, 'content/posts'))) {
        if (!file.endsWith('.md')) continue
        const { data } = parseFrontmatter(readFileSync(resolve(root, 'content/posts', file), 'utf8'))
        if (!data.draft) urls.push(`/${data.category}/${data.slug}/`)
      }
      for (const file of readdirSync(resolve(root, 'content/exams'))) {
        if (!file.endsWith('.json') || file.endsWith('.schema.json')) continue
        const exam = JSON.parse(readFileSync(resolve(root, 'content/exams', file), 'utf8'))
        urls.push(`/exams/${exam.id}/`)
      }
      const body = urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')
      writeFileSync(
        resolve(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      )
    },
  }
}

export default defineConfig({
  plugins: [vue(), pagesExtras()],
  base: '/',
})
