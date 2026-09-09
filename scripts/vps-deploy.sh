#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/pharmacy-quiz"
FRONTEND_DIR="/var/www/ajix-frontend"
BRANCH="${1:-deploy-baseline}"

echo "==> Deploy branch: ${BRANCH}"
cd "${REPO_DIR}"
git fetch origin
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

echo "==> Sync frontend files from www/"
mkdir -p "${FRONTEND_DIR}"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "${REPO_DIR}/www/" "${FRONTEND_DIR}/"
else
  cp -a "${REPO_DIR}/www/." "${FRONTEND_DIR}/"
fi

# Copy Google Search Console verification files if present.
shopt -s nullglob
for verify_file in google*.html; do
  cp -f "${verify_file}" "${FRONTEND_DIR}/${verify_file}"
done
shopt -u nullglob

echo "==> Reload web server"
systemctl reload caddy

echo "==> Restart backend"
cd "${REPO_DIR}/backend"
npm install --omit=dev
pm2 restart quiz-api --update-env
pm2 save

echo "==> Health check"
curl -s http://localhost:4000/api/health
echo
echo "Deploy complete."