---
name: deprecation-and-migration
description: 라이브러리 마이그레이션과 deprecated API 처리. 안전하게 업그레이드하는 방법.
---

# Deprecation & Migration

## 마이그레이션 원칙

- **점진적으로** — 한 번에 전체 변경 금지. 기능 단위로 이동
- **병렬 운영** — 새 방식 도입 후 기존 방식 제거
- **테스트 먼저** — 마이그레이션 전 현재 동작 테스트 작성

## 일반적인 마이그레이션 순서

1. 변경 범위 파악 (`grep`으로 사용 위치 모두 확인)
2. 변경 사항 공식 마이그레이션 가이드 읽기
3. 가장 작은 단위 하나 변경 → 동작 확인
4. 나머지 순차 변경
5. 기존 코드 제거

## 포트폴리오에서 흔한 케이스

**Next.js Pages → App Router**
- `pages/` → `app/` 디렉토리 구조 변경
- `getServerSideProps` → `async` Server Component
- `_app.tsx` → `layout.tsx`

**Tailwind v3 → v4**
- `tailwind.config.js` 설정 방식 변경
- 일부 클래스명 변경

## deprecated 경고 처리

```
console.warn: [deprecated] useX → useY
```
1. 공식 문서에서 대체 API 확인
2. 변경 → 경고 사라지면 완료
3. 경고 무시하고 계속 쓰는 것은 나중에 더 큰 부채
