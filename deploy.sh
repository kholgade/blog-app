#!/bin/sh
set -e

IMAGE="blog-app"
PORT="32323"

echo "==> Pulling latest posts..."
git pull

echo "==> Building Docker image..."
docker build -t $IMAGE .

echo "==> Stopping existing container..."
docker rm -f $IMAGE 2>/dev/null || true

echo "==> Starting container on port $PORT..."
docker run -d \
  --name $IMAGE \
  --restart unless-stopped \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --read-only \
  --tmpfs /app/repos:uid=1001,gid=1001 \
  --security-opt=no-new-privileges:true \
  -p $PORT:3000 \
  $IMAGE

echo "==> Done. App is running at http://localhost:$PORT"
