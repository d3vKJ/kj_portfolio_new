---
name: spec-driven-development
description: 스펙 기반 개발. 만들기 전에 명세를 먼저 작성하는 방법.
---

# Spec-Driven Development

## 왜 스펙 먼저인가

코드 먼저 쓰면 → 생각 없이 쓰고 → 나중에 "이게 뭐지?" → 리팩토링

스펙 먼저 쓰면 → 모순 발견 → 코드 전에 수정 → 더 적은 diff

## 포트폴리오 컴포넌트 스펙 형식

```markdown
## ProjectCard

**목적**: 프로젝트 요약 정보를 카드 형태로 표시

**입력**
- title: string (필수)
- description: string (필수, 최대 150자)
- tags: string[] (최대 5개)
- imageUrl?: string
- links: { label, url }[] (최소 1개)

**출력**: 클릭 시 href로 이동, 또는 링크 버튼 표시

**상태**: 없음 (순수 표시 컴포넌트)

**엣지케이스**
- imageUrl 없으면 → 플레이스홀더 배경
- tags 5개 초과 → 앞 4개 + "+N" 표시
- description 150자 초과 → 말줄임표
```

## 스펙 작성 기준

- 코드 작성 전 5분 투자
- "완료"의 정의가 명확한가?
- 입력/출력/엣지케이스 세 가지만 있으면 충분

## 변경 처리

스펙 바뀌면 → 코드 바꾸기 전에 스펙 문서 먼저 업데이트
