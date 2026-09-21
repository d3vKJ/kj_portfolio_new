---
name: api-and-interface-design
description: API 및 인터페이스 설계. TypeScript 타입, 함수 시그니처, 컴포넌트 Props 설계 원칙.
---

# API & Interface Design

## 원칙

- **이름이 계약이다** — 이름만 보고 동작을 예측할 수 있어야 함
- **최소 인터페이스** — 필요한 것만 받고 반환
- **일관성** — 비슷한 것은 비슷하게 생겨야 함

## TypeScript 타입

```ts
// 나쁨: 너무 광범위
function getProject(id: any): any

// 좋음
function getProject(id: string): Promise<Project | null>
```

- `any` 금지. 모르면 `unknown` 후 좁히기
- 반환값이 없을 수 있으면 `T | null`, 실패 가능성 있으면 `Promise<T>`
- 유니온으로 가능한 값 명시: `type Status = 'loading' | 'success' | 'error'`

## 컴포넌트 Props

```ts
// 좋은 Props 설계
interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  href: string;
  imageUrl?: string;  // 선택사항은 명확히
}
```

- boolean prop은 `is`/`has`/`can` 접두사: `isActive`, `hasImage`
- 이벤트 핸들러: `on` 접두사: `onClick`, `onSubmit`
- children 받는 컴포넌트는 `React.PropsWithChildren` 또는 직접 명시

## 데이터 구조

```ts
// 포트폴리오 데이터 예시
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  links: { label: string; url: string }[];
  period: { start: string; end?: string };
  featured?: boolean;
}
```

배열 인덱스 대신 `id`로 참조. 변경에 강하다.
