#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_FILE="$ROOT_DIR/apps/web/src/lib/database.types.ts"

if ! command -v supabase >/dev/null 2>&1; then
  printf "generate_types: Supabase CLI is not installed. Install it and run 'supabase start'.\n" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
supabase gen types typescript --local > "$OUTPUT_FILE"
printf 'Generated %s\n' "$OUTPUT_FILE"
