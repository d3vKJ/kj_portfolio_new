---
name: shipping-and-launch
description: 포트폴리오 배포 체크리스트. 출시 전 확인사항과 배포 후 모니터링.
---

# Shipping & Launch

## 배포 전 체크리스트

### 콘텐츠
- [ ] 오타, 맞춤법 검토
- [ ] 이메일/연락처 정확한가
- [ ] 프로젝트 링크 모두 작동하는가
- [ ] 이력서 PDF 링크 유효한가

### 기술
- [ ] `npm run build` 에러 없음
- [ ] 콘솔 에러 없음 (프로덕션 빌드 기준)
- [ ] 404 페이지 있음
- [ ] OG 태그 (`og:title`, `og:image`, `og:description`)
- [ ] favicon 설정
- [ ] `robots.txt` / `sitemap.xml`
- [ ] HTTPS 적용

### 성능·접근성
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 90
- [ ] 모바일 크롬에서 직접 확인

### SEO
- [ ] `<title>` + `<meta description>` 설정
- [ ] 헤딩 계층 올바름 (h1 하나)

## 배포 플랫폼 (추천)

- **Vercel**: Next.js 최적. `main` push → 자동 배포
- **Netlify**: 정적 사이트. 폼 기능 내장
- **GitHub Pages**: 순수 정적, 무료

## 배포 후

- Google Search Console 등록
- SNS 프로필 URL 업데이트
- 지인 피드백 수집 (모바일에서 보내서 직접 테스트)
