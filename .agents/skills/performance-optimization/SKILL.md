---
name: performance-optimization
description: 웹 성능 최적화. 측정 → 병목 파악 → 수정 순서로 접근한다.
---

# Performance Optimization

## 원칙: 측정 먼저

추측하지 말 것. DevTools → Lighthouse → Network 탭 순서로 실제 병목 확인 후 수정.

## Core Web Vitals 목표

| 지표 | 목표 |
|------|------|
| LCP (최대 콘텐츠 렌더링) | < 2.5s |
| FID / INP (상호작용 지연) | < 100ms |
| CLS (레이아웃 이동) | < 0.1 |

## 빠른 wins

- 이미지: WebP/AVIF 변환, `loading="lazy"`, `width`/`height` 명시
- 폰트: `font-display: swap`, 서브셋, preload
- JS: 코드 스플리팅, 불필요한 번들 제거 (`import()` lazy load)
- CSS: 사용하지 않는 스타일 제거, critical CSS 인라인

## 포트폴리오 특이사항

- 히어로 이미지: LCP 대상이므로 `loading="eager"` + preload
- 프로젝트 목록: 이미지 lazy load OK
- 폰트: Google Fonts `display=swap` 파라미터 포함

## 체크리스트

- [ ] Lighthouse 점수 90+ (Performance)
- [ ] 3G 느린 네트워크에서 3초 내 콘텐츠 보임
- [ ] 이미지 next-gen 포맷 사용
- [ ] JS 번들 200KB 이하 (gzip)
