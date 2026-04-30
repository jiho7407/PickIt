---
id: infra-01-project-bootstrap
status: done
sub: INFRA
layer: infra
depends_on: []
estimate: 2h
demo_step: N/A
---

# 프로젝트 부트스트랩

## Context

PickIt은 모바일 웹 중심의 Supabase-backed 서비스다. 개발 시작 전에 TDD 가능한 Next.js 앱, 테스트 러너, lint/format, uv 기반 보조 스크립트 환경을 만든다.

연결 문서:

- `ONE_PAGER.md §8`
- `PRD.md §5 테스트 가능성`
- `STATE.md Phase 1`

## Files

- `package.json` (create)
- `pnpm-workspace.yaml` (create)
- `apps/web/package.json` (create)
- `apps/web/app/page.tsx` (create)
- `apps/web/app/layout.tsx` (create)
- `apps/web/vitest.config.ts` (create)
- `apps/web/playwright.config.ts` (create)
- `apps/web/tsconfig.json` (create)
- `apps/web/.env.example` (create)
- `pyproject.toml` (create)
- `.gitignore` (create/update)
- `.editorconfig` (create)

## Spec

### 루트 package scripts

```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "lint": "pnpm --filter web lint",
    "test": "pnpm --filter web test",
    "test:e2e": "pnpm --filter web test:e2e"
  }
}
```

### apps/web 기본 의존성

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Zod
- React Hook Form
- `@supabase/supabase-js`
- Vitest
- Testing Library
- Playwright

### uv 보조 환경

`pyproject.toml`은 QA/데이터 스크립트 용도다.

```toml
[project]
name = "pickit-tools"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = []

[tool.uv]
dev-dependencies = [
  "pytest>=8",
  "ruff>=0.7"
]
```

## TDD

1. Red: 기본 smoke test가 아직 없는 상태에서 `pnpm test`가 실패한다.
2. Green: `page.test.tsx`를 만들고 홈 렌더링 smoke test를 통과시킨다.
3. Refactor: 테스트/tsconfig 경로 alias를 정리한다.

## Acceptance Criteria

- [ ] `pnpm install` 후 lockfile이 생성된다.
- [ ] `pnpm test`가 기본 smoke test를 통과한다.
- [ ] `pnpm lint`가 통과한다.
- [ ] `pnpm build`가 통과한다.
- [ ] `uv sync`가 통과한다.
- [ ] `.env.example`에 Supabase 필수 환경 변수가 있다.

## Test Cases

1. happy: 홈 페이지가 "PickIt" 텍스트 또는 로고 영역을 렌더링한다.
2. happy: `pnpm build`가 Next.js 앱을 빌드한다.
3. edge: 환경 변수가 없어도 정적 홈 smoke test는 통과한다.
4. edge: `uv run pytest`는 테스트가 없거나 기본 테스트로 exit 0가 된다.

## Decisions

1. 패키지 매니저는 `pnpm`으로 확정한다.
2. 초기 부트스트랩은 Tailwind만 도입한다. shadcn/ui는 product 태스크에서 실제 컴포넌트가 필요할 때 추가한다.

## References

- Next.js docs: https://nextjs.org/docs
- Supabase JS docs: https://supabase.com/docs/reference/javascript
- uv docs: https://docs.astral.sh/uv/
