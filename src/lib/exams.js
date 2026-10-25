// content/exams/*.json 을 모두 읽어 시험 목록을 만든다. 형식은 docs/EXAM_GUIDE.md 참고.
const files = import.meta.glob(['../../content/exams/*.json', '!../../content/exams/*.schema.json'], {
  import: 'default',
  eager: true,
})

function normalize(raw) {
  const questions = []
  const sections = raw.sections.map((s) => {
    const qs = s.questions.map((q) => {
      const kind = q.kind || 'choice' // choice(객관식) · short(단답·빈칸) · essay(서술)
      const item = {
        ...q,
        kind,
        points: q.points ?? 1, // 배점. 생략하면 모든 문항 1점(= 맞힌 비율로 100점 환산)
        number: questions.length + 1,
        sectionId: s.id,
        sectionTitle: s.title,
      }
      if (kind === 'choice') item.answerIndex = q.answer - 1 // 데이터는 1부터, 내부 계산은 0부터
      // 서술 핵심 요소는 문자열 또는 { text, points }. 내부에서는 항상 객체로 다룬다.
      if (kind === 'essay') {
        item.keyPoints = q.keyPoints.map((p) => (typeof p === 'string' ? { text: p, points: 1 } : p))
      }
      questions.push(item)
      return item
    })
    return { id: s.id, title: s.title, questions: qs }
  })
  const kinds = new Set(questions.map((q) => q.kind))
  const format = kinds.size > 1 && kinds.has('choice') ? '혼합' : kinds.has('choice') ? '객관식' : '주관식'
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const weighted = questions.some((q) => q.points !== 1)
  return {
    ...raw, sections, questions, count: questions.length, format, hasChoice: kinds.has('choice'),
    totalPoints, weighted,
  }
}

export const exams = Object.values(files)
  .map(normalize)
  .sort((a, b) => (a.updated === b.updated ? a.id.localeCompare(b.id) : a.updated < b.updated ? 1 : -1))

export const findExam = (id) => exams.find((e) => e.id === id)
export const examPath = (e) => `/exams/${e.id}/`
