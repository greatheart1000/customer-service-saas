#!/bin/bash

# WSL Setup Script for Intelligent Customer Service System
# This script automates the setup process for running the system in WSL

echo "🚀 Setting up Intelligent Customer Service System in WSL..."

# Update package lists
echo "🔄 Updating package lists..."
sudo apt update

# Install Python and pip
echo "🐍 Installing Python and pip..."
sudo apt install -y python3 python3-pip

# Install Node.js
echo "🌐 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install audio dependencies
echo "🔊 Installing audio dependencies..."
sudo apt install -y portaudio19-dev libsndfile1-dev

# Install system utilities
echo "🛠️ Installing system utilities..."
sudo apt install -y build-essential git curl

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd /mnt/d/project/coze-py/customer_service
pip3 install -r requirements.txt

# If PyAudio fails, try system package
if ! pip3 show pyaudio > /dev/null 2>&1; then
    echo "🔧 Installing PyAudio system package..."
    sudo apt install -y python3-pyaudio
fi

# Install Node.js dependencies for frontend
echo "🎨 Installing frontend dependencies..."
cd /mnt/d/project/coze-py/customer_service/frontend
npm install

# Create default .env file if it doesn't exist
if [ ! -f /mnt/d/project/coze-py/customer_service/.env ]; then
    echo "⚙️ Creating default .env file..."
    cat > /mnt/d/project/coze-py/customer_service/.env << EOF
# Coze API Configuration
COZE_API_TOKEN=your_api_token_here
COZE_BOT_ID=your_bot_id_here
COZE_WORKSPACE_ID=your_workspace_id_here
COZE_API_BASE=https://api.coze.cn

# Optional settings
DEBUG=false
EOF
    echo "📝 Please update the .env file with your actual Coze API credentials"
fi

# Setup complete
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update /mnt/d/project/coze-py/customer_service/.env with your Coze API credentials"
echo "2. Run the console interface: python3 /mnt/d/project/coze-py/customer_service/main.py"
echo "3. Run the frontend: cd /mnt/d/project/coze-py/customer_service/frontend && npm run dev"
echo "4. Access the web interface at http://localhost:3000"