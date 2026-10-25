<script setup>
import { computed, reactive, watch } from 'vue'
import { FILTERS, pickQuestions } from '../../lib/examSession.js'
import { loadSetup, saveSetup } from '../../lib/examStore.js'

const props = defineProps({
  exam: { type: Object, required: true },
  progress: { type: Object, required: true },
})
const emit = defineEmits(['start', 'resume', 'reset'])

// 마지막으로 쓴 설정을 기억한다 (없어진 단원 id는 버림)
const sectionIds = props.exam.sections.map((s) => s.id)
const saved = loadSetup(props.exam.id)
const config = reactive({
  sections: sectionIds,
  filter: 'all',
  mode: 'practice',
  shuffleQuestions: false,
  shuffleChoices: false,
  ...saved,
})
if (saved?.sections) config.sections = saved.sections.filter((id) => sectionIds.includes(id))
if (!(config.filter in FILTERS)) config.filter = 'all'
watch(config, () => saveSetup(props.exam.id, { ...config }), { deep: true })

const stats = computed(() => props.progress.stats)
const pickedCount = computed(() => pickQuestions(props.exam, stats.value, config).length)
const filterCounts = computed(() =>
  Object.fromEntries(
    Object.keys(FILTERS).map((f) => [f, pickQuestions(props.exam, stats.value, { ...config, filter: f }).length]),
  ),
)

function sectionMastery(s) {
  const done = s.questions.filter((q) => stats.value[q.id]?.last === 'correct').length
  return { done, pct: Math.round((done / s.questions.length) * 100) }
}

function toggleSection(id) {
  const i = config.sections.indexOf(id)
  if (i >= 0) config.sections.splice(i, 1)
  else config.sections.push(id)
}
const allSelected = computed(() => config.sections.length === props.exam.sections.length)
function toggleAll() {
  config.sections = allSelected.value ? [] : props.exam.sections.map((s) => s.id)
}

const session = computed(() => props.progress.session)
const sessionAnswered = computed(() => (session.value ? Object.keys(session.value.answers).length : 0))

const fmt = (iso) =>
  new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

function confirmReset() {
  if (window.confirm('이 시험의 풀이 기록(암기율·오답·회차 기록)을 모두 지울까요?')) emit('reset')
}
</script>

<template>
  <div class="setup">
    <div v-if="session" class="resume card">
      <div>
        <strong>풀던 시험이 있습니다</strong>
        <p class="muted">{{ session.items.length }}문항 중 {{ sessionAnswered }}문항 답함 · {{ fmt(session.startedAt) }} 시작</p>
      </div>
      <button type="button" class="btn primary" @click="emit('resume')">이어 풀기</button>
    </div>

    <section class="card">
      <div class="card-head">
        <h2>범위</h2>
        <button type="button" class="btn ghost small" @click="toggleAll">{{ allSelected ? '전체 해제' : '전체 선택' }}</button>
      </div>
      <div class="section-list">
        <label v-for="s in exam.sections" :key="s.id" class="section-row" :class="{ on: config.sections.includes(s.id) }">
          <input type="checkbox" :checked="config.sections.includes(s.id)" @change="toggleSection(s.id)" />
          <span class="section-name">{{ s.title }}</span>
          <span class="section-bar"><span :style="{ width: sectionMastery(s).pct + '%' }" /></span>
          <span class="muted section-count">{{ sectionMastery(s).done }}/{{ s.questions.length }}</span>
        </label>
      </div>
      <p class="muted hint">막대 = 마지막 풀이에서 맞힌 문항(암기율)</p>
    </section>

    <section class="card">
      <h2>문제 고르기</h2>
      <div class="seg">
        <label v-for="(label, f) in FILTERS" :key="f" :class="{ on: config.filter === f }">
          <input v-model="config.filter" type="radio" :value="f" />
          {{ label }} <span class="muted">{{ filterCounts[f] }}</span>
        </label>
      </div>

      <h2>방식</h2>
      <div class="seg">
        <label :class="{ on: config.mode === 'practice' }">
          <input v-model="config.mode" type="radio" value="practice" />
          연습 모드 <span class="muted">문항마다 바로 정답·해설</span>
        </label>
        <label :class="{ on: config.mode === 'exam' }">
          <input v-model="config.mode" type="radio" value="exam" />
          시험 모드 <span class="muted">다 풀고 한 번에 채점</span>
        </label>
      </div>

      <div class="toggles">
        <label><input v-model="config.shuffleQuestions" type="checkbox" /> 문제 순서 섞기</label>
        <label v-if="exam.hasChoice"><input v-model="config.shuffleChoices" type="checkbox" /> 보기 순서 섞기 <span class="muted">(순서·조합형 제외)</span></label>
      </div>
      <p v-if="exam.format !== '객관식'" class="muted hint">
        단답·빈칸형은 띄어쓰기·대소문자를 무시하고 자동 채점합니다. 서술형은 모범답안의 핵심 요소로 스스로 채점합니다.
      </p>

      <button type="button" class="btn primary wide" :disabled="!pickedCount" @click="emit('start', { ...config, sections: [...config.sections] })">
        {{ pickedCount ? `${pickedCount}문항 시작` : '고른 범위에 문제가 없습니다' }}
      </button>
    </section>

    <section v-if="progress.history.length" class="card">
      <div class="card-head">
        <h2>최근 기록</h2>
        <button type="button" class="btn ghost small danger" @click="confirmReset">기록 초기화</button>
      </div>
      <ul class="history">
        <li v-for="h in progress.history.slice(0, 10)" :key="h.at">
          <span>{{ fmt(h.at) }}</span>
          <span class="muted">{{ h.mode === 'exam' ? '시험' : '연습' }}</span>
          <span class="history-score">{{ h.correct }}/{{ h.total }}</span>
          <span class="muted">{{ Math.round((h.correct / h.total) * 100) }}점</span>
        </li>
      </ul>
    </section>
  </div>
</template>
