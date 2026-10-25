<script setup>
import { ref } from 'vue'
import site from './site.config.js'

const theme = ref(document.documentElement.dataset.theme || '')

function toggleTheme() {
  const dark = theme.value
    ? theme.value === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.value = dark ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  try {
    localStorage.setItem('theme', theme.value)
  } catch {
    /* 무시 */
  }
}
</script>

<template>
  <header class="site-header">
    <div class="wrap header-inner">
      <RouterLink to="/" class="brand">
        <img src="/favicon.svg" alt="" width="24" height="24" />
        <span>{{ site.title }}</span>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/posts/">글</RouterLink>
        <RouterLink to="/exams/">시험</RouterLink>
        <a :href="site.github" target="_blank" rel="noopener">GitHub</a>
        <button class="icon-btn" type="button" aria-label="테마 바꾸기" @click="toggleTheme">◐</button>
      </nav>
    </div>
  </header>

  <main class="wrap main">
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="wrap">© {{ new Date().getFullYear() }} {{ site.title }} · Vue로 만든 정적 블로그</div>
  </footer>
</template>
