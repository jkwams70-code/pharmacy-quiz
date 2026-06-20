#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/pharmacy-quiz"
FRONTEND_DIR="/var/www/ajix-frontend"
SOURCE_DIR="${REPO_DIR}/www"
BRANCH="${1:-deploy-baseline}"

echo "==> Deploy branch: ${BRANCH}"
cd "${REPO_DIR}"
git fetch origin
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

echo "==> Sync frontend files from www/"
mkdir -p "${FRONTEND_DIR}"
rsync -a --delete "${SOURCE_DIR}/" "${FRONTEND_DIR}/"

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
