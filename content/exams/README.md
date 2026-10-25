# content/exams

여기에 `<시험-id>.json` 파일을 넣으면 블로그 `/exams/` 페이지에 객관식 시험으로 나타난다.

- 작성 규칙·형식·좋은 문제의 조건: [`docs/EXAM_GUIDE.md`](../../docs/EXAM_GUIDE.md)
- 형식 정의: [`exam.schema.json`](./exam.schema.json)
- 완성 예시
  - 객관식: [`blockchain-2026-2.json`](./blockchain-2026-2.json) (블록체인 1–9강, 242문항)
  - 주관식: [`blockchain-2026-2-subjective.json`](./blockchain-2026-2-subjective.json) (단답·빈칸 107 + 서술 26문항)
  - 실전형 혼합(배점 있음): [`blockchain-2026-2-mock-1.json`](./blockchain-2026-2-mock-1.json), [`-mock-2.json`](./blockchain-2026-2-mock-2.json) (객관식 20 + 단답 30 + 서술 50 = 100점)

추가한 뒤에는 `npm run validate`로 검사한다.
