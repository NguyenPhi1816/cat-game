#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting required infra (Postgres + Redis) with Docker..."
if command -v docker >/dev/null 2>&1; then
  docker compose up -d || docker-compose up -d
else
  echo "Docker is not installed or not in PATH"
  exit 1
fi

echo "Starting backend (in background)..."
(
  cd "$ROOT_DIR/backend"
  npm run start:dev
) &

echo "Starting AI service (in background)..."
(
  cd "$ROOT_DIR/ai-service"
  python -m uvicorn app.main:app --reload --port 8000
)&

echo "Starting mobile (in background)..."
(
  cd "$ROOT_DIR/mobile"
  npm run start
)&

echo "All commands started (background). Use 'jobs' or check terminals for output."
