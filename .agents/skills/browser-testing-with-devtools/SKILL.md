---
name: browser-testing-with-devtools
description: 브라우저 DevTools로 프론트엔드 테스트하는 방법. 네트워크, 콘솔, 반응형, 성능 탭 활용.
---

# Browser Testing with DevTools

## 기본 확인 순서

1. **Console 탭** — 에러/경고 없는지 확인
2. **Network 탭** — API 요청 상태코드, 응답 확인
3. **Elements 탭** — DOM 구조, 스타일 적용 확인
4. **Responsive** — 주요 breakpoint 직접 확인

## 반응형 테스트

DevTools → Toggle device toolbar (Ctrl+Shift+M)

확인 해상도:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 768px (iPad)
- 1280px (데스크탑)
- 1920px (와이드)

## 네트워크 테스트

- **Slow 3G** throttle로 로딩 상태 확인
- LCP 이미지가 빠르게 뜨는지
- API 실패 시 에러 UI 노출되는지

## Performance 탭

빠른 확인: Lighthouse (Ctrl+Shift+P → "Generate Lighthouse report")

수동 측정: Performance 탭 → Record → 페이지 로드 → Stop

## 크로스 브라우저

최소 확인: Chrome, Safari (Mac/iPhone), Firefox
- Safari: flex gap, CSS custom property 동작 확인
- 모바일 Safari: viewport height (`100vh` vs `dvh`) 버그

## 유용한 단축키 (Chrome)

| 단축키 | 기능 |
|--------|------|
| Ctrl+Shift+I | DevTools 열기 |
| Ctrl+Shift+M | 기기 에뮬레이션 |
| Ctrl+Shift+P | Command 팔레트 |
| F5 / Ctrl+R | 일반 새로고침 |
| Ctrl+Shift+R | 캐시 무시 새로고침 |
