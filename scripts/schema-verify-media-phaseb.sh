#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required but not found in PATH" >&2
  exit 1
fi

EXPECTED_COLUMNS=(
  prefix
  storage_env
  entity_type
  entity_id
  storage_version
  storage_key_original
  storage_key_thumb
  storage_key_card
  storage_key_hero
)

QUERY="
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'media'
  AND column_name IN (
    'prefix',
    'storage_env',
    'entity_type',
    'entity_id',
    'storage_version',
    'storage_key_original',
    'storage_key_thumb',
    'storage_key_card',
    'storage_key_hero'
  )
ORDER BY column_name;
"

FOUND="$(psql "$DATABASE_URL" -At -c "$QUERY")"

echo "Found media metadata columns:"
echo "$FOUND"

for col in "${EXPECTED_COLUMNS[@]}"; do
  if ! printf '%s\n' "$FOUND" | grep -qx "$col"; then
    echo "Missing required column: $col" >&2
    exit 1
  fi
done

echo "All required Media Phase B columns exist"
