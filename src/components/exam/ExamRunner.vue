<script setup>
import { computed, ref } from 'vue'
import QuestionCard from './QuestionCard.vue'

const props = defineProps({
  exam: { type: Object, required: true },
  session: { type: Object, required: true },
})
const emit = defineEmits(['answer', 'submit', 'quit'])

const byId = computed(() => Object.fromEntries(props.exam.questions.map((q) => [q.id, q])))
const practice = computed(() => props.session.mode === 'practice')
const answered = computed(() => Object.keys(props.session.answers).length)
const total = computed(() => props.session.items.length)
const correctSoFar = computed(
  () => props.session.items.filter(({ id }) => props.session.answers[id] === byId.value[id].answerIndex).length,
)
const showSheet = ref(false)

function cellState(id) {
  const chosen = props.session.answers[id]
  if (chosen === undefined) return ''
  if (!practice.value) return 'answered'
  return chosen === byId.value[id].answerIndex ? 'correct' : 'wrong'
}

function jump(n) {
  document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  showSheet.value = false
}

function submit() {
  const left = total.value - answered.value
  if (left && !window.confirm(`아직 ${left}문항에 답하지 않았습니다. 답하지 않은 문항은 틀린 것으로 채점할까요?`)) return
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
      :chosen="session.answers[item.id]"
      :revealed="practice && session.answers[item.id] !== undefined"
      :locked="practice && session.answers[item.id] !== undefined"
      @choose="(orig) => emit('answer', item.id, orig)"
    />

    <div class="runner-end">
      <button type="button" class="btn ghost" @click="emit('quit')">나중에 이어 풀기</button>
      <button type="button" class="btn primary" @click="submit">{{ practice ? '끝내고 결과 보기' : '제출하고 채점하기' }}</button>
    </div>
  </div>
</template>
