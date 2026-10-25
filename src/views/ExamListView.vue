<script setup>
import { exams } from '../lib/exams.js'
import { useTitle } from '../lib/title.js'
import ExamCard from '../components/ExamCard.vue'

useTitle('시험')
</script>

<template>
  <h1 class="page-title">시험</h1>
  <p class="muted">강의 내용을 객관식·주관식 문제로 확인합니다. 풀이 기록은 이 브라우저에만 저장됩니다.</p>
  <div class="exam-grid">
    <ExamCard v-for="e in exams" :key="e.id" :exam="e" />
  </div>
  <p v-if="!exams.length" class="muted">아직 등록된 시험이 없습니다.</p>
</template>
