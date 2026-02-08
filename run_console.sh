#!/bin/bash

# Run Script for Intelligent Customer Service Console Application

echo "🤖 Starting Intelligent Customer Service Console Application..."

# Navigate to the customer service directory
cd /mnt/d/project/coze-py/customer_service

# Check if virtual environment exists, if not create one
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "🔄 Activating virtual environment..."
    source venv/bin/activate
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your Coze API credentials."
    echo "📝 Example .env content:"
    echo "COZE_API_TOKEN=your_api_token_here"
    echo "COZE_BOT_ID=your_bot_id_here"
    echo "COZE_WORKSPACE_ID=your_workspace_id_here"
    exit 1
fi

# Run the main application
echo "🚀 Launching application..."
python3 main.py

echo "👋 Application finished."