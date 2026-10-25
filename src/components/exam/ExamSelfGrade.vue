<script setup>
import { computed } from 'vue'
import QuestionCard from './QuestionCard.vue'

// 서술형 자기 채점: 모범답안과 핵심 요소를 보고, 내 답에 들어간 요소를 체크한다.
const props = defineProps({
  exam: { type: Object, required: true },
  session: { type: Object, required: true },
})
const emit = defineEmits(['answer', 'done'])

const byId = computed(() => Object.fromEntries(props.exam.questions.map((q) => [q.id, q])))
const essays = computed(() =>
  props.session.items
    .map((item, i) => ({ ...item, n: i + 1 }))
    .filter(({ id }) => byId.value[id].kind === 'essay'),
)
</script>

<template>
  <div class="selfgrade">
    <section class="card">
      <h2>서술형 자기 채점</h2>
      <p class="muted">
        서술형 {{ essays.length }}문항의 모범답안입니다. 내 답안에 들어간 핵심 요소를 체크하면 체크한 비율만큼 점수가 됩니다.
        표현이 달라도 뜻이 같으면 체크하세요.
      </p>
    </section>

    <QuestionCard
      v-for="item in essays"
      :key="item.id"
      :question="byId[item.id]"
      :number="item.n"
      :answer="session.answers[item.id]"
      revealed
      locked
      gradable
      @answer="(a) => emit('answer', item.id, a)"
    />

    <div class="runner-end">
      <button type="button" class="btn primary" @click="emit('done')">채점 끝내고 결과 보기</button>
    </div>
  </div>
</template>
