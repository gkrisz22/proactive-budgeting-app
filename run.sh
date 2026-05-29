#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

echo "=== Starting Proactive Budgeting Dev Servers ==="

# 1. Start Backend
echo "-> Setting up and starting Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    # Try python3 first, fallback to python
    if command -v python3 &>/dev/null; then
        python3 -m venv venv
    else
        python -m venv venv
    fi
fi

# Activate venv
source venv/bin/activate
pip install -r requirements.txt

# Start backend in background
uvicorn app.main:app --reload &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "-> Setting up and starting Frontend..."
cd frontend
npm install

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are running!"
echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C to kill both background processes gracefully
trap "echo -e '\nShutting down servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait indefinitely so the script doesn't exit immediately
wait $BACKEND_PID $FRONTEND_PID
