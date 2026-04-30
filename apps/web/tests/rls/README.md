# RLS Tests

This directory contains Supabase local RLS integration tests.

Run them after the local stack is started and `.env.test` points at the local
Supabase API:

```bash
supabase start
pnpm test:rls
```

The tests create disposable auth users, dilemmas, votes, comments, followups,
anonymous sessions, and storage objects, then remove them during teardown.

If a run is interrupted, reset local fixtures with:

```bash
node --experimental-strip-types ../../scripts/qa/reset_rls_fixtures.ts
```
