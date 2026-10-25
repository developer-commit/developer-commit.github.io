// 시험 한 회차(세션)를 만들고 채점한다. 화면과 무관한 순수 함수만 둔다.

export const MARKS = ['①', '②', '③', '④', '⑤', '⑥']
export const BOX_LABELS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ']

export const FILTERS = {
  all: '전체 문제',
  unseen: '아직 안 푼 문제',
  'wrong-last': '마지막에 틀린 문제',
  'wrong-ever': '한 번이라도 틀린 문제',
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 필터 조건에 맞는 문항 목록 */
export function pickQuestions(exam, stats, { sections, filter = 'all', ids = null }) {
  if (ids) {
    const set = new Set(ids)
    return exam.questions.filter((q) => set.has(q.id))
  }
  const inScope = exam.questions.filter((q) => sections.includes(q.sectionId))
  switch (filter) {
    case 'unseen':
      return inScope.filter((q) => !stats[q.id])
    case 'wrong-last':
      return inScope.filter((q) => stats[q.id]?.last === 'wrong')
    case 'wrong-ever':
      return inScope.filter((q) => (stats[q.id]?.wrong || 0) > 0)
    default:
      return inScope
  }
}

/**
 * 세션 = { mode, config, items: [{ id, order }], answers: { id: 원래 보기 번호(0부터) }, startedAt }
 * order는 화면에 보일 보기 순서(원래 인덱스 배열). fixedOrder 문항은 섞지 않는다.
 */
export function createSession(exam, stats, config) {
  let qs = pickQuestions(exam, stats, config)
  if (config.shuffleQuestions) qs = shuffle(qs)
  return {
    mode: config.mode,
    config,
    items: qs.map((q) => {
      const order = q.choices.map((_, i) => i)
      return { id: q.id, order: config.shuffleChoices && !q.fixedOrder ? shuffle(order) : order }
    }),
    answers: {},
    startedAt: new Date().toISOString(),
  }
}

/** 채점. 답하지 않은 문항은 틀린 것으로 센다. */
export function grade(exam, session) {
  const byId = Object.fromEntries(exam.questions.map((q) => [q.id, q]))
  const results = session.items.map(({ id }) => {
    const q = byId[id]
    const chosen = session.answers[id]
    return { id, question: q, chosen, answered: chosen !== undefined, correct: chosen === q.answerIndex }
  })
  const sections = exam.sections
    .map((s) => {
      const rs = results.filter((r) => r.question.sectionId === s.id)
      return { id: s.id, title: s.title, total: rs.length, correct: rs.filter((r) => r.correct).length }
    })
    .filter((s) => s.total > 0)
  const correct = results.filter((r) => r.correct).length
  return {
    results,
    sections,
    total: results.length,
    correct,
    unanswered: results.filter((r) => !r.answered).length,
    score: results.length ? Math.round((correct / results.length) * 100) : 0,
  }
}
