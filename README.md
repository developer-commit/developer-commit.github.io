# Blog-A · developer-commit.github.io

Vue 3 + Vite로 만든 정적 블로그. 공부한 내용을 글로 정리하고, **객관식 시험으로 암기를 확인**한다.
https://developer-commit.github.io

## 기능

- **글**: `content/posts/*.md` (frontmatter + 마크다운, 코드 하이라이트, KaTeX 수식). 카테고리·태그 목록 페이지.
- **시험** (`/exams/`): `content/exams/*.json`을 읽어 객관식 시험 화면을 만든다.
  - 단원 범위 선택, 안 푼 문제 / 틀린 문제만 골라 풀기
  - 연습 모드(바로 정답·해설) · 시험 모드(제출 후 채점)
  - 문제·보기 순서 섞기, 답안지 번호판, 새로고침해도 이어 풀기
  - 점수·단원별 정답률·오답 다시 보기·**틀린 문제만 다시 풀기**
  - 풀이 기록과 단원별 암기율은 브라우저 localStorage에 저장
- 다크 모드, 모바일 대응, sitemap.xml 자동 생성, SPA 깊은 링크용 404.html

## 개발

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # 시험 JSON 검사
npm run build      # 검사 + dist/ 빌드
npm run preview    # 빌드 결과 미리보기
```

## 콘텐츠 추가

| 하려는 것 | 할 일 |
|---|---|
| 글 쓰기 | `content/posts/<category>-<slug>.md` 추가 — 형식은 [AGENTS.md](AGENTS.md#블로그-글을-추가하라는-요청을-받았다면) |
| 시험 추가 | `content/exams/<id>.json` 추가 — 규칙은 [docs/EXAM_GUIDE.md](docs/EXAM_GUIDE.md) |
| 사이트 제목·카테고리 이름 | `src/site.config.js` |

다른 LLM에게 시험 문제 생성을 맡길 때는 "`docs/EXAM_GUIDE.md`를 읽고 이 강의 자료로 시험 JSON을 만들어 줘"라고 요청하면 된다.
`AGENTS.md`/`CLAUDE.md`가 에이전트를 이 가이드로 안내한다.

## 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 검사·빌드 후 GitHub Pages에 올린다.
저장소 **Settings → Pages → Build and deployment → Source**가 **GitHub Actions**로 되어 있어야 한다.

## 구조

```
content/
  posts/            블로그 글
  exams/            시험 JSON + exam.schema.json
docs/EXAM_GUIDE.md  시험 작성 가이드 (LLM·사람 공용)
public/             그대로 복사되는 파일 (ads.txt, favicon)
scripts/            validate-exams.mjs
src/
  lib/              posts · exams · markdown · 채점(examSession) · 기록 저장(examStore)
  components/       PostItem, ExamCard, MarkdownText, exam/(Setup·Runner·QuestionCard·Result)
  views/            Home, PostList, Post, ExamList, Exam, NotFound
```
