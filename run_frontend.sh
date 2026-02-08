#!/bin/bash

# Run Script for Intelligent Customer Service Frontend Application

echo "🎨 Starting Intelligent Customer Service Frontend Application..."

# Navigate to the frontend directory
cd /mnt/d/project/coze-py/customer_service/frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Run the development server
echo "🚀 Starting development server..."
echo "🌍 Access the application at http://localhost:3000"
npm run dev