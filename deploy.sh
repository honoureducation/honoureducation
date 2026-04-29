#!/bin/bash

# Academic Excellence Assessment Platform - Deployment Script
echo "🚀 Preparing Academic Excellence Assessment Platform for deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies and test builds locally
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🏗️ Testing frontend build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo "✅ Local build successful!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Click 'New +' → 'Blueprint'"
echo "4. Connect your GitHub repository"
echo "5. Set up your MongoDB Atlas database"
echo "6. Configure environment variables in Render"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo "🎉 Ready for deployment!"