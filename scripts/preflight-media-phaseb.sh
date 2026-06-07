#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_BASE_URL="${BACKEND_BASE_URL:-https://cbike-show-backend.vercel.app}"
ENV_FILE="${ENV_FILE:-}"
APPLY_SCHEMA=false
SKIP_SCHEMA_VERIFY=false
PREVIEW_ONLY=false
STRICT=false
REPORT=false
REPORT_FILE=""
REPORT_JSON=false
REPORT_JSON_FILE=""
PREVIEW_LIKE_PATTERN=""
PREVIEW_LIMIT=""
REPORT_SCHEMA="cbike.preflight.report.v1"
REPORT_VERSION="1"
RUN_ID="$(date +%Y%m%d%H%M%S)-$$"
declare -a MISSING_ENV_ITEMS=()
declare -a REQUIRED_ENV_ITEMS=()

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

write_json_report() {
  local exit_code="$1"
  local generated_at
  local env_file_value
  local preview_limit_value
  local missing_json=""
  local required_json=""
  local i
  local item

  if [[ "$REPORT_JSON" != "true" ]]; then
    return
  fi

  generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  env_file_value="$ENV_FILE"
  preview_limit_value="$PREVIEW_LIMIT"

  for i in "${!MISSING_ENV_ITEMS[@]}"; do
    item="${MISSING_ENV_ITEMS[$i]}"
    if [[ "$i" -gt 0 ]]; then
      missing_json+=" ,"
    fi
    missing_json+="\"$(json_escape "$item")\""
  done

  for i in "${!REQUIRED_ENV_ITEMS[@]}"; do
    item="${REQUIRED_ENV_ITEMS[$i]}"
    if [[ "$i" -gt 0 ]]; then
      required_json+=" ,"
    fi
    required_json+="\"$(json_escape "$item")\""
  done

  cat > "$REPORT_JSON_FILE" <<EOF
{
  "schema": "$(json_escape "$REPORT_SCHEMA")",
  "reportVersion": "$(json_escape "$REPORT_VERSION")",
  "runId": "$(json_escape "$RUN_ID")",
  "generatedAt": "$(json_escape "$generated_at")",
  "exitCode": $exit_code,
  "success": $([[ "$exit_code" -eq 0 ]] && echo true || echo false),
  "backendBaseUrl": "$(json_escape "$BACKEND_BASE_URL")",
  "envFile": "$(json_escape "$env_file_value")",
  "applySchema": $([[ "$APPLY_SCHEMA" == "true" ]] && echo true || echo false),
  "skipSchemaVerify": $([[ "$SKIP_SCHEMA_VERIFY" == "true" ]] && echo true || echo false),
  "previewOnly": $([[ "$PREVIEW_ONLY" == "true" ]] && echo true || echo false),
  "strict": $([[ "$STRICT" == "true" ]] && echo true || echo false),
  "reportTextEnabled": $([[ "$REPORT" == "true" ]] && echo true || echo false),
  "previewLikePattern": "$(json_escape "$PREVIEW_LIKE_PATTERN")",
  "previewLimit": "$(json_escape "$preview_limit_value")",
  "requiredEnvVars": [ $required_json ],
  "missingEnvVars": [ $missing_json ]
}
EOF

  echo "[Preflight] json report file: $REPORT_JSON_FILE"
}

on_exit() {
  local exit_code="$1"
  write_json_report "$exit_code"
}

trap 'on_exit $?' EXIT

usage() {
  echo "Usage: ./scripts/preflight-media-phaseb.sh [--env-file <path>] [--apply-schema] [--skip-schema-verify] [--preview-only] [--strict] [--report] [--report-file <path>] [--report-json] [--report-json-file <path>] [--preview-like <pattern>] [--preview-limit <N>]" >&2
}

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --apply-schema)
      APPLY_SCHEMA=true
      shift
      ;;
    --skip-schema-verify)
      SKIP_SCHEMA_VERIFY=true
      shift
      ;;
    --preview-only)
      PREVIEW_ONLY=true
      shift
      ;;
    --strict)
      STRICT=true
      shift
      ;;
    --report)
      REPORT=true
      shift
      ;;
    --report-file)
      if [[ "$#" -lt 2 ]]; then
        echo "--report-file requires a file path" >&2
        usage
        exit 1
      fi
      REPORT=true
      REPORT_FILE="$2"
      shift 2
      ;;
    --report-json)
      REPORT_JSON=true
      shift
      ;;
    --report-json-file)
      if [[ "$#" -lt 2 ]]; then
        echo "--report-json-file requires a file path" >&2
        usage
        exit 1
      fi
      REPORT_JSON=true
      REPORT_JSON_FILE="$2"
      shift 2
      ;;
    --env-file)
      if [[ "$#" -lt 2 ]]; then
        echo "--env-file requires a file path" >&2
        usage
        exit 1
      fi
      ENV_FILE="$2"
      shift 2
      ;;
    --preview-like)
      if [[ "$#" -lt 2 ]]; then
        echo "--preview-like requires a pattern value" >&2
        usage
        exit 1
      fi
      PREVIEW_LIKE_PATTERN="$2"
      shift 2
      ;;
    --preview-limit)
      if [[ "$#" -lt 2 ]]; then
        echo "--preview-limit requires a positive integer" >&2
        usage
        exit 1
      fi
      PREVIEW_LIMIT="$2"
      if ! [[ "$PREVIEW_LIMIT" =~ ^[1-9][0-9]*$ ]]; then
        echo "--preview-limit must be a positive integer" >&2
        exit 1
      fi
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$PREVIEW_ONLY" == "true" ]] && [[ -z "$PREVIEW_LIKE_PATTERN" ]]; then
  echo "--preview-only requires --preview-like <pattern>" >&2
  exit 1
fi

if [[ "$PREVIEW_ONLY" == "true" ]]; then
  APPLY_SCHEMA=false
  SKIP_SCHEMA_VERIFY=true
fi

if [[ "$REPORT" == "true" ]] && [[ -z "$REPORT_FILE" ]]; then
  REPORT_FILE="/tmp/cbike_preflight_report_$(date +%Y%m%d_%H%M%S).log"
fi

if [[ "$REPORT_JSON" == "true" ]] && [[ -z "$REPORT_JSON_FILE" ]]; then
  REPORT_JSON_FILE="/tmp/cbike_preflight_report_$(date +%Y%m%d_%H%M%S).json"
fi

if [[ -n "$REPORT_FILE" ]]; then
  report_dir="$(dirname "$REPORT_FILE")"
  mkdir -p "$report_dir"
  : > "$REPORT_FILE"
  exec > >(tee -a "$REPORT_FILE") 2>&1
  echo "[Preflight] report file: $REPORT_FILE"
fi

if [[ -n "$REPORT_JSON_FILE" ]]; then
  report_json_dir="$(dirname "$REPORT_JSON_FILE")"
  mkdir -p "$report_json_dir"
fi

if [[ -z "$ENV_FILE" ]] && [[ -f "$ROOT_DIR/.env.local" ]]; then
  ENV_FILE="$ROOT_DIR/.env.local"
fi

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Env file not found: $ENV_FILE" >&2
    exit 1
  fi

  echo "[Preflight] loading env file: $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

check_env_requirement() {
  local var_name="$1"
  local reason="$2"

  REQUIRED_ENV_ITEMS+=("$var_name")

  if [[ -z "${!var_name:-}" ]]; then
    MISSING_ENV_ITEMS+=("$var_name ($reason)")
  fi
}

assert_env_requirements() {
  if [[ "${#MISSING_ENV_ITEMS[@]}" -eq 0 ]]; then
    return
  fi

  if [[ "$STRICT" == "true" ]]; then
    echo "Missing required env vars:" >&2
    for item in "${MISSING_ENV_ITEMS[@]}"; do
      echo "- $item" >&2
    done
    exit 1
  fi

  echo "Missing required env var: ${MISSING_ENV_ITEMS[0]}" >&2
  exit 1
}

run_preview_keys() {
  local preview_cmd
  preview_cmd=("$ROOT_DIR/scripts/preview-media-r2-keys.sh" "--like")

  if [[ -n "$PREVIEW_LIMIT" ]]; then
    preview_cmd+=("--latest" "$PREVIEW_LIMIT")
  fi

  preview_cmd+=("$PREVIEW_LIKE_PATTERN")
  "${preview_cmd[@]}" | tee /tmp/cbike_preflight_r2_preview.txt
}

echo "[Preflight] backend base url: $BACKEND_BASE_URL"

if [[ "$PREVIEW_ONLY" != "true" ]]; then
  if [[ "$APPLY_SCHEMA" == "true" ]] || [[ "$SKIP_SCHEMA_VERIFY" != "true" ]]; then
    check_env_requirement "DATABASE_URL" "required for schema update/verification"
  fi

  check_env_requirement "DIAG_TRIGGER_SECRET" "required for /api/diag-runtime check"
  assert_env_requirements
fi

if [[ "$APPLY_SCHEMA" == "true" ]]; then
  echo "[Preflight] applying schema update"
  "$ROOT_DIR/scripts/schema-update-media-phaseb.sh"
else
  echo "[Preflight] skipping schema update (verify-only mode)"
fi

if [[ "$SKIP_SCHEMA_VERIFY" == "true" ]]; then
  echo "[Preflight] skipping schema verify by flag"
else
  echo "[Preflight] verifying schema columns"
  "$ROOT_DIR/scripts/schema-verify-media-phaseb.sh"
fi

if [[ -n "$PREVIEW_LIKE_PATTERN" ]]; then
  echo "[Preflight] preview R2 keys by LIKE pattern: $PREVIEW_LIKE_PATTERN"
  run_preview_keys
fi

if [[ "$PREVIEW_ONLY" == "true" ]]; then
  echo "[Preflight] preview-only mode complete"
  exit 0
fi

echo "[Preflight] smoke check: /api/media?limit=1"
media_code="$(curl -sS -o /tmp/cbike_preflight_media.json -w '%{http_code}' "$BACKEND_BASE_URL/api/media?limit=1")"
[[ "$media_code" == "200" ]] || { echo "media endpoint failed: $media_code" >&2; exit 1; }

echo "[Preflight] smoke check: /api/products?limit=1"
products_code="$(curl -sS -o /tmp/cbike_preflight_products.json -w '%{http_code}' "$BACKEND_BASE_URL/api/products?limit=1")"
[[ "$products_code" == "200" ]] || { echo "products endpoint failed: $products_code" >&2; exit 1; }

echo "[Preflight] smoke check: /api/diag-runtime"
diag_code="$(curl -sS -H "x-diag-secret: $DIAG_TRIGGER_SECRET" -o /tmp/cbike_preflight_diag.json -w '%{http_code}' "$BACKEND_BASE_URL/api/diag-runtime")"
[[ "$diag_code" == "200" ]] || { echo "diag endpoint failed: $diag_code" >&2; exit 1; }

echo "[Preflight] all checks passed"
