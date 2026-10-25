# AGENTS.md

AI 코딩 에이전트(Claude, Codex, Cursor 등)를 위한 이 저장소 안내.

## 프로젝트

`developer-commit.github.io` — Vue 3 + Vite로 만든 정적 블로그. GitHub Actions가 빌드해 GitHub Pages로 배포한다.
블로그 글과 **객관식 시험(자동 채점)** 두 가지 콘텐츠가 있다.

```
content/posts/*.md        블로그 글 (frontmatter + 마크다운)
content/exams/*.json      객관식 시험 — 작성 규칙: docs/EXAM_GUIDE.md
src/                      Vue 앱 (views/, components/, lib/)
scripts/validate-exams.mjs  시험 JSON 검사기 (npm run validate)
.github/workflows/deploy.yml  main 브랜치 push → 빌드 → Pages 배포
```

## 시험 문제를 추가·수정하라는 요청을 받았다면

**먼저 `docs/EXAM_GUIDE.md`를 끝까지 읽는다.** 코드는 건드리지 않고 `content/exams/<id>.json`만 만들거나 고친다.
끝내기 전에 `npm run validate`와 `npm run build`가 통과하는지 직접 확인한다.

꼭 지킬 것:
- 문항 종류는 `kind`: 객관식 `choice`(생략 가능) · 단답·빈칸 `short` · 서술 `essay`.
- 객관식 `answer`는 **1부터** 센다 (1 = ①). 정답 위치(①②③④)를 고르게 분포시키고, 순서·조합·크기순 숫자 보기에는 `"fixedOrder": true`.
- 단답 `blanks`는 **빈칸마다 허용 답안 배열** (`[["SHA-256"], ["RIPEMD-160"]]`). 띄어쓰기·대소문자·하이픈 차이는 자동 무시되니 적지 말고, 한글/영문·약어/풀네임·단위 유무는 직접 나열한다.
- 서술 `keyPoints`는 "있다/없다"로 판단할 수 있는 사실 3–5개.
- 이미 공개된 시험 `id`와 문항 `id`는 바꾸지 않는다 (사용자 풀이 기록의 키).

## 블로그 글을 추가하라는 요청을 받았다면

`content/posts/<category>-<slug>.md`를 만든다. 주소는 `/<category>/<slug>/`.

```md
---
title: 글 제목
date: 2026-11-02
category: study          # src/site.config.js 의 categories 키 (없으면 추가)
slug: my-post            # 주소에 쓰일 영문 slug
tags: [태그1, 태그2]
description: 목록에 보일 한 줄 소개
draft: false             # true면 숨김
---

본문 (마크다운, 코드 블록, $수식$ 가능)
```

## 명령

```bash
npm install
npm run dev        # 개발 서버 http://localhost:5173
npm run validate   # 시험 JSON 검사
npm run build      # 검사 + dist/ 빌드
```
