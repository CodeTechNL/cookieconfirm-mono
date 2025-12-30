#!/usr/bin/env bash
set -euo pipefail

echo "VITE_CDN_URL=$VITE_CDN_URL"   # runtime

exec "$@"

echo "==> entrypoint version: 2025-12-28-lambda-tmp"

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

# Lambda: alleen /tmp is writable
export HOME="/tmp"
export npm_config_cache="/tmp/.npm"

SRC_APP="/opt/app"
WORK_APP="/tmp/app"

echo "==> Preparing writable workspace in ${WORK_APP}"
rm -rf "${WORK_APP}"
mkdir -p "${WORK_APP}"
cp -R "${SRC_APP}/." "${WORK_APP}/"

cd "${WORK_APP}"

echo "==> Installing dependencies (in /tmp)..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Running build (in /tmp)..."
npm run build

# ==========================================================
# MAPPINGS
# key   = lokaal pad (file of directory)
# value = destination in R2 (prefix of volledige key)
# ==========================================================
declare -A UPLOAD_MAP=(
  ["${WORK_APP}/public/dist/js"]="js"
  ["${WORK_APP}/development/data-sources/localhost"]="banner/localhost"
  ["${WORK_APP}/public/dist/images"]="images"
  ["${WORK_APP}/public/dist/css"]="css"
  ["${WORK_APP}/public/dev-banner.html"]="dev-banner.html"
)

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

  if [[ -d "${SRC}" ]]; then
    echo "==> Uploading directory: ${SRC} -> ${DEST}/"

    find "${SRC}" -type f -print0 | while IFS= read -r -d '' file; do
      rel="${file#${SRC}/}"
      key="${EXTRA_PREFIX}${DEST}/${rel}"
      echo " -> ${file} => r2://${R2_BUCKET}/${key}"
      wrangler r2 object put "${R2_BUCKET}/${key}" --file "${file}" --remote
    done

  elif [[ -f "${SRC}" ]]; then
    echo "==> Uploading file: ${SRC} -> ${DEST}"

    key="${EXTRA_PREFIX}${DEST}"
    echo " -> ${SRC} => r2://${R2_BUCKET}/${key}"
    wrangler r2 object put "${R2_BUCKET}/${key}" --file "${SRC}" --remote
  fi
done

echo "==> Upload klaar. Lambda stopt."
