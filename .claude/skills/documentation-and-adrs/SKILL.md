---
name: documentation-and-adrs
description: 문서화와 아키텍처 결정 기록. 포트폴리오 프로젝트에서 남겨야 할 문서.
---

# Documentation & ADRs

## 포트폴리오에서 문서화할 것

**README.md** — 필수
```markdown
# [프로젝트명]

[한 줄 설명]

## 기술 스택
## 로컬 실행 방법
## 배포
## 주요 결정사항 (선택)
```

**코드 내 주석** — WHY만, WHAT은 코드가 말한다
```ts
// ❌ 나쁨: 코드를 읽으면 알 수 있는 것
// 배열을 필터링합니다
const filtered = items.filter(...)

// ✅ 좋음: 왜 이 방식인지
// Safari는 gap을 float 요소에 적용 안 함 — margin으로 대체
```

## ADR (Architecture Decision Record)

중요한 기술 결정을 기록. 나중에 "왜 이렇게 했지?" 방지.

```markdown
## ADR-001: Next.js App Router 선택

**상황**: 포트폴리오 프레임워크 선택
**결정**: Next.js App Router
**이유**: SSG 기본 지원, 이미지 최적화, Vercel 무료 배포
**대안**: Astro (더 가벼우나 React 생태계 활용 제한)
**결과**: 빌드 최적화 자동, 학습 시간 절약
```

`.docs/decisions/` 폴더에 저장.

## 문서화 타이밍

- 만들 때가 아니라 **결정할 때** 기록
- 일주일 후 내가 이해할 수 있는가? → 문서화 필요
- 당연한 것은 문서화하지 않는다
