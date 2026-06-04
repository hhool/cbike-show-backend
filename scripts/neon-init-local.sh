#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL is missing in the current shell. Export your Neon Postgres URL first."
  exit 1
fi

if [[ "${DATABASE_URL}" != postgres://* && "${DATABASE_URL}" != postgresql://* ]]; then
  echo "[ERROR] DATABASE_URL must be a Postgres URL, got: ${DATABASE_URL}"
  exit 1
fi

echo "[INFO] DATABASE_URL detected. Running migrations against Neon from local terminal."
npm run db:migrate:fresh
echo "[DONE] Neon schema initialization completed."