import { parseFrontmatter } from './frontmatter.js'
import site from '../site.config.js'

// content/posts/*.md 를 빌드 시점에 모두 읽어 온다.
const files = import.meta.glob('../../content/posts/*.md', { query: '?raw', import: 'default', eager: true })

export const posts = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw)
    const fileSlug = path.split('/').pop().replace(/\.md$/, '')
    return {
      title: data.title || fileSlug,
      date: data.date || '',
      category: data.category || 'study',
      slug: data.slug || fileSlug,
      tags: Array.isArray(data.tags) ? data.tags : [],
      description: data.description || '',
      draft: data.draft === true,
      body,
    }
  })
  .filter((p) => !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))

export const postPath = (p) => `/${p.category}/${p.slug}/`
export const categoryName = (c) => site.categories[c] || c

export function findPost(category, slug) {
  return posts.find((p) => p.category === category && p.slug === slug)
}

export function categoriesWithCount() {
  const counts = {}
  for (const p of posts) counts[p.category] = (counts[p.category] || 0) + 1
  return Object.entries(counts).map(([id, count]) => ({ id, name: categoryName(id), count }))
}

export function tagsWithCount() {
  const counts = {}
  for (const p of posts) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }))
}
