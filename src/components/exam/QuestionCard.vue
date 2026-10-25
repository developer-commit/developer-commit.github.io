<script setup>
import { computed, ref, watch } from 'vue'
import MarkdownText from '../MarkdownText.vue'
import { MARKS, BOX_LABELS, isAnswered, scoreQuestion } from '../../lib/examSession.js'

const props = defineProps({
  question: { type: Object, required: true },
  number: { type: Number, required: true }, // 이번 회차에서의 번호
  order: { type: Array, default: null }, // 객관식: 화면 순서 → 원래 보기 인덱스
  answer: { default: undefined }, // 문항 종류별 답 (examSession.js 참고)
  revealed: { type: Boolean, default: false }, // 정답·해설 공개
  locked: { type: Boolean, default: false }, // 답을 더 이상 바꿀 수 없음
  canReveal: { type: Boolean, default: false }, // 연습 모드: 확인/모범답안 보기 버튼
  gradable: { type: Boolean, default: false }, // 서술형: 핵심 요소 체크 가능
})
const emit = defineEmits(['answer'])

const q = computed(() => props.question)
const score = computed(() => scoreQuestion(q.value, props.answer))
const answered = computed(() => isAnswered(q.value, props.answer))

const state = computed(() => {
  if (!props.revealed) return answered.value ? 'answered' : ''
  const c = score.value.credit
  return c === 1 ? 'correct' : c === 0 ? 'wrong' : 'partial'
})
const verdict = computed(() => {
  if (!answered.value) return '미응답'
  const { credit, blanks, points } = score.value
  if (credit === 1) return '정답'
  if (credit === 0) return '오답'
  // 배점이 있는 문항은 받은 점수로, 아니면 맞힌 칸·요소 수로 보여 준다
  if (q.value.points !== 1) return `부분 점수 ${Math.round(credit * q.value.points * 10) / 10}/${q.value.points}`
  const parts = blanks || points
  return `부분 정답 ${parts.filter(Boolean).length}/${parts.length}`
})
const essayGot = computed(() =>
  q.value.kind === 'essay' ? q.value.keyPoints.reduce((s, p, i) => s + (score.value.points[i] ? p.points : 0), 0) : 0,
)
const essayMax = computed(() => (q.value.kind === 'essay' ? q.value.keyPoints.reduce((s, p) => s + p.points, 0) : 0))
const weightedPoints = computed(() => q.value.kind === 'essay' && q.value.keyPoints.some((p) => p.points !== 1))

// ── 객관식 ──
function choiceClass(orig) {
  return {
    selected: props.answer === orig,
    'is-answer': props.revealed && orig === q.value.answerIndex,
    'is-wrong': props.revealed && props.answer === orig && orig !== q.value.answerIndex,
  }
}

// ── 단답·빈칸 ──
// 입력은 여기서 들고 있다가 부모에 알린다. 부모 상태가 돌아오기 전에 다른 칸을 고쳐도 덮어쓰지 않게.
const fromProps = () => q.value.blanks?.map((_, i) => props.answer?.values?.[i] ?? '') || []
const values = ref(fromProps())
watch(() => props.answer?.values, () => (values.value = fromProps()))
function setValue(i, v) {
  values.value[i] = v
  emit('answer', { ...(props.answer || {}), values: values.value.slice() })
}
function check() {
  emit('answer', { values: values.value.slice(), checked: true })
}
const blankLabel = (i) => (q.value.blanks.length > 1 ? `(${i + 1})` : '답')

// ── 서술 ──
function setText(text) {
  emit('answer', { points: [], ...(props.answer || {}), text })
}
function reveal() {
  emit('answer', { text: '', points: [], ...(props.answer || {}), revealed: true })
}
const pointsFromProps = () => q.value.keyPoints?.map((_, k) => Boolean(props.answer?.points?.[k])) || []
const points = ref(pointsFromProps())
watch(() => props.answer?.points, () => (points.value = pointsFromProps()))
function togglePoint(i) {
  points.value[i] = !points.value[i]
  emit('answer', { text: '', ...(props.answer || {}), revealed: true, points: points.value.slice() })
}
</script>

<template>
  <article :id="`q-${number}`" class="q-card" :class="state">
    <header class="q-head">
      <span class="q-num">{{ number }}</span>
      <span class="q-type">{{ question.type }}</span>
      <span class="q-section muted">{{ question.sectionTitle }}</span>
      <span v-if="question.points !== 1" class="q-points-tag">{{ question.points }}점</span>
      <span v-if="revealed" class="q-verdict">{{ verdict }}</span>
    </header>

    <MarkdownText :text="question.prompt" class="q-prompt" />

    <div v-if="question.box" class="q-box">
      <span class="q-box-label">보기</span>
      <ol v-if="Array.isArray(question.box)" class="q-box-list">
        <li v-for="(line, i) in question.box" :key="i">
          <span class="q-box-mark">{{ BOX_LABELS[i] }}.</span>
          <MarkdownText :text="line" tag="span" />
        </li>
      </ol>
      <MarkdownText v-else :text="question.box" />
    </div>

    <!-- 객관식 -->
    <template v-if="question.kind === 'choice'">
      <div class="q-choices" role="radiogroup">
        <button
          v-for="(orig, pos) in order"
          :key="orig"
          type="button"
          role="radio"
          class="q-choice"
          :class="choiceClass(orig)"
          :aria-checked="answer === orig"
          :disabled="locked"
          @click="!locked && emit('answer', orig)"
        >
          <span class="q-mark">{{ MARKS[pos] }}</span>
          <MarkdownText :text="question.choices[orig]" tag="span" />
        </button>
      </div>
      <div v-if="revealed" class="q-explain">
        <strong>정답 {{ MARKS[order.indexOf(question.answerIndex)] }}</strong>
        <MarkdownText :text="question.explanation" tag="span" />
      </div>
    </template>

    <!-- 단답·빈칸 -->
    <template v-else-if="question.kind === 'short'">
      <form class="q-blanks" @submit.prevent="canReveal && !locked && check()">
        <label
          v-for="(accepted, i) in question.blanks"
          :key="i"
          class="q-blank"
          :class="revealed && (score.blanks[i] ? 'ok' : 'ng')"
        >
          <span class="q-blank-label">{{ blankLabel(i) }}</span>
          <input
            :value="values[i]"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :disabled="locked"
            :placeholder="locked ? '' : '답을 입력'"
            @input="setValue(i, $event.target.value)"
          />
          <span v-if="revealed" class="q-blank-mark">{{ score.blanks[i] ? '✓' : '✗' }}</span>
        </label>
        <button v-if="canReveal && !locked" type="submit" class="btn small primary q-check">확인</button>
      </form>
      <p v-if="question.anyOrder && !revealed" class="muted q-hint">순서 상관없이 채점합니다</p>
      <div v-if="revealed" class="q-explain">
        <div class="q-answers">
          <strong>정답</strong>
          <span v-for="(accepted, i) in question.blanks" :key="i" class="q-answer-item">
            <template v-if="question.blanks.length > 1">({{ i + 1 }}) </template>{{ accepted[0] }}
            <span v-if="accepted.length > 1" class="muted">· {{ accepted.slice(1).join(' · ') }}</span>
          </span>
        </div>
        <MarkdownText :text="question.explanation" tag="div" />
      </div>
    </template>

    <!-- 서술 -->
    <template v-else>
      <textarea
        class="q-essay"
        :value="answer?.text || ''"
        rows="5"
        :disabled="locked || answer?.revealed"
        :placeholder="locked || answer?.revealed ? '' : '답안을 서술하세요. 다 쓴 뒤 모범답안과 비교해 스스로 채점합니다.'"
        @input="setText($event.target.value)"
      />
      <p v-if="(locked || answer?.revealed) && !answer?.text?.trim()" class="muted q-hint">작성한 답안 없음</p>
      <button v-if="canReveal && !answer?.revealed && !locked" type="button" class="btn small primary" @click="reveal">
        모범답안 보고 채점하기
      </button>
      <div v-if="revealed || answer?.revealed" class="q-model">
        <strong class="q-model-title">모범답안</strong>
        <MarkdownText :text="question.modelAnswer" block breaks />
        <div class="q-points">
          <strong class="q-model-title">
            {{ weightedPoints ? '채점 기준' : '핵심 요소' }}
            <span class="muted">
              — 내 답에 들어간 것을 체크
              ({{ weightedPoints ? `${essayGot}/${essayMax}점` : `${score.points.filter(Boolean).length}/${question.keyPoints.length}` }})
            </span>
          </strong>
          <label v-for="(p, i) in question.keyPoints" :key="i" class="q-point" :class="{ on: score.points[i] }">
            <input type="checkbox" :checked="score.points[i]" :disabled="!gradable" @change="togglePoint(i)" />
            <MarkdownText :text="p.text" tag="span" />
            <span v-if="weightedPoints" class="q-point-score">{{ p.points }}점</span>
          </label>
        </div>
        <MarkdownText v-if="question.explanation" :text="question.explanation" class="q-explain" />
      </div>
    </template>
  </article>
</template>
