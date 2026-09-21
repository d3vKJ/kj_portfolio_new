---
name: observability-and-instrumentation
description: 포트폴리오 모니터링. 방문자 분석, 에러 추적, 성능 모니터링.
---

# Observability & Instrumentation

## 포트폴리오에서 모니터링할 것

**필수**
- 방문자 수, 유입 경로
- 배포 에러

**선택**
- 어떤 프로젝트 링크를 클릭하는지
- 이력서 다운로드 횟수

## 무료 도구

| 도구 | 용도 |
|------|------|
| Vercel Analytics | 기본 방문자 분석 (Vercel 사용 시) |
| Google Analytics 4 | 상세 행동 분석 |
| Sentry (무료 플랜) | JS 에러 추적 |
| Vercel Speed Insights | Core Web Vitals 실제 사용자 데이터 |

## 최소 설정 (Vercel)

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 에러 모니터링 (선택)

배포 후 실사용자 에러를 알고 싶다면 Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

## 과도한 측정 경계

방문자가 적은 포트폴리오에서 복잡한 분석 도구는 오버킬.
Vercel Analytics 기본값으로 충분한 경우가 대부분.
