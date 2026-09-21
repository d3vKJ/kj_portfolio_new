---
name: source-driven-development
description: 소스 기반 개발. 라이브러리 소스를 읽고 문서보다 정확하게 이해하는 방법.
---

# Source-Driven Development

## 언제 소스를 읽는가

- 문서에 없는 동작을 확인해야 할 때
- 버그인지 내 실수인지 판단이 안 될 때
- "왜 이렇게 동작하지?" 가 30분 이상 해결 안 될 때

## 소스 읽는 방법

1. **진입점 찾기**: 내가 호출하는 함수 찾기
2. **타입 따라가기**: TypeScript 타입 정의로 가능한 값 확인
3. **엣지케이스 찾기**: 조건문에서 내 케이스 해당 경로 추적

```bash
# node_modules에서 직접 확인
cat node_modules/some-lib/dist/index.js
# 또는 IDE에서 "Go to Definition" (F12)
```

## 실용적 팁

- GitHub에서 라이브러리 검색: `repo:org/lib 함수명`
- 릴리스 노트 > CHANGELOG.md — 버전별 변경사항
- Issues 탭: 같은 문제 겪은 사람 찾기

## 포트폴리오 관련 라이브러리 소스

자주 봐야 할 것들:
- `next/image` — 이미지 최적화 옵션
- `next/font` — 폰트 로딩 방식
- Framer Motion — animation variant 타입
- Tailwind config — 커스텀 설정 방법

## 경계

소스 읽기는 이해를 위한 것. 소스 코드 그대로 복사해 쓰는 것은 의존성 추가만큼 위험.
