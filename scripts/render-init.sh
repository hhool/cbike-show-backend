#!/usr/bin/env bash
set -euo pipefail

if [[ "${RENDER:-}" != "true" ]]; then
  echo "[ERROR] This script must be run inside Render Shell where RENDER=true."
  echo "[HINT] Open Render -> Service -> Shell, then run: npm run render:init"
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL is missing. Set the Neon Postgres connection string in Render Environment first."
  exit 1
fi

if [[ "${DATABASE_URL}" != postgres://* && "${DATABASE_URL}" != postgresql://* ]]; then
  echo "[ERROR] DATABASE_URL is not a Postgres URL: ${DATABASE_URL}"
  echo "[HINT] Expected format: postgres://... or postgresql://... with sslmode=require"
  exit 1
fi

echo "[INFO] Render environment confirmed."
echo "[INFO] Database provider: postgres"

npm run db:migrate:fresh
API_BASE="${NEXT_PUBLIC_API_BASE_URL:-https://cbike-show-backend.onrender.com}" npx tsx scripts/seed.ts

echo "[DONE] Migrations and seed completed."