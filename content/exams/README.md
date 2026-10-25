# content/exams

여기에 `<시험-id>.json` 파일을 넣으면 블로그 `/exams/` 페이지에 객관식 시험으로 나타난다.

- 작성 규칙·형식·좋은 문제의 조건: [`docs/EXAM_GUIDE.md`](../../docs/EXAM_GUIDE.md)
- 형식 정의: [`exam.schema.json`](./exam.schema.json)
- 완성 예시: [`blockchain-2026-2.json`](./blockchain-2026-2.json) (블록체인 1–9강, 242문항)

추가한 뒤에는 `npm run validate`로 검사한다.
