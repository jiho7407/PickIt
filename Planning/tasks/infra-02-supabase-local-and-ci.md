---
id: infra-02-supabase-local-and-ci
status: todo
sub: INFRA
layer: infra
depends_on: [infra-01-project-bootstrap]
estimate: 2h
demo_step: N/A
---

# Supabase Local/CI 테스트 기반

## Context

RLS와 DB constraint를 TDD로 다루려면 Supabase local을 재현 가능하게 실행하고, CI에서 최소 검증을 돌려야 한다. 실제 RLS 테스트 스위트는 `data-05-rls-tests`에서 추가한다.

연결 문서:

- `PRD.md NFR-TEST-2, NFR-TEST-3`
- `STATE.md Phase 1`

## Files

- `supabase/config.toml` (create)
- `supabase/seed.sql` (create)
- `scripts/qa/check_supabase.sh` (create)
- `scripts/qa/generate_types.sh` (create)
- `.github/workflows/ci.yml` (create)
- `apps/web/package.json` (update — scripts 추가)
- `README.md` (update — local 실행 가이드)

## Spec

### 로컬 개발 명령

```bash
# 최초 1회
supabase init
supabase start

# 상시
supabase db reset            # 마이그레이션/seed 재적용
supabase status              # 포트/URL 확인
pnpm db:types                # Supabase type generation
```

### npm scripts (`apps/web/package.json`)

```json
{
  "scripts": {
    "db:start": "supabase start",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/lib/database.types.ts",
    "test:rls": "vitest run tests/rls"
  }
}
```

### env 전략

- `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 템플릿.
- `.env.test`: CI/로컬 테스트용 기본값(로컬 supabase 출력값).
- CI에서 env는 `supabase start` 출력을 파싱해 주입.

### CI 파이프라인 초안

```yaml
jobs:
  test:
    steps:
      - setup-node, pnpm, uv
      - supabase CLI install
      - supabase start
      - pnpm install
      - pnpm db:types
      - pnpm lint
      - pnpm test
      - pnpm build
      - uv run pytest
```

### RLS 테스트 위치 예약

- `apps/web/tests/rls/` 폴더를 미리 생성하고 README를 둔다.
- 실제 케이스는 `data-05-rls-tests`에서 채운다.

## TDD

1. Red: `pnpm db:types`가 아직 없는 상태에서 실패.
2. Green: script 추가 + supabase 설정.
3. Red: `check_supabase.sh`가 DB 다운 시 exit ≠ 0.
4. Green: health check 스크립트 구현.
5. Refactor: CI job step 순서 정리.

## Acceptance Criteria

- [ ] `supabase/config.toml`이 존재한다.
- [ ] `supabase start` → `pnpm db:types` 플로우가 동작한다.
- [ ] `scripts/qa/check_supabase.sh`가 health check를 수행한다.
- [ ] CI가 lint/test/build/uv pytest를 실행한다.
- [ ] `.env.example`이 Supabase 필수 env를 포함한다.
- [ ] `apps/web/tests/rls/` 폴더가 존재하고 안내 README를 가진다.

## Test Cases

1. happy: `supabase start` 후 check script exit 0.
2. edge: DB가 꺼져 있으면 명확한 에러 메시지.
3. happy: CI job이 unit test와 build를 실행한다.
4. happy: `pnpm db:types`가 `database.types.ts`를 생성한다.

## Decisions

1. Supabase local은 Supabase CLI의 Docker 기반 실행을 표준으로 한다.
2. 초기 CI는 Supabase를 포함한 단일 job으로 시작한다. 실행 시간이 길어지면 RLS job 분리는 후속 최적화로 처리한다.

## References

- Supabase CLI: https://supabase.com/docs/guides/local-development
- Supabase type generation: https://supabase.com/docs/guides/api/rest/generating-types
