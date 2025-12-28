#!/usr/bin/env bash
set -euo pipefail

echo "==> entrypoint version: 2025-12-28-mappings"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN is leeg."
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "ERROR: CLOUDFLARE_ACCOUNT_ID is leeg."
  exit 1
fi

if [[ -z "${R2_BUCKET:-}" ]]; then
  echo "ERROR: R2_BUCKET is leeg."
  exit 1
fi

echo "==> Installing dependencies..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Running build..."
npm run build

# ==========================================================
# MAPPINGS
# key   = lokaal pad (file of directory)
# value = destination in R2 (prefix of volledige key)
# ==========================================================
declare -A UPLOAD_MAP=(
  ["./public/dist/js"]="js"
  ["./public/dist/images"]="images"
  ["./public/dev-banner.html"]="dev-banner.html"
)

# Optional extra prefix in bucket (bijv. "assets" -> assets/js/...)
EXTRA_PREFIX="${R2_PREFIX:-}"
EXTRA_PREFIX="${EXTRA_PREFIX#/}"
if [[ -n "${EXTRA_PREFIX}" && "${EXTRA_PREFIX: -1}" != "/" ]]; then
  EXTRA_PREFIX="${EXTRA_PREFIX}/"
fi

echo "==> Uploading to R2 bucket: ${R2_BUCKET} (prefix: ${EXTRA_PREFIX})"

for SRC in "${!UPLOAD_MAP[@]}"; do
  DEST="${UPLOAD_MAP[$SRC]}"

  if [[ ! -e "${SRC}" ]]; then
    echo "==> Skip: ${SRC} bestaat niet."
    continue
  fi

  # --------------------------------------------------------
  # Directory
  # --------------------------------------------------------
  if [[ -d "${SRC}" ]]; then
    echo "==> Uploading directory: ${SRC} -> ${DEST}/"

    find "${SRC}" -type f -print0 | while IFS= read -r -d '' file; do
      rel="${file#${SRC}/}"
      key="${EXTRA_PREFIX}${DEST}/${rel}"
      echo " -> ${file} => r2://${R2_BUCKET}/${key}"
      wrangler r2 object put "${R2_BUCKET}/${key}" --file "${file}" --remote
    done

  # --------------------------------------------------------
  # File
  # --------------------------------------------------------
  elif [[ -f "${SRC}" ]]; then
    echo "==> Uploading file: ${SRC} -> ${DEST}"

    key="${EXTRA_PREFIX}${DEST}"
    echo " -> ${SRC} => r2://${R2_BUCKET}/${key}"
    wrangler r2 object put "${R2_BUCKET}/${key}" --file "${SRC}" --remote
  fi
done

echo "==> Upload klaar. Container stopt."
