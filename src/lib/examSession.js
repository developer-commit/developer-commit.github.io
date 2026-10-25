// 시험 한 회차(세션)를 만들고 채점한다. 화면과 무관한 순수 함수만 둔다.
import { gradeBlanks } from './answerMatch.js'

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
 * 세션 = { mode, config, items: [{ id, order? }], answers: { id: 답 }, startedAt }
 * 답의 형태는 문항 종류마다 다르다.
 *   choice: 고른 보기의 원래 인덱스(0부터). order = 화면에 보일 보기 순서.
 *   short:  { values: [칸별 입력], checked: 확인 버튼을 눌렀는지 }
 *   essay:  { text, revealed: 모범답안을 봤는지, points: [핵심 요소별 체크] }
 */
export function createSession(exam, stats, config) {
  let qs = pickQuestions(exam, stats, config)
  if (config.shuffleQuestions) qs = shuffle(qs)
  return {
    mode: config.mode,
    config,
    items: qs.map((q) => {
      if (q.kind !== 'choice') return { id: q.id }
      const order = q.choices.map((_, i) => i)
      return { id: q.id, order: config.shuffleChoices && !q.fixedOrder ? shuffle(order) : order }
    }),
    answers: {},
    startedAt: new Date().toISOString(),
  }
}

/** 무엇이든 답을 적었는지 */
export function isAnswered(q, a) {
  if (a === undefined || a === null) return false
  if (q.kind === 'choice') return true
  if (q.kind === 'short') return a.values?.some((v) => v && v.trim())
  // 서술형: 답을 썼거나, 머릿속으로 답하고 핵심 요소를 체크했으면 응답한 것
  return Boolean(a.text?.trim()) || Boolean(a.points?.some(Boolean))
}

/** 연습 모드에서 정답을 보여 줄 상태인지 (시험 모드는 결과 화면에서만 공개) */
export function isRevealedInPractice(q, a) {
  if (!a && a !== 0) return false
  if (q.kind === 'choice') return true
  if (q.kind === 'short') return Boolean(a.checked)
  return Boolean(a.revealed)
}

/** 서술형 중 아직 자기 채점(모범답안 확인)을 안 한 문항이 있는지 */
export function needsSelfGrade(exam, session) {
  const byId = Object.fromEntries(exam.questions.map((q) => [q.id, q]))
  return session.items.some(({ id }) => byId[id].kind === 'essay' && !session.answers[id]?.revealed)
}

/** 문항 하나의 점수(0–1)와 칸·요소별 판정 */
export function scoreQuestion(q, a) {
  if (q.kind === 'choice') {
    const ok = a === q.answerIndex
    return { credit: ok ? 1 : 0 }
  }
  if (q.kind === 'short') {
    const blanks = gradeBlanks(q.blanks, a?.values || [], q.anyOrder)
    return { credit: blanks.filter(Boolean).length / q.blanks.length, blanks }
  }
  const points = q.keyPoints.map((_, i) => Boolean(a?.points?.[i]))
  return { credit: points.filter(Boolean).length / q.keyPoints.length, points }
}

/** 채점. 답하지 않은 문항은 0점. 단답 빈칸·서술 요소는 부분 점수. */
export function grade(exam, session) {
  const byId = Object.fromEntries(exam.questions.map((q) => [q.id, q]))
  const results = session.items.map(({ id }) => {
    const q = byId[id]
    const chosen = session.answers[id]
    const { credit } = scoreQuestion(q, chosen)
    return { id, question: q, chosen, answered: isAnswered(q, chosen), credit, correct: credit === 1 }
  })
  const sections = exam.sections
    .map((s) => {
      const rs = results.filter((r) => r.question.sectionId === s.id)
      const credit = rs.reduce((sum, r) => sum + r.credit, 0)
      return { id: s.id, title: s.title, total: rs.length, correct: rs.filter((r) => r.correct).length, credit }
    })
    .filter((s) => s.total > 0)
  const credit = results.reduce((sum, r) => sum + r.credit, 0)
  return {
    results,
    sections,
    total: results.length,
    correct: results.filter((r) => r.correct).length,
    partial: results.filter((r) => r.credit > 0 && r.credit < 1).length,
    unanswered: results.filter((r) => !r.answered).length,
    score: results.length ? Math.round((credit / results.length) * 100) : 0,
  }
}
