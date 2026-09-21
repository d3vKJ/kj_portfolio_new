---
name: test-driven-development
description: 테스트 접근법. 포트폴리오 프로젝트에서 테스트가 필요한 곳과 방법.
---

# Test-Driven Development

## 포트폴리오에서 테스트가 필요한 곳

- **유틸 함수** — 날짜 포맷, 문자열 처리, 데이터 변환
- **복잡한 로직** — 필터링, 정렬, 계산
- **컴포넌트** — 중요한 인터랙션 (폼 제출, 필터 동작)

화면 레이아웃, 스타일, 정적 콘텐츠는 테스트 필요 없음.

## 최소 테스트 전략

```
유틸 함수: 단위 테스트 (Vitest/Jest)
컴포넌트: 렌더링 + 클릭 (Testing Library)
E2E: 핵심 플로우 1개 (선택사항)
```

## 예시

```ts
// 유틸 테스트
test('formatDate returns korean format', () => {
  expect(formatDate('2024-01-15')).toBe('2024년 1월 15일');
});

// 컴포넌트 테스트
test('project filter shows correct items', () => {
  render(<ProjectList filter="react" />);
  expect(screen.getAllByRole('article')).toHaveLength(3);
});
```

## TDD 흐름 (필요할 때)

1. 실패하는 테스트 작성
2. 통과하는 최소 코드 작성
3. 리팩토링

유틸 함수나 복잡한 로직 구현 시 권장. 간단한 UI는 코드 먼저도 OK.
