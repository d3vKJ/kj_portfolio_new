---
name: debugging-and-error-recovery
description: 디버깅 접근법. 증상 → 재현 → 원인 → 수정 순서. 추측보다 데이터.
---

# Debugging & Error Recovery

## 순서

1. **재현** — 100% 재현 가능한 케이스 만들기. 못 재현하면 못 고친다.
2. **범위 좁히기** — 어느 레이어(UI/API/DB/네트워크)인가
3. **데이터 확인** — console, Network 탭, 에러 스택 트레이스 읽기
4. **가설 하나씩** — 동시에 여러 가지 바꾸지 말 것
5. **수정 검증** — 재현 케이스로 확인 후 주변 케이스도 확인

## 프론트엔드 디버깅 툴

- **React DevTools** — 컴포넌트 트리, props/state 실시간 확인
- **Network 탭** — API 요청/응답, 상태코드, 응답 시간
- **Console** — 에러 스택, `console.trace()` 로 호출 경로
- **Breakpoints** — `debugger;` 또는 Sources 탭 line breakpoint

## 흔한 원인들

| 증상 | 원인 |
|------|------|
| 빈 화면 | JS 에러, 잘못된 조건부 렌더링 |
| 무한 루프 | `useEffect` 의존성 배열 |
| 상태 업데이트 안 됨 | 불변성 위반 (객체 직접 변경) |
| API 에러 | CORS, 인증 헤더 누락, 잘못된 URL |
| 스타일 깨짐 | specificity 충돌, 클래스명 오타 |

## 막힐 때

30분 이상 막히면: 문제를 글로 써본다. 설명하다 보면 보인다 (Rubber Duck).
