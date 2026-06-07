#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="$ROOT_DIR/scripts/sql/20260608_add_media_metadata_columns_postgres.sql"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required but not found in PATH" >&2
  exit 1
fi

if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file not found: $SQL_FILE" >&2
  exit 1
fi

echo "Applying Media Phase B schema SQL: $SQL_FILE"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
echo "Schema update completed"
