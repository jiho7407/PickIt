---
id: infra-06-deployment-preview
status: todo
sub: INFRA
layer: infra
depends_on: [test-01-mvp-e2e]
estimate: 1.5h
demo_step: "Preview 배포"
---

# Preview 배포와 운영 Env 점검

## Context

MVP가 로컬에서 끝나지 않도록 Vercel preview와 Supabase project 설정을 검증한다. 실제 운영 자동화나 알림 발송은 범위 밖이지만, 데모 가능한 preview URL과 필수 env 누락 방지는 필요하다.

연결 문서:

- `ONE_PAGER.md §8`
- `PRD.md §5 테스트 가능성`
- `STATE.md Phase 5`

## Files

- `apps/web/.env.example` (update)
- `apps/web/vercel.json` (create/update, 필요 시)
- `.github/workflows/ci.yml` (update — preview readiness check)
- `README.md` (update — preview 배포 절차)
- `scripts/qa/check_env.ts` (create)

## Spec

### Preview env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/test only)
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `NEXT_PUBLIC_AUTH_KAKAO_ENABLED`

### 배포 기준

- Vercel preview build가 `pnpm build`와 같은 조건으로 통과한다.
- Supabase migration 적용 순서가 `ERD.md §7`과 일치한다.
- service role key는 client bundle에 노출되지 않는다.
- preview URL에서 MVP E2E happy path를 수동 또는 Playwright against preview로 확인할 수 있다.

## TDD

1. Red: 필수 env가 빠졌을 때 `check_env.ts`가 실패한다.
2. Green: env 검증 스크립트와 CI step을 추가한다.
3. Red: client bundle에 server-only env prefix가 노출되는지 점검한다.
4. Green: server-only env 사용 위치를 제한한다.

## Acceptance Criteria

- [ ] preview 배포에 필요한 env 목록이 문서화돼 있다.
- [ ] env 누락 시 CI 또는 local check가 실패한다.
- [ ] `pnpm build`와 preview build가 같은 전제에서 통과한다.
- [ ] Supabase migration 적용 절차가 README에 있다.
- [ ] preview URL에서 MVP E2E happy path를 검증할 수 있다.

## Test Cases

1. happy: 모든 env가 있으면 `check_env.ts` exit 0.
2. edge: `NEXT_PUBLIC_SUPABASE_URL` 누락 시 명확한 에러.
3. security: `SUPABASE_SERVICE_ROLE_KEY`가 client 코드에서 import되지 않는다.
4. happy: preview 배포 후 작성→투표→회고 smoke가 통과한다.

## References

- Vercel Next.js deployments: https://vercel.com/docs/frameworks/nextjs
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations
