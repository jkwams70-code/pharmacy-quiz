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

echo "==> Sync frontend files"
cp -f index.html "${FRONTEND_DIR}/index.html"
cp -f engine.js "${FRONTEND_DIR}/engine.js"
cp -f styles.css "${FRONTEND_DIR}/styles.css"
cp -f data.js "${FRONTEND_DIR}/data.js"
cp -f backendClient.js "${FRONTEND_DIR}/backendClient.js"
cp -f status.html "${FRONTEND_DIR}/status.html"
cp -rf admin "${FRONTEND_DIR}/admin"
cp -rf topics "${FRONTEND_DIR}/topics"
cp -rf images "${FRONTEND_DIR}/images"

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
