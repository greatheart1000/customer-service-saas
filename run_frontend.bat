@echo off
echo 🎨 Starting Intelligent Customer Service Frontend Application...

REM Navigate to the frontend directory
cd /d D:\project\coze-py\customer_service\frontend

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Run the development server
echo 🚀 Starting development server...
echo 🌍 Access the application at http://localhost:3000
npm run dev

pause