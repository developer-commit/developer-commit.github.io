<script setup>
import { computed, ref } from 'vue'
import QuestionCard from './QuestionCard.vue'
import { isAnswered, isRevealedInPractice, scoreQuestion } from '../../lib/examSession.js'

const props = defineProps({
  exam: { type: Object, required: true },
  session: { type: Object, required: true },
})
const emit = defineEmits(['answer', 'submit', 'quit'])

const byId = computed(() => Object.fromEntries(props.exam.questions.map((q) => [q.id, q])))
const practice = computed(() => props.session.mode === 'practice')
const answerOf = (id) => props.session.answers[id]
const revealedNow = (id) => practice.value && isRevealedInPractice(byId.value[id], answerOf(id))

const answered = computed(() => props.session.items.filter(({ id }) => isAnswered(byId.value[id], answerOf(id))).length)
const total = computed(() => props.session.items.length)
const correctSoFar = computed(
  () => props.session.items.filter(({ id }) => revealedNow(id) && scoreQuestion(byId.value[id], answerOf(id)).credit === 1).length,
)
const showSheet = ref(false)

function cellState(id) {
  if (revealedNow(id)) {
    const c = scoreQuestion(byId.value[id], answerOf(id)).credit
    return c === 1 ? 'correct' : c === 0 ? 'wrong' : 'partial'
  }
  return isAnswered(byId.value[id], answerOf(id)) ? 'answered' : ''
}

function jump(n) {
  document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  showSheet.value = false
}

function submit() {
  const left = total.value - answered.value
  if (left && !window.confirm(`아직 ${left}문항에 답하지 않았습니다. 답하지 않은 문항은 0점으로 채점할까요?`)) return
  emit('submit')
}
</script>

<template>
  <div class="runner">
    <div class="runner-bar">
      <div class="runner-progress">
        <div class="bar"><span :style="{ width: (answered / total) * 100 + '%' }" /></div>
        <span class="runner-count">
          {{ answered }}/{{ total }}
          <template v-if="practice"> · 맞힘 {{ correctSoFar }}</template>
        </span>
      </div>
      <div class="runner-actions">
        <button type="button" class="btn ghost small" @click="showSheet = !showSheet">답안지</button>
        <button type="button" class="btn primary small" @click="submit">{{ practice ? '끝내기' : '제출' }}</button>
      </div>
      <div v-if="showSheet" class="sheet">
        <button
          v-for="(item, i) in session.items"
          :key="item.id"
          type="button"
          class="sheet-cell"
          :class="cellState(item.id)"
          @click="jump(i + 1)"
        >
          {{ i + 1 }}
        </button>
      </div>
    </div>

    <QuestionCard
      v-for="(item, i) in session.items"
      :key="item.id"
      :question="byId[item.id]"
      :number="i + 1"
      :order="item.order"
      :answer="answerOf(item.id)"
      :revealed="revealedNow(item.id)"
      :locked="revealedNow(item.id) && byId[item.id].kind !== 'essay'"
      :can-reveal="practice"
      :gradable="practice"
      @answer="(a) => emit('answer', item.id, a)"
    />

    <div class="runner-end">
      <button type="button" class="btn ghost" @click="emit('quit')">나중에 이어 풀기</button>
      <button type="button" class="btn primary" @click="submit">{{ practice ? '끝내고 결과 보기' : '제출하고 채점하기' }}</button>
    </div>
  </div>
</template>
