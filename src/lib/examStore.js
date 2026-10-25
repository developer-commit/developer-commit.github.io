// 시험별 풀이 기록을 브라우저(localStorage)에 저장한다.
// 저장이 막힌 환경(사생활 보호 모드 등)에서도 페이지는 그대로 동작해야 하므로 모든 접근을 try/catch로 감싼다.
//
// 저장 형태: exam-progress:<examId> = {
//   v: 1,
//   stats:   { [questionId]: { attempts, wrong, last: 'correct' | 'wrong', at } },
//   history: [{ at, mode, total, correct, sections: [sectionId] }],   // 최근 30회
//   session: 진행 중인 풀이(이어 풀기용) | null,
// }
const VERSION = 1
const key = (examId) => `exam-progress:${examId}`

function empty() {
  return { v: VERSION, stats: {}, history: [], session: null }
}

export function loadProgress(examId) {
  try {
    const raw = localStorage.getItem(key(examId))
    if (!raw) return empty()
    const data = JSON.parse(raw)
    return data && data.v === VERSION ? { ...empty(), ...data } : empty()
  } catch {
    return empty()
  }
}

function save(examId, data) {
  try {
    localStorage.setItem(key(examId), JSON.stringify(data))
  } catch {
    /* 저장 불가 — 기록 없이 계속 */
  }
}

export function saveSession(examId, session) {
  const data = loadProgress(examId)
  data.session = session
  save(examId, data)
}

/** 채점 결과를 문항별 통계와 회차 기록에 반영한다. results: [{ id, correct }] */
export function recordAttempt(examId, { mode, sections, results }) {
  const data = loadProgress(examId)
  const at = new Date().toISOString()
  for (const { id, correct } of results) {
    const s = data.stats[id] || { attempts: 0, wrong: 0 }
    s.attempts += 1
    if (!correct) s.wrong += 1
    s.last = correct ? 'correct' : 'wrong'
    s.at = at
    data.stats[id] = s
  }
  data.history = [
    { at, mode, total: results.length, correct: results.filter((r) => r.correct).length, sections },
    ...data.history,
  ].slice(0, 30)
  data.session = null
  save(examId, data)
  return data
}

// 시험 설정 화면의 마지막 선택(범위·모드·섞기). 풀이 기록과 따로 둔다.
export function loadSetup(examId) {
  try {
    return JSON.parse(localStorage.getItem(`exam-setup:${examId}`)) || null
  } catch {
    return null
  }
}

export function saveSetup(examId, setup) {
  try {
    localStorage.setItem(`exam-setup:${examId}`, JSON.stringify(setup))
  } catch {
    /* 무시 */
  }
}

export function resetProgress(examId) {
  try {
    localStorage.removeItem(key(examId))
  } catch {
    /* 무시 */
  }
}
