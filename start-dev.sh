#!/bin/bash

echo "🚀 Starting Academic Excellence Assessment Platform..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔧 Setting up database and creating demo users..."
node test-auth.js

echo "🖥️  Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🌐 Starting frontend development server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:5000"
echo ""
echo "🎯 Demo Accounts:"
echo "   Admin:   admin@academic-excellence.com / admin123"
echo "   Teacher: teacher@school.edu / teacher123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID