---
id: infra-02-supabase-local-and-ci
status: todo
sub: INFRA
layer: infra
depends_on: [infra-01-project-bootstrap]
estimate: 1.5h
demo_step: N/A
---

# Supabase Local/CI 테스트 기반

## Context

RLS와 DB constraint를 TDD로 다루려면 Supabase local 또는 테스트 전용 프로젝트를 재현 가능하게 실행해야 한다.

## Files

- `supabase/config.toml` (create)
- `supabase/seed.sql` (create)
- `scripts/qa/check_supabase.sh` (create)
- `.github/workflows/ci.yml` (create, 선택)

## Spec

- Supabase CLI 기반 local DB를 기준으로 한다.
- CI는 최소 `pnpm test`, `pnpm build`, `uv run pytest`를 실행한다.
- RLS integration test는 후속 data 태스크에서 추가한다.

## TDD

1. Red: DB 연결 확인 스크립트가 없는 상태.
2. Green: `scripts/qa/check_supabase.sh`로 local status/check를 수행.
3. Refactor: CI와 로컬 명령 이름을 README에 맞춘다.

## Acceptance Criteria

- [ ] Supabase config가 존재한다.
- [ ] local DB를 시작하는 명령이 문서화되어 있다.
- [ ] CI 초안이 테스트/빌드를 실행한다.
- [ ] RLS 테스트를 붙일 위치가 정해져 있다.

## Test Cases

1. happy: Supabase local DB가 실행 중이면 check script exit 0.
2. edge: DB가 꺼져 있으면 명확한 에러 메시지를 출력한다.
3. happy: CI에서 unit test와 build가 실행된다.

## References

- Supabase CLI: https://supabase.com/docs/guides/local-development
