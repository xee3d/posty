#!/bin/bash
echo "====================================
  Stable Deployment Process
===================================="

cd posty-server

echo "[1] Pulling latest environment variables..."
vercel env pull .env.local

echo "[2] Building and deploying..."
vercel --prod --yes

echo "[3] Getting deployment URL..."
DEPLOYMENT_URL=$(vercel ls --prod | grep "Ready" | head -1 | awk '{print $2}')
echo "Latest deployment: $DEPLOYMENT_URL"

echo "[4] Testing deployment..."
curl -s "$DEPLOYMENT_URL/api/health" | jq .

echo "[5] Setting up domain alias..."
vercel domains add posty-server-new.vercel.app

echo "[6] Verifying domain..."
sleep 5
curl -s "https://posty-server-new.vercel.app/api/health" | jq .

echo "
====================================
Deployment Complete!
====================================

Monitor the servers with:
node ../monitor-servers.js
"
