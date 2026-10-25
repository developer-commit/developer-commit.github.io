// content/exams/*.json 을 모두 읽어 시험 목록을 만든다. 형식은 docs/EXAM_GUIDE.md 참고.
const files = import.meta.glob(['../../content/exams/*.json', '!../../content/exams/*.schema.json'], {
  import: 'default',
  eager: true,
})

function normalize(raw) {
  const questions = []
  const sections = raw.sections.map((s) => {
    const qs = s.questions.map((q) => {
      const item = {
        ...q,
        number: questions.length + 1,
        sectionId: s.id,
        sectionTitle: s.title,
        answerIndex: q.answer - 1, // 데이터는 1부터, 내부 계산은 0부터
      }
      questions.push(item)
      return item
    })
    return { id: s.id, title: s.title, questions: qs }
  })
  return { ...raw, sections, questions, count: questions.length }
}

export const exams = Object.values(files)
  .map(normalize)
  .sort((a, b) => (a.updated < b.updated ? 1 : -1))

export const findExam = (id) => exams.find((e) => e.id === id)
export const examPath = (e) => `/exams/${e.id}/`
