#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_PATH="${DB_PATH:-$ROOT_DIR/payload.db}"
ENV_PREFIX="${R2_ENV_PREFIX:-prod}"
ENTITY_TYPE="${R2_ENTITY_TYPE:-common}"
MODE="id"
LATEST=""

if [[ ! -f "$DB_PATH" ]]; then
  echo "Database file not found: $DB_PATH" >&2
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required but not found in PATH" >&2
  exit 1
fi

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --filename)
      MODE="filename"
      shift
      ;;
    --like)
      MODE="like"
      shift
      ;;
    --latest)
      if [[ "$#" -lt 2 ]]; then
        echo "--latest requires a positive integer value" >&2
        exit 1
      fi
      LATEST="$2"
      if ! [[ "$LATEST" =~ ^[1-9][0-9]*$ ]]; then
        echo "--latest must be a positive integer" >&2
        exit 1
      fi
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

if [[ "$#" -eq 0 ]]; then
  echo "Usage (id mode): ./scripts/preview-media-r2-keys.sh <media_id> [media_id ...]" >&2
  echo "Usage (filename mode): ./scripts/preview-media-r2-keys.sh --filename <filename> [filename ...]" >&2
  echo "Usage (like mode): ./scripts/preview-media-r2-keys.sh --like <pattern> [pattern ...]" >&2
  echo "Optional: --latest <N> (limit returned rows per input for filename/like modes)" >&2
  echo "Example: ./scripts/preview-media-r2-keys.sh 1 2 3" >&2
  echo "Example: ./scripts/preview-media-r2-keys.sh --filename 'Nuna_TRVLlx_Caviar_Angle_GL_web_1100x.webp'" >&2
  echo "Example: ./scripts/preview-media-r2-keys.sh --like '%Nuna%' '%unsplash%'" >&2
  echo "Example: ./scripts/preview-media-r2-keys.sh --like --latest 2 '%Nuna%'" >&2
  exit 1
fi

print_preview_from_row() {
  local row="$1"

  if [[ -z "$row" ]]; then
    return
  fi

  local id filename created_at yyyy mm ext prefix base_name

  id="$(printf '%s' "$row" | cut -d'|' -f1)"
  filename="$(printf '%s' "$row" | cut -d'|' -f2)"
  created_at="$(printf '%s' "$row" | cut -d'|' -f3)"

  yyyy="${created_at:0:4}"
  mm="${created_at:5:2}"

  ext="bin"
  if [[ "$filename" == *.* ]]; then
    ext="${filename##*.}"
    ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')"
    [[ -z "$ext" ]] && ext="bin"
  fi

  prefix="$ENV_PREFIX/media/$yyyy/$mm/$ENTITY_TYPE/$id"
  base_name="{timestamp-rand}.$ext"

  echo "media id=$id"
  echo "filename=$filename"
  echo "created_at=$created_at"
  echo "original=$prefix/original/$base_name"
  echo "thumb=$prefix/thumb/$base_name"
  echo "card=$prefix/card/$base_name"
  echo "hero=$prefix/hero/$base_name"
  echo "---"
}

for input in "$@"; do
  if [[ "$MODE" == "id" ]]; then
    row="$(sqlite3 "$DB_PATH" "select id, filename, created_at from media where id = $input;")"

    if [[ -z "$row" ]]; then
      echo "media id=$input not found"
      echo "---"
      continue
    fi

    print_preview_from_row "$row"
    continue
  fi

  safe_input="$(printf '%s' "$input" | sed "s/'/''/g")"

  limit_clause=""
  if [[ -n "$LATEST" ]]; then
    limit_clause=" limit $LATEST"
  fi

  if [[ "$MODE" == "filename" ]]; then
    rows="$(sqlite3 "$DB_PATH" "select id, filename, created_at from media where filename = '$safe_input' order by created_at desc$limit_clause;")"
  else
    rows="$(sqlite3 "$DB_PATH" "select id, filename, created_at from media where filename like '$safe_input' order by created_at desc$limit_clause;")"
  fi

  if [[ -z "$rows" ]]; then
    if [[ "$MODE" == "filename" ]]; then
      echo "filename=$input not found"
    else
      echo "pattern=$input no matches"
    fi
    echo "---"
    continue
  fi

  while IFS= read -r row; do
    print_preview_from_row "$row"
  done <<< "$rows"
done
