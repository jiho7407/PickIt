# RLS Tests

This directory is reserved for Supabase RLS integration tests.

The actual policy test cases are introduced in `data-05-rls-tests`. Until then,
`pnpm test:rls` is wired to the runner with `--passWithNoTests` so CI can keep
the command stable.
