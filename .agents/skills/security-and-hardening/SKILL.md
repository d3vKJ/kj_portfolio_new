---
name: security-and-hardening
description: 프론트엔드 보안 기본. XSS, 환경변수, 민감 정보 보호.
---

# Security & Hardening

## 절대 하면 안 되는 것

- API 키, 비밀번호, 토큰을 코드에 하드코딩 (`.env` 사용)
- `.env` 파일 git commit (`.gitignore`에 반드시 포함)
- `dangerouslySetInnerHTML` 에 사용자 입력 직접 삽입
- `eval()` 사용

## 환경변수

```bash
# .env.local (git 제외)
NEXT_PUBLIC_API_URL=https://...   # 클라이언트 노출 OK
API_SECRET_KEY=...                # 서버에서만, NEXT_PUBLIC_ 붙이지 말 것
```

브라우저에 노출되는 `NEXT_PUBLIC_*` 변수에는 시크릿 정보 절대 금지.

## 포트폴리오 특이사항

- 연락처 폼: 이메일 서버사이드 처리 (Resend, EmailJS 등)
- EmailJS 같은 서비스 → Public Key는 노출 OK, Private Key는 환경변수
- 외부 링크: `rel="noopener noreferrer"` 필수

## HTTP 헤더 (Vercel 예시)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

## 의존성

- `npm audit` 주기적 실행
- 불필요한 패키지 제거 — 공격 면적 줄이기
