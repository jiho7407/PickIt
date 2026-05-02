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

## Auth And OAuth Rules

OAuth/PKCE issues must be treated as configuration and session-boundary
problems first. Do not paper over them with route-level or component-level
workarounds.

- Keep the app origin, Supabase Auth Site URL/Redirect URLs, and Google OAuth
  authorized redirect URI exactly aligned. `localhost` and `127.0.0.1` are
  different browser cookie hosts. Pick one per environment and use only that
  origin for testing.
- Do not add middleware that rewrites or redirects between `localhost` and
  `127.0.0.1`. Host canonicalization in middleware breaks PKCE verifier cookies
  and can create redirect loops.
- Do not recover or reinterpret OAuth `code` query params from arbitrary routes
  such as `/?code=...`. If OAuth code lands anywhere other than
  `/auth/callback`, fix Supabase/Google redirect configuration instead of
  adding app runtime patches.
- Middleware should stay limited to session refresh and intentional protected
  route checks. Do not use it for ad hoc auth state repair.
- Keep auth state authoritative on the server for protected writes. Server
  actions that create votes, comments, dilemmas, profiles, or other user-owned
  data must call Supabase `auth.getUser()` and reject unauthenticated requests.
- Do not add per-button or per-form browser Supabase session re-checks to work
  around stale React state. If UI state seems stale after login/logout, inspect
  server rendering, cache boundaries, and auth configuration before changing
  individual components.
- The auth callback route may explicitly attach Supabase `Set-Cookie` headers
  to its redirect response when exchanging the code for a session. That is a
  session propagation fix, not a substitute for correct redirect URL
  configuration.
- When debugging auth, first clear browser site data for both `localhost` and
  `127.0.0.1`, then reproduce from a single chosen origin. Document the exact
  origin and callback URL in the handoff.

## Product/UI Rules

- Product tasks should use the existing project patterns established by the
  foundation tasks.
- Figma node IDs are not permanent references. Re-check the relevant screen
  frame right before implementing a product task.
- Implement only the screens, states, and interactions explicitly provided by
  the user or the active task's Figma frames. Do not invent or add extra pages,
  placeholder screens, feed previews, marketing sections, empty states, or
  navigation surfaces that were not provided.
- When a Figma frame contains grouped bitmap-like artwork, export and use the
  exact frame/image asset. Do not recreate phone mockups, device buttons,
  product screenshots, logos, or masked fades with hand-written CSS/SVG unless
  the active task explicitly asks for editable vector/code-native artwork.
- If auth/signup is outside the active task, keep login CTAs as a local mock
  transition to the next provided screen. Do not wire OAuth, account creation,
  or extra post-login screens into a product UI task unless the task file
  explicitly includes that scope.
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
