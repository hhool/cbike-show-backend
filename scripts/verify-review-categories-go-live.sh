#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <API_BASE>"
  echo "Example: $0 https://cbike-show-backend.vercel.app"
  exit 1
fi

API_BASE="${1%/}"
PROBE_URL="$API_BASE/api/review-categories?limit=1"

echo "[STEP] Probe endpoint: $PROBE_URL"
HTTP_CODE=$(curl -s -o /tmp/cbike_review_categories_probe.json -w "%{http_code}" "$PROBE_URL")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "[FAIL] /api/review-categories unavailable (HTTP $HTTP_CODE)"
  echo "[INFO] Body:"
  cat /tmp/cbike_review_categories_probe.json
  echo
  echo "[ACTION] Deploy latest site-backend first, then rerun this script."
  exit 1
fi

echo "[PASS] Endpoint is ready (HTTP 200)"
echo "[STEP] Seed review categories"
API_BASE="$API_BASE" npx tsx scripts/seed-review-categories.ts

echo "[STEP] Seed reviews and bind category relations"
API_BASE="$API_BASE" npx tsx scripts/seed-reviews-categories.ts

echo "[DONE] Review category go-live checks and seeding completed."