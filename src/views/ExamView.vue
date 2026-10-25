<script setup>
import { computed, ref, watch } from 'vue'
import { findExam } from '../lib/exams.js'
import { loadProgress, recordAttempt, resetProgress, saveSession } from '../lib/examStore.js'
import { createSession, grade, needsSelfGrade } from '../lib/examSession.js'
import { useTitle } from '../lib/title.js'
import ExamSetup from '../components/exam/ExamSetup.vue'
import ExamRunner from '../components/exam/ExamRunner.vue'
import ExamSelfGrade from '../components/exam/ExamSelfGrade.vue'
import ExamResult from '../components/exam/ExamResult.vue'
import NotFoundView from './NotFoundView.vue'

const props = defineProps({ id: String })

const exam = computed(() => findExam(props.id))
const progress = ref(exam.value ? loadProgress(exam.value.id) : null)
const phase = ref('setup') // setup → run → (서술형이 있으면 selfgrade) → result
const session = ref(null)
const result = ref(null)

useTitle(() => exam.value?.title || '')

// 답할 때마다 진행 상황을 저장해 두어, 새로고침해도 이어 풀 수 있게 한다.
const inProgress = () => session.value && (phase.value === 'run' || phase.value === 'selfgrade')
watch(
  () => inProgress() && JSON.stringify(session.value.answers),
  () => {
    if (inProgress()) saveSession(exam.value.id, session.value)
  },
)

function scrollTop() {
  window.scrollTo({ top: 0 })
}

function start(config) {
  session.value = createSession(exam.value, progress.value.stats, config)
  saveSession(exam.value.id, session.value)
  phase.value = 'run'
  scrollTop()
}

function resume() {
  // 저장 이후 시험 데이터에서 빠진 문항은 건너뛴다
  const ids = new Set(exam.value.questions.map((q) => q.id))
  const saved = progress.value.session
  session.value = { ...saved, items: saved.items.filter((it) => ids.has(it.id)) }
  phase.value = 'run'
  scrollTop()
}

function answer(id, orig) {
  session.value.answers = { ...session.value.answers, [id]: orig }
}

function submit() {
  // 아직 모범답안을 안 본 서술형이 있으면 자기 채점 단계를 먼저 거친다
  if (phase.value === 'run' && needsSelfGrade(exam.value, session.value)) {
    const answers = { ...session.value.answers }
    for (const { id } of session.value.items) {
      const q = exam.value.questions.find((x) => x.id === id)
      if (q.kind === 'essay') answers[id] = { text: '', points: [], ...(answers[id] || {}), revealed: true }
    }
    session.value.answers = answers
    phase.value = 'selfgrade'
    scrollTop()
    return
  }
  result.value = grade(exam.value, session.value)
  progress.value = recordAttempt(exam.value.id, {
    mode: session.value.mode,
    sections: session.value.config.sections,
    results: result.value.results.map((r) => ({ id: r.id, correct: r.correct })),
  })
  phase.value = 'result'
  scrollTop()
}

function quit() {
  saveSession(exam.value.id, session.value)
  progress.value = loadProgress(exam.value.id)
  phase.value = 'setup'
  scrollTop()
}

function retryWrong() {
  const ids = result.value.results.filter((r) => !r.correct).map((r) => r.id)
  start({ ...session.value.config, ids })
}

function restart() {
  start({ ...session.value.config })
}

function toSetup() {
  progress.value = loadProgress(exam.value.id)
  phase.value = 'setup'
  scrollTop()
}

function reset() {
  resetProgress(exam.value.id)
  progress.value = loadProgress(exam.value.id)
}
</script>

<template>
  <NotFoundView v-if="!exam" />
  <template v-else>
    <header class="exam-head">
      <RouterLink to="/exams/" class="muted back">← 시험 목록</RouterLink>
      <h1 class="page-title">{{ exam.title }}</h1>
      <p class="muted">{{ exam.course }} · {{ exam.format }} {{ exam.count }}문항</p>
    </header>

    <ExamSetup v-if="phase === 'setup'" :exam="exam" :progress="progress" @start="start" @resume="resume" @reset="reset" />
    <ExamRunner v-else-if="phase === 'run'" :exam="exam" :session="session" @answer="answer" @submit="submit" @quit="quit" />
    <ExamSelfGrade v-else-if="phase === 'selfgrade'" :exam="exam" :session="session" @answer="answer" @done="submit" />
    <ExamResult
      v-else
      :session="session"
      :result="result"
      @retry-wrong="retryWrong"
      @restart="restart"
      @setup="toSetup"
    />
  </template>
</template>
