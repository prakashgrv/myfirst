#!/usr/bin/env bash
set -e

# ── CollegeGuide AI — Start Script ──────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "🎓 CollegeGuide AI"
echo "──────────────────"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ python3 is required. Please install Python 3.10+."
  exit 1
fi

# Check ANTHROPIC_API_KEY
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a; source "$SCRIPT_DIR/.env"; set +a
fi
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ ANTHROPIC_API_KEY is not set."
  echo "   Copy .env.example to .env and fill in your API key."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies…"
pip install -q -r "$BACKEND_DIR/requirements.txt"

echo ""
echo "✅ Starting server at http://localhost:8000"
echo "   Chat:  http://localhost:8000/index.html"
echo "   Admin: http://localhost:8000/admin.html"
echo ""

cd "$BACKEND_DIR"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
