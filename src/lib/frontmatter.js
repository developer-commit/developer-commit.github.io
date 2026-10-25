// 글 맨 위의 --- 블록을 읽는다. 지원 형식(YAML 일부):
//   key: 값            → 문자열 (true/false는 불리언)
//   key: [a, b, c]     → 문자열 배열
export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) return { data: {}, body: source }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!kv) continue
    const [, key, rawValue] = kv
    let value = rawValue.trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => unquote(v.trim()))
        .filter(Boolean)
    } else if (value === 'true' || value === 'false') {
      value = value === 'true'
    } else {
      value = unquote(value)
    }
    data[key] = value
  }
  return { data, body: source.slice(match[0].length) }
}

function unquote(v) {
  return /^(['"]).*\1$/.test(v) ? v.slice(1, -1) : v
}
