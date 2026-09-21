---
name: web-design-guidelines
description: 포트폴리오 웹 디자인 가이드라인. 시각적 일관성, 타이포그래피, 컬러, 레이아웃, 반응형 원칙을 다룬다.
---

# Web Design Guidelines

포트폴리오 사이트의 디자인 기준.

## 핵심 원칙

- **Less is more** — 여백이 콘텐츠다. 빽빽하게 채우지 말 것.
- **일관성** — 폰트 2종(헤딩 + 본문), 색상 5색 이하(primary, accent, bg, text, muted).
- **계층** — 크기·굵기·색으로 정보 위계 표현. 밑줄·이탤릭 남용 금지.

## 타이포그래피

- 헤딩: `font-weight: 700`, 줄간격 1.1–1.2
- 본문: `font-weight: 400`, 줄간격 1.6–1.8, 최대 65–75자/줄
- 코드: monospace, bg로 구분

## 컬러

- 배경과 텍스트 대비 WCAG AA 최소 준수 (4.5:1)
- 다크모드 기본 지원 (`prefers-color-scheme`)
- 포인트 색 1개 — 링크·버튼·강조에만 사용

## 레이아웃

- 최대 너비 `max-width: 1200px`, 좌우 패딩 `clamp(1rem, 5vw, 3rem)`
- 그리드: CSS Grid 우선, flex는 1차원에만
- 모바일 퍼스트 breakpoint: 640 / 1024 / 1280

## 반응형

- 텍스트 크기: `clamp()` 사용, 고정 px 금지
- 이미지: `width: 100%`, `aspect-ratio` 고정
- 터치 타겟 최소 44×44px

## 인터랙션

- hover 트랜지션 200ms ease
- 포커스 아웃라인 제거 금지 (`:focus-visible` 대체)
- 애니메이션은 `prefers-reduced-motion` 존중
