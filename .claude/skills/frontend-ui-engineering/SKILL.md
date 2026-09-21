---
name: frontend-ui-engineering
description: 프론트엔드 UI 개발 원칙. 컴포넌트 구조, 상태 관리, 접근성, 성능을 다룬다.
---

# Frontend UI Engineering

## 컴포넌트 원칙

- 단일 책임 — 한 컴포넌트는 한 가지 일
- Props는 최소화. 내려보내는 게 3개 넘으면 구조 재고
- 스타일: CSS Modules 또는 Tailwind. styled-components는 새 코드에 추가하지 않음

## 상태 관리

- 지역 상태 우선 (`useState`)
- 2단계 이상 prop drilling → Context 또는 상위로 끌어올리기
- 서버 상태(fetch 결과)는 캐시 라이브러리(React Query 등)로 분리
- 전역 클라이언트 상태는 꼭 필요할 때만

## 접근성

- 시맨틱 HTML 우선 (`<button>`, `<nav>`, `<main>` 등)
- 이미지 `alt` 필수; 장식용은 `alt=""`
- 키보드 탐색 보장, focus order 확인
- ARIA는 HTML로 안 될 때만

## 렌더링 패턴

- 정적 콘텐츠 → SSG
- 자주 바뀌는 데이터 → SSR 또는 ISR
- 클라이언트 전용(지도·에디터) → CSR + Suspense

## 코드 품질

- 컴포넌트 파일 200줄 초과 시 분리 검토
- 사이드이펙트는 `useEffect` 안에 격리
- 이벤트 핸들러 이름: `handle`로 시작 (`handleClick`, `handleSubmit`)
