#!/bin/bash

# Full WSL Setup Script for Intelligent Customer Service System
# This script completely sets up the environment for running the system in WSL

set -e  # Exit on any error

echo "🚀 Starting Full WSL Setup for Intelligent Customer Service System..."
echo "==============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're running in WSL
check_wsl() {
    if grep -q microsoft /proc/version; then
        print_success "WSL environment detected"
        return 0
    else
        print_warning "Not running in WSL. This script is designed for WSL environments."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update
}

# Install required system dependencies
install_system_deps() {
    print_status "Installing system dependencies..."
    
    # Essential packages
    sudo apt install -y \
        python3 \
        python3-pip \
        python3-venv \
        build-essential \
        git \
        curl \
        wget \
        nano \
        vim
    
    # Audio dependencies
    sudo apt install -y \
        portaudio19-dev \
        python3-pyaudio \
        libsndfile1-dev \
        pulseaudio
    
    # Node.js for frontend
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "System dependencies installed"
}

# Setup Python virtual environment
setup_python_venv() {
    print_status "Setting up Python virtual environment..."
    
    # Navigate to project directory
    cd /mnt/d/project/coze-py/customer_service
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    print_success "Python virtual environment activated"
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    # Make sure we're in the right directory and venv is activated
    cd /mnt/d/project/coze-py/customer_service
    source venv/bin/activate
    
    # Install requirements
    pip install -r requirements.txt
    
    # Install additional packages that might be needed
    pip install pytest pytest-cov black flake8
    
    print_success "Python dependencies installed"
}

# Setup frontend dependencies
setup_frontend() {
    print_status "Setting up frontend dependencies..."
    
    cd /mnt/d/project/coze-py/customer_service/frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_status "Frontend dependencies already installed"
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cd /mnt/d/project/coze-py/customer_service
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Environment file created from example"
        print_warning "Remember to edit .env with your actual Coze API credentials"
    else
        print_status "Environment file already exists"
    fi
}

# Setup PulseAudio for audio support
setup_audio() {
    print_status "Setting up audio support..."
    
    # Start PulseAudio
    pulseaudio --start 2>/dev/null || true
    
    # Set environment variables
    export PULSE_SERVER=localhost
    
    # Test audio devices
    if command -v python3 &> /dev/null; then
        source venv/bin/activate
        python3 -c "
import pyaudio
try:
    pa = pyaudio.PyAudio()
    devices = pa.get_device_count()
    print(f'Found {devices} audio devices')
    pa.terminate()
    print('Audio setup successful')
except Exception as e:
    print(f'Audio setup warning: {e}')
"
    fi
    
    print_success "Audio support configured"
}

# Run system tests
run_tests() {
    print_status "Running system tests..."
    
    cd /mnt/d/project/coze-py/customer_service
    source venv/bin/activate
    
    # Run our test scripts
    python3 test_system.py || print_warning "System test had some issues"
    python3 test_wsl.py || print_warning "WSL test had some issues"
    
    print_success "Tests completed"
}

# Create convenient aliases
create_aliases() {
    print_status "Creating convenient aliases..."
    
    # Add to .bashrc if not already present
    if ! grep -q "coze-customer-service" ~/.bashrc; then
        cat >> ~/.bashrc << 'EOF'

# Aliases for Coze Customer Service System
alias coze-console='cd /mnt/d/project/coze-py/customer_service && source venv/bin/activate && python3 main.py'
alias coze-frontend='cd /mnt/d/project/coze-py/customer_service/frontend && npm run dev'
alias coze-test='cd /mnt/d/project/coze-py/customer_service && source venv/bin/activate && python3 test_system.py'
alias coze-env='cd /mnt/d/project/coze-py/customer_service && nano .env'
EOF
        print_success "Aliases added to ~/.bashrc"
        print_status "Restart your terminal or run 'source ~/.bashrc' to use the aliases"
    else
        print_status "Aliases already exist in ~/.bashrc"
    fi
}

# Display usage instructions
show_usage() {
    echo
    print_success "🎉 Full WSL Setup Complete!"
    echo
    print_status "Next steps:"
    echo "  1. Edit your environment file with actual credentials:"
    echo "     nano /mnt/d/project/coze-py/customer_service/.env"
    echo
    echo "  2. Run the console application:"
    echo "     coze-console  (or cd /mnt/d/project/coze-py/customer_service && python3 main.py)"
    echo
    echo "  3. Run the frontend application:"
    echo "     coze-frontend  (or cd /mnt/d/project/coze-py/customer_service/frontend && npm run dev)"
    echo
    echo "  4. Run system tests:"
    echo "     coze-test  (or cd /mnt/d/project/coze-py/customer_service && python3 test_system.py)"
    echo
    print_status "Convenient aliases created:"
    echo "  coze-console  - Run the console application"
    echo "  coze-frontend - Run the frontend development server"
    echo "  coze-test     - Run system tests"
    echo "  coze-env      - Edit environment file"
    echo
}

# Main execution
main() {
    check_wsl
    update_system
    install_system_deps
    setup_python_venv
    install_python_deps
    setup_frontend
    create_env_file
    setup_audio
    run_tests
    create_aliases
    show_usage
    
    print_success "Full WSL setup completed successfully!"
}

# Run main function
main "$@"