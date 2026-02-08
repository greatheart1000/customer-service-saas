# Running Intelligent Customer Service System in WSL

This guide explains how to set up and run the intelligent customer service system in a Windows Subsystem for Linux (WSL) environment.

## Prerequisites

1. **WSL2 Installation**
   - Windows 10 version 2004 or higher
   - WSL2 enabled with a Linux distribution (Ubuntu recommended)

2. **System Requirements**
   - Python 3.8 or higher
   - Node.js 14 or higher (for frontend)
   - Git

## WSL Setup Instructions

### 1. Update and Install Dependencies

```bash
# Update package lists
sudo apt update

# Install Python and pip
sudo apt install python3 python3-pip

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PortAudio development headers (required for PyAudio)
sudo apt install portaudio19-dev

# Install system dependencies for audio processing
sudo apt install libsndfile1-dev
```

### 2. Clone or Access the Repository

If you haven't already cloned the repository:

```bash
# Clone the repository
git clone <repository-url>
cd coze-py
```

Or if you're working with the existing files in Windows, access them through WSL:

```bash
# Access Windows files from WSL (assuming project is in D:\project\coze-py)
cd /mnt/d/project/coze-py
```

### 3. Backend Setup (Python)

Navigate to the customer service directory:

```bash
cd customer_service
```

Install Python dependencies:

```bash
# Install required packages
pip3 install -r requirements.txt

# If you encounter issues with PyAudio, try:
pip3 install pyaudio
# Or if that fails:
sudo apt install python3-pyaudio
```

### 4. Frontend Setup (React)

Navigate to the frontend directory:

```bash
cd frontend
```

Install Node.js dependencies:

```bash
npm install
```

## Environment Configuration

### Set Required Environment Variables

Create a `.env` file in the `customer_service` directory:

```bash
# Navigate to customer_service directory
cd /mnt/d/project/coze-py/customer_service

# Create .env file
cat > .env << EOF
COZE_API_TOKEN=your_api_token_here
COZE_BOT_ID=your_bot_id_here
COZE_WORKSPACE_ID=your_workspace_id_here
COZE_API_BASE=https://api.coze.cn
EOF
```

Replace the placeholder values with your actual Coze API credentials.

## Running the System

### Option 1: Console-Based Interface

```bash
# Navigate to customer_service directory
cd /mnt/d/project/coze-py/customer_service

# Run the main application
python3 main.py
```

### Option 2: Web Interface

1. **Start the Frontend Development Server**

```bash
# Navigate to frontend directory
cd /mnt/d/project/coze-py/customer_service/frontend

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

2. **(Optional) Start the Backend API Server**

If you plan to connect the frontend to actual backend services, you'll need to run the backend API:

```bash
# This would require creating an API server (not included in current implementation)
# Placeholder command:
# python3 api_server.py
```

## Testing the System

### Run System Tests

```bash
# Navigate to customer_service directory
cd /mnt/d/project/coze-py/customer_service

# Run the test script
python3 test_system.py
```

### Test WSL Compatibility

```bash
# Navigate to customer_service directory
cd /mnt/d/project/coze-py/customer_service

# Run the WSL compatibility test
python3 test_wsl.py
```

### Example Usage

```bash
# Navigate to customer_service directory
cd /mnt/d/project/coze-py/customer_service

# Run example usage script
python3 example_usage.py
```

## Troubleshooting Common Issues

### 1. Audio Device Issues

If you encounter audio device errors:

```bash
# Install PulseAudio for audio support in WSL2
sudo apt install pulseaudio

# Start PulseAudio
pulseaudio --start

# Set environment variables
export PULSE_SERVER=localhost
```

### 2. PortAudio Errors

If PyAudio installation fails:

```bash
# Install additional dependencies
sudo apt install build-essential portaudio19-dev python3-pyaudio

# Try installing PyAudio again
pip3 install pyaudio
```

### 3. Permission Issues

If you encounter permission issues:

```bash
# Make sure you have proper permissions
sudo chown -R $USER:$USER /mnt/d/project/coze-py

# Or run with appropriate permissions
sudo -E python3 main.py
```

### 4. Network Connectivity

Ensure WSL can access the internet:

```bash
# Test connectivity
ping api.coze.cn

# If DNS resolution fails, try:
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

## WSL-Specific Considerations

### File System Performance

For better performance, keep your project files in the Linux file system rather than accessing Windows files through `/mnt/`:

```bash
# Copy project to Linux filesystem for better performance
cp -r /mnt/d/project/coze-py ~/coze-py
cd ~/coze-py/customer_service
```

### Audio Support

WSL2 has limited audio support. For full audio functionality:

1. Install PulseAudio on Windows
2. Configure WSL to forward audio to Windows

### Display Forwarding (for GUI applications)

If you want to run GUI applications:

```bash
# Install X-server on Windows (e.g., VcXsrv, Xming)
# Export display in WSL
export DISPLAY=:0

# Test with a simple GUI app
sudo apt install x11-apps
xeyes
```

## Development Workflow in WSL

1. **Edit files in Windows** using your preferred editor
2. **Run and test in WSL** for a Linux-like environment
3. **Access files through `/mnt/`** path in WSL

Example workflow:

```bash
# In Windows terminal (editing)
# Edit files using VS Code or other editors

# In WSL terminal (running/testing)
cd /mnt/d/project/coze-py/customer_service
python3 main.py
```

## Performance Tips

1. **Use WSL2** instead of WSL1 for better performance
2. **Keep project files in Linux filesystem** when possible
3. **Use VS Code with Remote-WSL extension** for seamless development
4. **Allocate sufficient memory** to WSL through .wslconfig

Create `.wslconfig` in your Windows user directory (`C:\Users\YourUsername\.wslconfig`):

```ini
[wsl2]
memory=4GB
processors=2
```

## Next Steps

1. Configure your Coze API credentials in the `.env` file
2. Test the console-based interface with `python3 main.py`
3. Run the frontend with `npm run dev` and access `http://localhost:3000`
4. Explore all the multimodal features of the intelligent customer service system