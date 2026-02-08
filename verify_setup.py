#!/usr/bin/env python3
"""
Setup Verification Script
This script verifies that all required files for running the system in WSL have been created.
"""

import os
import sys
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and has content."""
    path = Path(file_path)
    if path.exists():
        try:
            # Check if file has content
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            if content:
                print(f"✅ {description} - File exists and has content")
                return True
            else:
                print(f"⚠️  {description} - File exists but is empty")
                return False
        except Exception as e:
            print(f"❌ {description} - File exists but cannot be read: {e}")
            return False
    else:
        print(f"❌ {description} - File does not exist: {file_path}")
        return False

def check_executable(file_path, description):
    """Check if a file exists and is executable."""
    path = Path(file_path)
    if path.exists():
        # On Windows, we check if it's a .sh or .bat file
        if path.suffix in ['.sh', '.bat']:
            print(f"✅ {description} - Script file exists")
            return True
        # On Unix-like systems, we would check the executable bit
        elif os.access(path, os.X_OK):
            print(f"✅ {description} - File exists and is executable")
            return True
        else:
            print(f"⚠️  {description} - File exists but is not executable")
            return False
    else:
        print(f"❌ {description} - File does not exist: {file_path}")
        return False

def main():
    print("🔍 Verifying Intelligent Customer Service System Setup")
    print("=" * 55)
    
    # Get the current directory
    current_dir = Path(__file__).parent
    
    # Files to check
    files_to_check = [
        # Documentation files
        (current_dir / "WSL_SETUP.md", "WSL Setup Guide"),
        (current_dir / "README.md", "Main README"),
        (current_dir / ".env.example", "Environment Example File"),
        
        # Python scripts
        (current_dir / "test_system.py", "System Test Script"),
        (current_dir / "test_wsl.py", "WSL Compatibility Test"),
        (current_dir / "example_usage.py", "Example Usage Script"),
        (current_dir / "verify_setup.py", "This Script"),
        
        # Shell scripts
        (current_dir / "setup_wsl.sh", "WSL Setup Script"),
        (current_dir / "run_console.sh", "Console Run Script"),
        (current_dir / "run_frontend.sh", "Frontend Run Script"),
        
        # Batch files (Windows)
        (current_dir / "run_console.bat", "Console Run Script (Windows)"),
        (current_dir / "run_frontend.bat", "Frontend Run Script (Windows)"),
        
        # Main application files
        (current_dir / "main.py", "Main Application"),
        (current_dir / "requirements.txt", "Dependencies File"),
        
        # Service files
        (current_dir / "image_service.py", "Image Service"),
        (current_dir / "audio_service.py", "Audio Service"),
        (current_dir / "chat_service.py", "Chat Service"),
        (current_dir / "workflow_service.py", "Workflow Service"),
        (current_dir / "conversation_service.py", "Conversation Service"),
        (current_dir / "bot_service.py", "Bot Service"),
        (current_dir / "audio_http_service.py", "Audio HTTP Service"),
    ]
    
    # Check files
    passed = 0
    total = len(files_to_check)
    
    for file_path, description in files_to_check:
        # Special handling for executable files
        if file_path.suffix in ['.sh', '.bat']:
            if check_executable(file_path, description):
                passed += 1
        else:
            if check_file_exists(file_path, description):
                passed += 1
    
    # Summary
    print("\n" + "=" * 55)
    print(f"SETUP VERIFICATION: {passed}/{total} files verified")
    
    if passed == total:
        print("🎉 All files are present and accounted for!")
        print("\n📝 Next steps:")
        print("   1. Review the WSL_SETUP.md guide for detailed instructions")
        print("   2. Run the test scripts to verify functionality")
        print("   3. Configure your .env file with Coze API credentials")
        print("   4. Start using the system!")
        return 0
    else:
        print("⚠️  Some files are missing or have issues.")
        print("   Please check the output above and ensure all files are present.")
        return 1

if __name__ == "__main__":
    sys.exit(main())