---
id: infra-04-auth-providers
status: todo
sub: INFRA
layer: infra
depends_on: [infra-02-supabase-local-and-ci]
estimate: 2h
demo_step: "로그인"
---

# Supabase Auth Provider 설정

## Context

고민 작성자는 인증된 사용자여야 한다(`FR-A-1`). 소셜 로그인(Google/Kakao) 프로바이더와 Next.js 세션/콜백 구조를 먼저 만든다. UI 버튼은 `product-00`에서 이 설정을 사용한다.

연결 문서:

- `PRD.md FR-A-1~4`
- `ONE_PAGER.md §5, §11`
- `crm.md` — 로그인 유도 타이밍

## Files

- `supabase/config.toml` (update — auth 섹션)
- `apps/web/src/lib/supabase/server.ts` (create)
- `apps/web/src/lib/supabase/client.ts` (create)
- `apps/web/src/lib/supabase/middleware.ts` (create)
- `apps/web/middleware.ts` (create)
- `apps/web/app/auth/callback/route.ts` (create)
- `apps/web/app/auth/callback/route.test.ts` (create)
- `apps/web/.env.example` (update)

## Spec

### Provider

- Google OAuth — MVP 1차
- Kakao OAuth — 키 확보 후 활성화. env flag로 토글 가능하게 한다.

### Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
KAKAO_OAUTH_CLIENT_ID=
KAKAO_OAUTH_CLIENT_SECRET=
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false
```

### Middleware

- `@supabase/ssr` 기반 서버 컴포넌트 세션 주입
- 모든 경로에서 세션 쿠키 갱신
- `/auth/callback` 및 정적 자원은 통과

### Callback

- `GET /auth/callback`이 `code`를 세션으로 교환하고 `redirectTo`로 이동.
- 신규 사용자는 `profiles` row insert를 보장(trigger 또는 first-login handler).

### Profile bootstrapping

- `auth.users` insert 시 `profiles` row 자동 생성 trigger (migration) 또는 first-login handler 중 택일.

## TDD

1. Red: 인증되지 않은 요청이 `supabase.auth.getUser()` → null 임을 확인.
2. Green: 서버/클라이언트 supabase helper 구현.
3. Red: `/auth/callback`이 `code` 없이 호출되면 400 반환.
4. Green: callback route 구현.
5. Red: OAuth 성공 후 `profiles` row가 자동 생성되는지 integration test.
6. Green: trigger 또는 handler 구현.

## Acceptance Criteria

- [ ] Google 로그인으로 Supabase 세션이 생성된다.
- [ ] Kakao provider 설정이 env flag로 토글 가능하다.
- [ ] Next.js middleware가 세션 쿠키를 갱신한다.
- [ ] 첫 로그인 시 `profiles` row가 자동 생성된다.
- [ ] `.env.example`에 필요한 env가 모두 있다.

## Test Cases

1. happy: 세션 쿠키가 있는 상태에서 server component가 user를 얻는다.
2. edge: `code` 파라미터 없이 callback 요청 시 에러 응답.
3. edge: 이미 존재하는 사용자의 재로그인 시 `profiles` 중복 생성되지 않음.
4. permission: 로그아웃 상태에서는 인증 전용 라우트가 리다이렉트된다.

## Open Questions

1. 첫 로그인 수단은 Google 단독으로 시작할 것인가 (`STATE.md Open Q #7`)?
2. `profiles` 자동 생성은 DB trigger vs handler 중 어느 쪽인가?

## References

- Supabase Auth Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- `Planning/PRD.md §4.4`
