#!/usr/bin/env bash
set -euo pipefail

API_URL="${SUPABASE_API_URL:-${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}}"

fail() {
  printf 'check_supabase: %s\n' "$1" >&2
  exit 1
}

if ! command -v supabase >/dev/null 2>&1; then
  fail "Supabase CLI is not installed. Install it, then run 'supabase start'."
fi

if ! command -v curl >/dev/null 2>&1; then
  fail "curl is required for the Supabase health check."
fi

if ! supabase status >/tmp/pickit-supabase-status.txt 2>&1; then
  cat /tmp/pickit-supabase-status.txt >&2
  fail "Supabase local stack is not running. Run 'supabase start' first."
fi

if ! curl --fail --silent --show-error "$API_URL/auth/v1/health" >/dev/null; then
  fail "Supabase auth health endpoint is not reachable at $API_URL."
fi

printf 'Supabase local health check passed at %s\n' "$API_URL"
