<script setup>
import { computed } from 'vue'
import { examPath } from '../lib/exams.js'
import { loadProgress } from '../lib/examStore.js'

const props = defineProps({ exam: { type: Object, required: true } })

// 마지막 풀이에서 맞힌 문항 비율 = 암기율
const mastered = computed(() => {
  const { stats } = loadProgress(props.exam.id)
  return props.exam.questions.filter((q) => stats[q.id]?.last === 'correct').length
})
const pct = computed(() => Math.round((mastered.value / props.exam.count) * 100))
</script>

<template>
  <RouterLink :to="examPath(exam)" class="exam-card">
    <div class="exam-card-top">
      <span class="chip">{{ exam.course }}</span>
      <span class="muted">{{ exam.count }}문항 · {{ exam.sections.length }}개 단원</span>
    </div>
    <h3>{{ exam.title }}</h3>
    <p class="desc">{{ exam.description }}</p>
    <div class="mastery">
      <div class="bar"><span :style="{ width: pct + '%' }" /></div>
      <span class="muted">암기 {{ mastered }}/{{ exam.count }}</span>
    </div>
  </RouterLink>
</template>
