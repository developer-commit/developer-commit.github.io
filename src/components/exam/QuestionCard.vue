<script setup>
import { computed } from 'vue'
import MarkdownText from '../MarkdownText.vue'
import { MARKS, BOX_LABELS } from '../../lib/examSession.js'

const props = defineProps({
  question: { type: Object, required: true },
  number: { type: Number, required: true }, // 이번 회차에서의 번호
  order: { type: Array, required: true }, // 화면 순서 → 원래 보기 인덱스
  chosen: { type: Number, default: undefined }, // 고른 보기(원래 인덱스)
  revealed: { type: Boolean, default: false }, // 정답·해설 공개 여부
  locked: { type: Boolean, default: false }, // 더 이상 고를 수 없음
})
const emit = defineEmits(['choose'])

const state = computed(() => {
  if (!props.revealed) return props.chosen === undefined ? '' : 'answered'
  return props.chosen === props.question.answerIndex ? 'correct' : 'wrong'
})

function choiceClass(orig) {
  return {
    selected: props.chosen === orig,
    'is-answer': props.revealed && orig === props.question.answerIndex,
    'is-wrong': props.revealed && props.chosen === orig && orig !== props.question.answerIndex,
  }
}

function choose(orig) {
  if (!props.locked) emit('choose', orig)
}
</script>

<template>
  <article :id="`q-${number}`" class="q-card" :class="state">
    <header class="q-head">
      <span class="q-num">{{ number }}</span>
      <span class="q-type">{{ question.type }}</span>
      <span class="q-section muted">{{ question.sectionTitle }}</span>
      <span v-if="revealed" class="q-verdict">{{ state === 'correct' ? '정답' : chosen === undefined ? '미응답' : '오답' }}</span>
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

    <div class="q-choices" role="radiogroup">
      <button
        v-for="(orig, pos) in order"
        :key="orig"
        type="button"
        role="radio"
        class="q-choice"
        :class="choiceClass(orig)"
        :aria-checked="chosen === orig"
        :disabled="locked"
        @click="choose(orig)"
      >
        <span class="q-mark">{{ MARKS[pos] }}</span>
        <MarkdownText :text="question.choices[orig]" tag="span" />
      </button>
    </div>

    <div v-if="revealed" class="q-explain">
      <strong>정답 {{ MARKS[order.indexOf(question.answerIndex)] }}</strong>
      <MarkdownText :text="question.explanation" tag="span" />
    </div>
  </article>
</template>
