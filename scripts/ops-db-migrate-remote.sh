#!/usr/bin/env bash

set -euo pipefail

HOST="https://cbike-show-backend.vercel.app"
SECRET="${DIAG_TRIGGER_SECRET:-}"

usage() {
	cat <<'EOF'
Usage:
	./scripts/ops-db-migrate-remote.sh [--host <https://your-host>] [--secret <diag-secret>]

Environment:
	DIAG_TRIGGER_SECRET   Secret for x-diag-secret header (recommended)

Examples:
	DIAG_TRIGGER_SECRET=*** ./scripts/ops-db-migrate-remote.sh
	./scripts/ops-db-migrate-remote.sh --host https://cbike-show-backend.vercel.app --secret ***
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--host)
			HOST="$2"
			shift 2
			;;
		--secret)
			SECRET="$2"
			shift 2
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			echo "[ops-db-migrate-remote] Unknown arg: $1" >&2
			usage
			exit 1
			;;
	esac
done

if [[ -z "$SECRET" ]]; then
	echo "[ops-db-migrate-remote] Missing DIAG_TRIGGER_SECRET. Provide --secret or set env." >&2
	exit 1
fi

call_json() {
	local method="$1"
	local url="$2"

	local tmp
	tmp="$(mktemp)"

	local code
	code="$(curl -sS -X "$method" -H "x-diag-secret: $SECRET" -o "$tmp" -w "%{http_code}" "$url")"

	echo "HTTP $code"
	cat "$tmp"
	echo

	rm -f "$tmp"

	if [[ "$code" != "200" ]]; then
		echo "[ops-db-migrate-remote] Request failed: $url" >&2
		return 1
	fi
}

echo "[ops-db-migrate-remote] Host: $HOST"
echo ""

echo "== Step 1/4: Runtime diagnose (before) =="
call_json "GET" "$HOST/api/diag-runtime"
echo ""

echo "== Step 2/4: Trigger schema DDL init (CREATE TABLE IF NOT EXISTS for locale/status tables) =="
call_json "POST" "$HOST/api/ops/db-schema-init"
echo ""

echo "== Step 3/4: Trigger migrate (runs any pending migration files) =="
call_json "POST" "$HOST/api/ops/db-migrate?action=migrate"
echo ""

echo "== Step 4/4: Runtime diagnose (after) =="
call_json "GET" "$HOST/api/diag-runtime"
echo ""

echo "[ops-db-migrate-remote] Completed. If probes are still not healthy, run seed and re-check."
