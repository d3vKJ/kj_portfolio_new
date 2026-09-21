---
name: context-engineering
description: AI 도구와 협업 시 좋은 컨텍스트 제공법. Claude에게 효과적으로 요청하는 방법.
---

# Context Engineering

## AI에게 요청할 때 좋은 컨텍스트

**필수**
- 현재 기술 스택 (Next.js 14, TypeScript, Tailwind 등)
- 지금 만들려는 것의 목적
- 기존 코드가 있으면 관련 파일 첨부

**있으면 좋은 것**
- 비슷한 패턴 예시 ("현재 Header 컴포넌트처럼")
- 제약사항 ("기존 CSS 건드리지 말고")
- 우선순위 ("빠른 구현 우선, 완성도는 나중에")

## 나쁜 요청 vs 좋은 요청

```
❌ "포트폴리오 만들어줘"

✅ "Next.js 14 App Router, TypeScript, Tailwind CSS 스택으로
   포트폴리오 히어로 섹션 컴포넌트 만들어줘.
   이름, 직함, 소개 한 줄, GitHub/LinkedIn 링크 버튼 포함.
   현재 color scheme은 --color-primary: #0070f3 사용 중."
```

## 반복 작업 패턴

같은 작업을 자주 요청한다면 → skill로 만들어 두기

## 코드 리뷰 요청

```
"[파일 첨부] 이 컴포넌트 리뷰해줘.
집중할 것: 성능, 접근성.
스타일은 이미 팀 컨벤션대로라 건드리지 않아도 됨."
```

## 맥락 유지

긴 대화에서 앞선 결정을 참조해야 할 때:
"앞서 결정한 [X] 방식으로 이번 섹션도 동일하게 처리해줘"
