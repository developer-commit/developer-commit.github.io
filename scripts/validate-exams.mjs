// content/exams/*.json 검사. `npm run validate` (빌드 전에 자동 실행).
// 규칙은 docs/EXAM_GUIDE.md 와 content/exams/exam.schema.json 에 적힌 것과 같다.
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import katex from 'katex'
import { normalizeAnswer } from '../src/lib/answerMatch.js'

const dir = resolve(import.meta.dirname, '../content/exams')
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

const ID = /^[a-z0-9][a-z0-9-]*$/
const QID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TOP_KEYS = new Set(['$schema', 'id', 'title', 'course', 'description', 'tags', 'updated', 'sections'])
const Q_KEYS = new Set(['id', 'kind', 'type', 'prompt', 'box', 'choices', 'answer', 'fixedOrder', 'blanks', 'anyOrder', 'modelAnswer', 'keyPoints', 'explanation'])
const KINDS = new Set(['choice', 'short', 'essay'])
// 한 종류의 문항에서만 쓰는 필드
const KIND_ONLY = {
  choices: 'choice', answer: 'choice', fixedOrder: 'choice',
  blanks: 'short', anyOrder: 'short',
  modelAnswer: 'essay', keyPoints: 'essay',
}

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0

// 마크다운 문자열 안의 $수식$ 이 KaTeX로 그려지는지, ``` 가 짝이 맞는지 확인
function checkMarkdown(where, text) {
  if ((text.match(/```/g) || []).length % 2) err(where, '``` 코드 블록이 닫히지 않았습니다')
  const withoutCode = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/\\\$/g, '')
  const dollars = (withoutCode.match(/\$/g) || []).length
  if (dollars % 2) err(where, '$ 수식이 닫히지 않았습니다 (글자 $는 \\$ 로 쓰기)')
  for (const m of withoutCode.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g)) {
    try {
      katex.renderToString(m[1] ?? m[2], { throwOnError: true })
    } catch (e) {
      err(where, `수식 오류 "${m[0]}" — ${e.message.split('\n')[0]}`)
    }
  }
}

const seenExamIds = new Map()
let totalQuestions = 0

for (const file of readdirSync(dir).sort()) {
  if (!file.endsWith('.json') || file.endsWith('.schema.json')) continue
  let exam
  try {
    exam = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
  } catch (e) {
    err(file, `JSON 문법 오류 — ${e.message}`)
    continue
  }

  for (const k of Object.keys(exam)) if (!TOP_KEYS.has(k)) warn(file, `알 수 없는 필드 "${k}"`)
  if (!ID.test(exam.id || '')) err(file, 'id는 소문자·숫자·하이픈만 (예: "os-2026-1")')
  else if (file !== `${exam.id}.json`) err(file, `파일 이름은 "${exam.id}.json" 이어야 합니다`)
  if (seenExamIds.has(exam.id)) err(file, `id "${exam.id}" 가 ${seenExamIds.get(exam.id)} 와 겹칩니다`)
  seenExamIds.set(exam.id, file)
  for (const k of ['title', 'course', 'description']) if (!nonEmpty(exam[k])) err(file, `"${k}" 가 비어 있습니다`)
  if (!DATE.test(exam.updated || '')) err(file, '"updated" 는 YYYY-MM-DD 형식')
  if (exam.tags !== undefined && !(Array.isArray(exam.tags) && exam.tags.every(nonEmpty))) err(file, '"tags" 는 문자열 배열')
  if (!Array.isArray(exam.sections) || !exam.sections.length) {
    err(file, '"sections" 에 단원이 하나 이상 있어야 합니다')
    continue
  }

  const sectionIds = new Set()
  const questionIds = new Set()
  const answerSpread = {} // 보기 4개짜리 문항의 정답 위치 분포
  for (const [si, s] of exam.sections.entries()) {
    const sw = `${file} › sections[${si}]`
    if (!QID.test(s.id || '')) err(sw, 'section id는 영문·숫자·_·- (예: "L01")')
    else if (sectionIds.has(s.id)) err(sw, `section id "${s.id}" 중복`)
    sectionIds.add(s.id)
    if (!nonEmpty(s.title)) err(sw, 'title 이 비어 있습니다')
    if (!Array.isArray(s.questions) || !s.questions.length) {
      err(sw, 'questions 가 비어 있습니다')
      continue
    }

    for (const [qi, q] of s.questions.entries()) {
      const qw = `${file} › ${q.id || `${s.id}[${qi}]`}`
      totalQuestions++
      for (const k of Object.keys(q)) if (!Q_KEYS.has(k)) warn(qw, `알 수 없는 필드 "${k}"`)
      if (!QID.test(q.id || '')) err(qw, 'question id는 영문·숫자·_·- (예: "L01-03")')
      else if (questionIds.has(q.id)) err(qw, '문항 id 중복 (시험 전체에서 유일해야 함)')
      questionIds.add(q.id)
      if (!nonEmpty(q.type)) err(qw, '"type" 이 비어 있습니다')
      if (!nonEmpty(q.prompt)) err(qw, '"prompt" 가 비어 있습니다')
      else checkMarkdown(`${qw} › prompt`, q.prompt)
      const kind = q.kind ?? 'choice'
      if (!KINDS.has(kind)) {
        err(qw, `"kind" 는 ${[...KINDS].map((k) => `"${k}"`).join(' / ')} 중 하나 (생략하면 choice)`)
        continue
      }
      for (const k of Object.keys(q)) {
        if (KIND_ONLY[k] && KIND_ONLY[k] !== kind) err(qw, `"${k}" 는 kind "${KIND_ONLY[k]}" 문항에서만 씁니다`)
      }

      if (kind === 'essay') {
        if (q.explanation !== undefined) checkMarkdown(`${qw} › explanation`, q.explanation)
      } else if (!nonEmpty(q.explanation)) err(qw, '"explanation" 이 비어 있습니다')
      else checkMarkdown(`${qw} › explanation`, q.explanation)

      if (kind === 'choice') {
        if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 6) {
          err(qw, '"choices" 는 보기 2–6개짜리 배열')
        } else {
          q.choices.forEach((c, ci) => {
            if (!nonEmpty(c)) err(qw, `choices[${ci}] 가 비어 있습니다`)
            else checkMarkdown(`${qw} › choices[${ci}]`, c)
          })
          if (new Set(q.choices.map((c) => String(c).trim())).size !== q.choices.length) err(qw, '같은 보기가 두 번 있습니다')
          if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > q.choices.length) {
            err(qw, `"answer" 는 1–${q.choices.length} 사이 정수 (1 = 첫 번째 보기)`)
          } else if (q.choices.length === 4) {
            answerSpread[q.answer] = (answerSpread[q.answer] || 0) + 1
          }
        }
        if (q.fixedOrder !== undefined && typeof q.fixedOrder !== 'boolean') err(qw, '"fixedOrder" 는 true/false')
      }

      if (kind === 'short') {
        if (!Array.isArray(q.blanks) || q.blanks.length < 1 || q.blanks.length > 10) {
          err(qw, '"blanks" 는 빈칸 1–10개짜리 배열 (각 빈칸 = 허용 답안 문자열 배열)')
        } else {
          q.blanks.forEach((accepted, bi) => {
            if (!Array.isArray(accepted) || !accepted.length || !accepted.every(nonEmpty)) {
              err(qw, `blanks[${bi}] 는 비어 있지 않은 허용 답안 문자열 배열이어야 합니다 (예: ["SHA-256", "SHA256"])`)
              return
            }
            const norm = accepted.map(normalizeAnswer)
            if (norm.some((n) => !n)) err(qw, `blanks[${bi}] 에 비교 후 빈 문자열이 되는 답안이 있습니다 (기호만 쓴 답안)`)
            const dup = accepted.filter((_, i) => norm.indexOf(norm[i]) !== i)
            if (dup.length) warn(qw, `blanks[${bi}] 의 ${dup.map((d) => `"${d}"`).join(', ')} 는 띄어쓰기·대소문자 무시 규칙상 이미 있는 답안과 같습니다 (빼도 됨)`)
          })
          if (q.anyOrder !== undefined && typeof q.anyOrder !== 'boolean') err(qw, '"anyOrder" 는 true/false')
          if (q.anyOrder) {
            const all = q.blanks.flatMap((a, bi) => (Array.isArray(a) ? a.map((x) => [normalizeAnswer(x), bi]) : []))
            const clash = all.find(([n, bi]) => all.some(([m, bj]) => m === n && bj !== bi))
            if (clash) err(qw, `anyOrder 빈칸끼리 같은 허용 답안이 있습니다 ("${clash[0]}") — 칸마다 답이 달라야 합니다`)
          }
        }
      }

      if (kind === 'essay') {
        if (!nonEmpty(q.modelAnswer)) err(qw, '"modelAnswer"(모범답안) 이 비어 있습니다')
        else checkMarkdown(`${qw} › modelAnswer`, q.modelAnswer)
        if (!Array.isArray(q.keyPoints) || q.keyPoints.length < 1 || q.keyPoints.length > 8 || !q.keyPoints.every(nonEmpty)) {
          err(qw, '"keyPoints"(채점 핵심 요소) 는 비어 있지 않은 문자열 1–8개')
        } else q.keyPoints.forEach((p, pi) => checkMarkdown(`${qw} › keyPoints[${pi}]`, p))
      }

      if (q.box !== undefined) {
        if (Array.isArray(q.box)) {
          if (!q.box.length || q.box.length > 8 || !q.box.every(nonEmpty)) err(qw, '"box" 배열은 비어 있지 않은 문자열 1–8개')
          else q.box.forEach((b, bi) => checkMarkdown(`${qw} › box[${bi}]`, b))
          // ㄱ·ㄴ·ㄷ 를 가리키는 보기는 순서가 의미를 가지므로 섞이면 안 된다
          if (q.choices?.some((c) => /[ㄱㄴㄷㄹㅁㅂㅅㅇ]\s*[,→]/.test(c)) && q.fixedOrder !== true) {
            warn(qw, '보기가 ㄱ·ㄴ·ㄷ 조합/순서라면 "fixedOrder": true 를 권장합니다')
          }
        } else if (nonEmpty(q.box)) checkMarkdown(`${qw} › box`, q.box)
        else err(qw, '"box" 는 문자열 또는 문자열 배열')
      }
    }
  }

  // 정답이 한 번호에 몰리면 찍기로 맞히게 된다 (기본 화면은 보기를 섞지 않음)
  const spreadTotal = Object.values(answerSpread).reduce((a, b) => a + b, 0)
  if (spreadTotal >= 20) {
    const top = Math.max(...[1, 2, 3, 4].map((k) => answerSpread[k] || 0))
    if (top / spreadTotal > 0.35) {
      const dist = [1, 2, 3, 4].map((k) => `${k}번 ${answerSpread[k] || 0}`).join(', ')
      warn(file, `정답 위치가 한쪽으로 몰려 있습니다 (${dist}). 각 번호가 비슷하게 나오도록 섞어 주세요`)
    }
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  console.error(`\n시험 데이터 검사 실패: 오류 ${errors.length}개`)
  process.exit(1)
}
console.log(`✓ 시험 ${seenExamIds.size}개, 문항 ${totalQuestions}개 검사 통과${warnings.length ? ` (경고 ${warnings.length}개)` : ''}`)
