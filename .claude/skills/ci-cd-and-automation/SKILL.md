---
name: ci-cd-and-automation
description: 포트폴리오 CI/CD 설정. 자동 배포, 빌드 검증, GitHub Actions 기본.
---

# CI/CD & Automation

## 포트폴리오 최소 파이프라인

```
push to main → 빌드 확인 → 자동 배포
```

Vercel/Netlify 연결 시 기본 제공됨. 추가로 할 것:

## GitHub Actions — 빌드 검증

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

`main` PR 시 빌드 깨지면 머지 차단.

## 자동 배포 설정 (Vercel)

1. Vercel 프로젝트 → Settings → Git
2. Production Branch: `main`
3. Preview Deployments: PR마다 미리보기 URL 자동 생성

## 린트/포맷 자동화

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
}
```

pre-commit hook (선택): `npx husky` + `lint-staged`

## 의존성 자동 업데이트

Dependabot 활성화 (`.github/dependabot.yml`):
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
```
