// 단답형 채점 규칙. 화면(examSession)과 검사기(scripts/validate-exams.mjs)가 함께 쓴다.

/**
 * 비교용으로 답을 정규화한다.
 * - 전각/반각·호환 문자 통일(NFKC), 영문 소문자화
 * - 공백, 가운뎃점, 따옴표, 괄호, 쉼표, 마침표, 밑줄 제거
 * - 글자·숫자 사이의 하이픈 제거 (SHA-256 = SHA256). 맨 앞의 음수 부호(-128)는 남긴다
 */
export function normalizeAnswer(s) {
  return String(s ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/(?<=[\p{L}\p{N}])-(?=[\p{L}\p{N}])/gu, '')
    .replace(/[\s·•ㆍ'"`‘’“”()[\]{}<>,.。_]/g, '')
}

/** 한 칸의 입력이 허용 답안 중 하나와 같은지 */
export function matchesBlank(input, accepted) {
  const v = normalizeAnswer(input)
  return v.length > 0 && accepted.some((a) => normalizeAnswer(a) === v)
}

/**
 * 빈칸 채점. blanks: [[허용 답안...], ...], values: [입력...]
 * anyOrder면 입력 순서와 상관없이 서로 다른 칸에 하나씩 맞춰 본다.
 * 반환: 칸마다 맞았는지 배열
 */
export function gradeBlanks(blanks, values, anyOrder = false) {
  if (!anyOrder) return blanks.map((accepted, i) => matchesBlank(values[i], accepted))
  const used = new Set()
  return values.slice(0, blanks.length).map((input) => {
    const k = blanks.findIndex((accepted, j) => !used.has(j) && matchesBlank(input, accepted))
    if (k < 0) return false
    used.add(k)
    return true
  })
}
