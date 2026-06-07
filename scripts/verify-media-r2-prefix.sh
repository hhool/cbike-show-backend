#!/usr/bin/env bash
set -euo pipefail

BACKEND_BASE_URL="${BACKEND_BASE_URL:-https://cbike-show-backend.vercel.app}"

if [[ "$#" -lt 1 ]]; then
  echo "Usage: ./scripts/verify-media-r2-prefix.sh <filename> [--base-url <url>]" >&2
  exit 1
fi

FILENAME="$1"
shift

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --base-url)
      if [[ "$#" -lt 2 ]]; then
        echo "--base-url requires a value" >&2
        exit 1
      fi
      BACKEND_BASE_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  echo "node is required but not found in PATH" >&2
  exit 1
fi

ENCODED_FILENAME="$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$FILENAME")"
URL="$BACKEND_BASE_URL/api/media?limit=1&sort=-createdAt&where[filename][equals]=$ENCODED_FILENAME"
RESP_WITH_CODE="$(curl -g -sS -w '\n%{http_code}' "$URL")"
HTTP_CODE="$(printf '%s' "$RESP_WITH_CODE" | tail -n 1)"
RESP="$(printf '%s' "$RESP_WITH_CODE" | sed '$d')"

node - "$FILENAME" "$HTTP_CODE" "$RESP" <<'NODE'
const filename = process.argv[2];
const httpCode = Number(process.argv[3]);
const body = process.argv[4];

let payload;
try {
  payload = JSON.parse(body);
} catch {
  console.log(`[verify] ERROR: media API returned non-JSON response (status=${httpCode || 'unknown'})`);
  process.exit(4);
}

if (httpCode >= 400 || (Array.isArray(payload?.errors) && payload.errors.length > 0)) {
  const firstError = payload?.errors?.[0]?.message || 'unknown error';
  console.log(`[verify] ERROR: media API request failed (status=${httpCode}, message=${firstError})`);
  process.exit(4);
}

const doc = payload?.docs?.[0];

if (!doc) {
  console.log(`[verify] filename=${filename} not found`);
  process.exit(2);
}

const prefix = String(doc.prefix || '');
const storageKeyOriginal = String(doc.storageKeyOriginal || '');
const prefixPattern = /^(prod|preview|dev)\/media\/\d{4}\/\d{2}\/[a-z0-9-]+\/[a-z0-9-]+$/;
const storagePattern = /^(prod|preview|dev)\/media\/\d{4}\/\d{2}\/[a-z0-9-]+\/[a-z0-9-]+\/.+$/;

const prefixOk = prefixPattern.test(prefix);
const keyOk = storagePattern.test(storageKeyOriginal);

console.log(`[verify] id=${doc.id} createdAt=${doc.createdAt}`);
console.log(`[verify] filename=${doc.filename}`);
console.log(`[verify] prefix=${prefix || '(empty)'}`);
console.log(`[verify] storageKeyOriginal=${storageKeyOriginal || '(empty)'}`);

if (prefixOk && keyOk) {
  console.log('[verify] PASS: media path metadata follows env/media/yyyy/mm/... policy');
  process.exit(0);
}

if (prefixOk && !storageKeyOriginal) {
  console.log('[verify] WARN: prefix is valid but storageKeyOriginal is empty (rollout field may be disabled)');
  process.exit(3);
}

console.log('[verify] FAIL: metadata does not match env/media/yyyy/mm/... policy yet');
process.exit(1);
NODE
