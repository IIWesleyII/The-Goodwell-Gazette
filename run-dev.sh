#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/app"
FRONTEND_DIR="$BACKEND_DIR/frontend"
PYTHON_EXE="$BACKEND_DIR/venv/Scripts/python.exe"

if [ ! -x "$PYTHON_EXE" ]; then
  echo "Error: Python venv not found or not executable at $PYTHON_EXE"
  exit 1
fi

cleanup() {
  echo
  echo "Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Flask backend on http://127.0.0.1:5000"
(
  cd "$BACKEND_DIR"
  "$PYTHON_EXE" app.py
) &
BACKEND_PID=$!

echo "Starting Vite frontend on http://goodwellgazette.test:5173"
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

echo "Both services are running. Press Ctrl+C to stop."
wait "$BACKEND_PID" "$FRONTEND_PID"
