import { watchEffect, toValue } from 'vue'
import site from '../site.config.js'

/** 페이지 제목을 "<제목> · Blog-A" 형태로 맞춘다. */
export function useTitle(title) {
  watchEffect(() => {
    const t = toValue(title)
    document.title = t ? `${t} · ${site.title}` : site.title
  })
}
