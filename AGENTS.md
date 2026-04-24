# PickIt Agent Guide

This repository is developed by humans plus coding agents. Treat the planning
documents as the source of truth and keep each change small, testable, and easy
to review.

## Source Of Truth

Read these before starting any implementation task:

1. `Planning/STATE.md`
2. The specific task file in `Planning/tasks/`
3. `Planning/PRD.md` and `Planning/ERD.md` only for the sections referenced by the task
4. `DEVELOPMENT_SPLIT.md` when coordinating with another developer

Do not implement future scope just because it is mentioned elsewhere. The task
file's `Spec`, `Acceptance Criteria`, and `Test Cases` define the active scope.

## Task Workflow

- Work on exactly one `Planning/tasks/*.md` implementation task per branch.
- Use branch names like `codex/<task-id>` or `claude/<task-id>`.
- Keep the branch limited to that task's listed files unless the task clearly
  requires a nearby shared helper.
- Follow TDD where the task asks for it: write or update the failing test first,
  then implement, then refactor.
- Do not skip acceptance criteria silently. If one cannot be completed, document
  the blocker in the final handoff.
- Do not edit deprecated task files except to clarify deprecation.

## Recommended First Sequence

The foundation should be implemented sequentially by one owner because it sets
the project shape, scripts, migrations, and testing conventions:

1. `infra-01-project-bootstrap`
2. `infra-02-supabase-local-and-ci`
3. `data-01-dilemma-schema`
4. `data-02-vote-comment-schema`

After `data-02`, pause briefly to verify the actual Supabase/RLS/session
implementation strategy before spreading product work across multiple branches.

## Branch And Merge Discipline

- One task file maps to one branch and one PR/merge.
- Merge foundation tasks in topological order.
- Rebase or merge latest main before starting a task that depends on recently
  merged work.
- Avoid parallel edits to these shared files unless explicitly coordinated:
  - root `package.json`
  - `apps/web/package.json`
  - `apps/web/app/page.tsx`
  - `apps/web/middleware.ts`
  - `supabase/config.toml`
  - `supabase/seed.sql`
  - generated Supabase types

## Verification

Run the narrowest meaningful checks for the task, then broader checks when the
task touches shared infrastructure.

Expected checks as the project becomes available:

```bash
pnpm test
pnpm lint
pnpm build
pnpm db:types
pnpm test:rls
pnpm test:e2e
uv run pytest
```

If a command cannot be run because the required setup does not exist yet, state
that plainly in the handoff.

## Supabase And Data Rules

- Migration order matters. Create referenced tables before tables with foreign
  keys.
- In `data-02`, create `anonymous_sessions` before `votes`.
- Keep anonymous session cookie values out of the database. Store only a hashed
  identifier.
- Keep `get_my_notification_candidates()` for the current authenticated user and
  `get_operator_notification_candidates()` for operator-only access.
- RLS, constraints, and server actions should agree. Do not rely only on UI
  guards for permissions.

## Product/UI Rules

- Product tasks should use the existing project patterns established by the
  foundation tasks.
- Figma node IDs are not permanent references. Re-check the relevant screen
  frame right before implementing a product task.
- If Figma is unavailable, implement the MVP wireframe implied by the task and
  keep styling minimal.
- Do not introduce a large component library unless the active task requires it.

## Multi-Developer Coordination

Good parallelization points:

- After `infra-01`: another developer may build isolated presentational
  components with mocked props, but should avoid routing/auth/database writes.
- After `data-02` and `infra-05`: product feed/detail/create work can be split
  more safely.
- After `product-03`: profile and consumption-record pages become much safer to
  implement because their upstream data and navigation assumptions are settled.

Profile work should start as a UI-only branch only if it avoids shared auth,
profile actions, migrations, and generated types. The full
`product-05a-profile` task depends on `product-03-my-votes-and-comments`; do not
force it earlier unless the task plan is intentionally changed.

## Handoff Format

End each task with:

- Task ID
- Files changed
- Acceptance criteria status
- Tests run and results
- Known blockers or follow-up risks
