---
name: git-workflow-and-versioning
description: Git 워크플로우. 커밋 메시지, 브랜치 전략, PR 규칙.
---

# Git Workflow & Versioning

## 커밋 메시지

```
<type>: <what changed>

[optional body — why, not what]
```

**type**: `feat` / `fix` / `refactor` / `style` / `chore` / `docs`

- 현재형 동사: "add" O, "added" X
- 50자 이하
- 본문은 WHY만 — WHAT은 diff가 보여준다

## 브랜치 전략

```
main          ← 배포 가능 상태 항상 유지
└── feat/...  ← 기능
└── fix/...   ← 버그수정
└── chore/... ← 설정·의존성
```

- `main` 직접 push 금지
- 작업 단위: 하나의 기능 또는 수정

## PR 규칙

- 제목: 커밋 메시지 형식과 동일
- 본문: 변경 이유 + 스크린샷(UI 변경 시)
- Self-review 후 PR 열기

## 포트폴리오 특이사항

- 배포는 `main` merge 시 자동 (Vercel/Netlify)
- 큰 리팩토링은 별도 브랜치에서 → 검토 후 merge
