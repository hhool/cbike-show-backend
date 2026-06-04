#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <BASE_URL>"
  echo "Example: $0 https://cbike-show-backend.onrender.com"
  exit 1
fi

BASE_URL="${1%/}"

check_status() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [[ "$code" != "200" ]]; then
    echo "[FAIL] $url -> HTTP $code"
    exit 1
  fi
  echo "[PASS] $url -> HTTP 200"
}

check_contains() {
  local url="$1"
  local pattern="$2"
  if ! curl -s "$url" | grep -q "$pattern"; then
    echo "[FAIL] $url missing pattern: $pattern"
    exit 1
  fi
  echo "[PASS] $url contains: $pattern"
}

echo "Running smoke checks on $BASE_URL"

check_status "$BASE_URL/"
check_status "$BASE_URL/products?lang=zh&brand=nuna-na"
check_status "$BASE_URL/brands/nuna-na?lang=zh"
check_status "$BASE_URL/admin"

check_contains "$BASE_URL/products?lang=zh&brand=nuna-na" "品牌:"
check_contains "$BASE_URL/products?lang=zh&brand=nuna-na" "已选"
check_contains "$BASE_URL/brands/nuna-na?lang=zh" "知名产品"
check_contains "$BASE_URL/brands/nuna-na?lang=zh" "2026 最新款产品"

echo "All smoke checks passed."