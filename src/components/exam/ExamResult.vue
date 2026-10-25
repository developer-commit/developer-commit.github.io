<script setup>
import { computed, ref } from 'vue'
import QuestionCard from './QuestionCard.vue'

const props = defineProps({
  session: { type: Object, required: true },
  result: { type: Object, required: true },
})
const emit = defineEmits(['retry-wrong', 'restart', 'setup'])

const filter = ref('wrong')
const orderById = computed(() => Object.fromEntries(props.session.items.map((it, i) => [it.id, { ...it, n: i + 1 }])))
const shown = computed(() =>
  filter.value === 'wrong' ? props.result.results.filter((r) => !r.correct) : props.result.results,
)
// 다 맞히지 못한 문항 = 오답 + 부분 정답 + 미응답
const notPerfect = computed(() => props.result.total - props.result.correct)
const wrongOnly = computed(() => notPerfect.value - props.result.partial - props.result.unanswered)

const verdict = computed(() => {
  const s = props.result.score
  if (s === 100) return '전부 맞혔습니다. 이 범위는 암기 완료!'
  if (s >= 90) return '거의 다 왔습니다. 틀린 문제만 한 번 더.'
  if (s >= 70) return '뼈대는 잡혔습니다. 틀린 문제의 해설을 읽고 다시 풀어 보세요.'
  return '핵심노트를 한 번 더 훑고 틀린 문제부터 다시 풀어 보세요.'
})
</script>

<template>
  <div class="result">
    <section class="card score-card">
      <div class="score">{{ result.score }}<small>점</small></div>
      <div>
        <p class="score-line">{{ result.total }}문항 중 <strong>{{ result.correct }}</strong>문항 정답</p>
        <p class="muted">
          오답 {{ wrongOnly }}<template v-if="result.partial"> · 부분 정답 {{ result.partial }}</template> · 미응답 {{ result.unanswered }}
        </p>
        <p>{{ verdict }}</p>
      </div>
    </section>

    <section class="card">
      <h2>단원별</h2>
      <div v-for="s in result.sections" :key="s.id" class="section-row static">
        <span class="section-name">{{ s.title }}</span>
        <span class="section-bar" :class="{ low: s.credit / s.total < 0.7 }"><span :style="{ width: (s.credit / s.total) * 100 + '%' }" /></span>
        <span class="muted section-count">{{ Math.round((s.credit / s.total) * 100) }}점</span>
      </div>
    </section>

    <div class="result-actions">
      <button v-if="notPerfect" type="button" class="btn primary" @click="emit('retry-wrong')">
        못 맞힌 {{ notPerfect }}문항 다시 풀기
      </button>
      <button type="button" class="btn" @click="emit('restart')">같은 설정으로 다시</button>
      <button type="button" class="btn ghost" @click="emit('setup')">설정으로</button>
    </div>

    <div class="card-head review-head">
      <h2>다시 보기</h2>
      <div class="seg compact">
        <label :class="{ on: filter === 'wrong' }"><input v-model="filter" type="radio" value="wrong" /> 못 맞힌 문제 {{ notPerfect }}</label>
        <label :class="{ on: filter === 'all' }"><input v-model="filter" type="radio" value="all" /> 전체 {{ result.total }}</label>
      </div>
    </div>
    <QuestionCard
      v-for="r in shown"
      :key="r.id"
      :question="r.question"
      :number="orderById[r.id].n"
      :order="orderById[r.id].order"
      :answer="r.chosen"
      revealed
      locked
    />
    <p v-if="!shown.length" class="muted">틀린 문제가 없습니다.</p>
  </div>
</template>
