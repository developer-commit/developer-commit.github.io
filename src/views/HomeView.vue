<script setup>
import site from '../site.config.js'
import { posts, categoriesWithCount } from '../lib/posts.js'
import { exams } from '../lib/exams.js'
import { useTitle } from '../lib/title.js'
import PostItem from '../components/PostItem.vue'
import ExamCard from '../components/ExamCard.vue'

useTitle('')
const recent = posts.slice(0, 6)
const categories = categoriesWithCount()
</script>

<template>
  <section class="hero">
    <h1>{{ site.title }}</h1>
    <p>{{ site.description }}</p>
  </section>

  <section v-if="exams.length" class="block">
    <div class="block-head">
      <h2>시험 문제</h2>
      <RouterLink to="/exams/" class="more">전체 보기 →</RouterLink>
    </div>
    <div class="exam-grid">
      <ExamCard v-for="e in exams.slice(0, 4)" :key="e.id" :exam="e" />
    </div>
  </section>

  <section class="block">
    <div class="block-head">
      <h2>최근 글</h2>
      <RouterLink to="/posts/" class="more">전체 보기 →</RouterLink>
    </div>
    <div class="chips">
      <RouterLink v-for="c in categories" :key="c.id" :to="`/${c.id}/`" class="chip">
        {{ c.name }} <span class="muted">{{ c.count }}</span>
      </RouterLink>
    </div>
    <PostItem v-for="p in recent" :key="p.category + p.slug" :post="p" />
  </section>
</template>
