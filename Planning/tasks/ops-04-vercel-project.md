---
id: ops-04-vercel-project
status: todo
sub: OPS
layer: ops
depends_on: [ops-01-google-oauth-credentials, ops-03-supabase-projects]
estimate: 30m
demo_step: N/A
---

# Vercel 프로젝트 연결

## Context

`infra-06-deployment-preview`는 Vercel preview URL에서 MVP E2E happy path를 확인할 수 있어야 한다. 이 태스크는 Vercel project 생성, GitHub 연결, env 주입까지만 준비한다.

연결 문서:

- `infra-06-deployment-preview`
- `ONE_PAGER.md §8 기술 스택`

## Out of scope

- 코드 작업 없음.
- 커스텀 도메인/SSL은 MVP OUT.

## Deliverables

- [ ] Vercel 팀 또는 개인 계정에 `pickit-web` project 생성
- [ ] GitHub 저장소 연결, root directory를 `apps/web`으로 지정
- [ ] Build command/Install command 확인 (`pnpm install`, `pnpm build`)
- [ ] Preview/Production env 주입:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Sensitive 플래그)
  - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
  - `NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false`
- [ ] 최초 preview 배포 1회 수행, 빌드 로그 확인
- [ ] preview URL을 Supabase Auth redirect allow list(ops-03)에 반영

## Acceptance Criteria

- [ ] main/PR preview URL이 자동 생성된다.
- [ ] env 키 목록이 `apps/web/.env.example`과 일치한다.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 client bundle에 노출되지 않는다(smoke 확인).
- [ ] 첫 preview 배포가 pnpm build와 동일 조건에서 성공한다.

## References

- Vercel Next.js deployments: https://vercel.com/docs/frameworks/nextjs
- Vercel environment variables: https://vercel.com/docs/projects/environment-variables
