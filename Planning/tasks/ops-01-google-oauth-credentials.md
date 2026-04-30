---
id: ops-01-google-oauth-credentials
status: done
sub: OPS
layer: ops
depends_on: []
estimate: 30m
demo_step: N/A
---

# Google OAuth 자격증명 확보

## Context

`infra-04-auth-providers`가 Supabase Auth Google provider를 사용한다. MVP 1차 로그인 수단이므로 코드 작업 전에 OAuth client를 확보해야 구현/테스트가 가능하다.

연결 문서:

- `infra-04-auth-providers`
- `infra-06-deployment-preview`
- `PRD.md §4.4 FR-A-1~4`

## Out of scope

- 코드 작업 없음. 계정/콘솔 조작과 비밀 저장만 수행한다.

## Deliverables

- [x] Google Cloud 프로젝트 생성 또는 기존 프로젝트 지정
- [x] OAuth 동의 화면 구성(앱 이름, 지원 이메일, 개발자 연락처)
- [x] OAuth 2.0 Client ID(Web application) 발급
- [x] Authorized redirect URIs 등록:
  - `http://127.0.0.1:54321/auth/v1/callback` (Supabase local)
  - `{SUPABASE_PROJECT_URL}/auth/v1/callback` (preview/prod, `ops-03` 완료 후 등록)
- [x] `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`을 팀 비밀 저장소(1Password 등)에 보관
- [x] Supabase local 또는 preview project Auth → Google provider에 client id/secret 입력
- [x] `apps/web/.env.example` 템플릿에 env 키 반영(실제 값 금지)

## Dependency Note

`infra-04-auth-providers`를 시작하기 위한 unblock 기준은 local callback URI와 Google client id/secret 확보다. Preview project provider 검증은 `ops-03-supabase-projects`, `ops-04-vercel-project` 완료 후 다시 확인한다.

## Acceptance Criteria

- [x] client id/secret이 팀 비밀 저장소에 있다.
- [x] Supabase local 또는 preview project에서 Google provider로 수동 로그인 테스트가 통과한다.
- [x] `.env.example`에 필수 env 키가 있다(값은 비어 있음).
- [x] redirect URI 목록이 README 또는 STATE에 문서화된다.

## Completion Notes

- Google OAuth authorize smoke against preview Supabase returned HTTP 302 to `accounts.google.com`.
- Local callback URI: `http://127.0.0.1:54321/auth/v1/callback`
- Preview callback URI: `https://iuqfujdccqqekwuzoknk.supabase.co/auth/v1/callback`
- Secrets stay in root `.env`, `apps/web/.env.local`, or the team secret store only.

## References

- Supabase Auth — Google: https://supabase.com/docs/guides/auth/social-login/auth-google
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2/web-server
