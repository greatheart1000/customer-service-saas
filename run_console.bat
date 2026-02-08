@echo off
echo 🤖 Starting Intelligent Customer Service Console Application...

REM Navigate to the customer service directory
cd /d D:\project\coze-py\customer_service

REM Check if virtual environment exists, if not create one
if not exist "venv" (
    echo 🔧 Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    echo 🔄 Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Please create one with your Coze API credentials.
    echo 📝 Example .env content:
    echo COZE_API_TOKEN=your_api_token_here
    echo COZE_BOT_ID=your_bot_id_here
    echo COZE_WORKSPACE_ID=your_workspace_id_here
    pause
    exit /b 1
)

REM Run the main application
echo 🚀 Launching application...
python main.py

echo 👋 Application finished.
pause