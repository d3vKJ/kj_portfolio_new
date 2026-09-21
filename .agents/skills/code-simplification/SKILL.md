---
name: code-simplification
description: 코드 단순화. 복잡한 코드를 읽기 쉽고 짧게 만드는 판단 기준.
---

# Code Simplification

## 단순화 우선순위

1. **삭제** — 안 쓰는 코드는 주석 처리 말고 삭제. git이 기억한다.
2. **인라인** — 한 번만 쓰는 변수는 직접 사용
3. **표준 API** — 직접 구현 전에 `Array.prototype`, `Object` 내장 메서드 확인
4. **합치기** — 같은 일 하는 함수 2개는 1개로
5. **분리** — 함수가 두 가지 일 하면 나눈다

## 냄새나는 코드 패턴

```js
// 나쁨: 불필요한 중간 변수
const result = someArray.filter(x => x.active);
return result;

// 좋음
return someArray.filter(x => x.active);
```

```js
// 나쁨: 조건 중첩
if (a) {
  if (b) {
    doSomething();
  }
}

// 좋음: early return / 조건 합치기
if (!a || !b) return;
doSomething();
```

```js
// 나쁨: 수동 반복
const names = [];
for (let i = 0; i < users.length; i++) {
  names.push(users[i].name);
}

// 좋음
const names = users.map(u => u.name);
```

## 기준

- 함수 20줄 초과 → 분리 검토
- 중첩 3단계 초과 → 추출 또는 early return
- 같은 로직 3번 이상 → 추출
