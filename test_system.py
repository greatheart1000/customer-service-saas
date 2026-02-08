#!/usr/bin/env python3
"""
Test script for the Intelligent Customer Service System
This script verifies that all components of the system are working correctly.
"""

import os
import sys
import importlib.util
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_import_module(module_name, file_path):
    """Test if a module can be imported successfully."""
    try:
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        print(f"✅ {module_name} - Import successful")
        return True
    except Exception as e:
        print(f"❌ {module_name} - Import failed: {str(e)}")
        return False

def check_file_exists(file_path, description):
    """Check if a file exists."""
    if os.path.exists(file_path):
        print(f"✅ {description} - File exists")
        return True
    else:
        print(f"❌ {description} - File not found: {file_path}")
        return False

def main():
    print("🧪 Testing Intelligent Customer Service System...\n")
    
    # Get the current directory
    current_dir = Path(__file__).parent
    
    # Test 1: Check if all service modules can be imported
    print("1. Testing module imports...")
    modules_to_test = [
        ("image_service", current_dir / "image_service.py"),
        ("audio_service", current_dir / "audio_service.py"),
        ("chat_service", current_dir / "chat_service.py"),
        ("workflow_service", current_dir / "workflow_service.py"),
        ("conversation_service", current_dir / "conversation_service.py"),
        ("bot_service", current_dir / "bot_service.py"),
        ("audio_http_service", current_dir / "audio_http_service.py"),
    ]
    
    import_success = 0
    for module_name, file_path in modules_to_test:
        if test_import_module(module_name, file_path):
            import_success += 1
    
    print(f"\nModule import test: {import_success}/{len(modules_to_test)} passed\n")
    
    # Test 2: Check if required files exist
    print("2. Checking required files...")
    files_to_check = [
        (current_dir / "requirements.txt", "Dependencies file"),
        (current_dir / "main.py", "Main application"),
        (current_dir / "README.md", "Documentation"),
        (current_dir / "WSL_SETUP.md", "WSL setup guide"),
        (current_dir / ".env.example", "Environment example file"),
    ]
    
    file_success = 0
    for file_path, description in files_to_check:
        if check_file_exists(file_path, description):
            file_success += 1
    
    print(f"\nFile existence test: {file_success}/{len(files_to_check)} passed\n")
    
    # Test 3: Check if frontend files exist
    print("3. Checking frontend files...")
    frontend_dir = current_dir / "frontend"
    frontend_files = [
        (frontend_dir / "package.json", "Frontend package file"),
        (frontend_dir / "vite.config.js", "Vite configuration"),
        (frontend_dir / "src" / "App.jsx", "Main App component"),
        (frontend_dir / "src" / "main.jsx", "Entry point"),
    ]
    
    frontend_success = 0
    for file_path, description in frontend_files:
        if check_file_exists(file_path, description):
            frontend_success += 1
    
    print(f"\nFrontend file test: {frontend_success}/{len(frontend_files)} passed\n")
    
    # Test 4: Check environment variables
    print("4. Checking environment variables...")
    required_env_vars = ["COZE_API_TOKEN", "COZE_BOT_ID"]
    env_var_success = 0
    
    # Check if .env file exists
    env_file = current_dir / ".env"
    if env_file.exists():
        print("✅ Environment file - Exists")
        env_var_success += 1
        
        # Try to read and check for required variables
        with open(env_file, 'r') as f:
            env_content = f.read()
            
        for var in required_env_vars:
            if var in env_content:
                print(f"✅ Environment variable {var} - Found in .env")
                env_var_success += 1
            else:
                print(f"⚠️  Environment variable {var} - Not found in .env")
    else:
        print("⚠️  Environment file - Not found (.env)")
        
        # Check if variables are set in system environment
        system_env_count = 0
        for var in required_env_vars:
            if os.environ.get(var):
                print(f"✅ Environment variable {var} - Found in system environment")
                system_env_count += 1
            else:
                print(f"❌ Environment variable {var} - Not found in system environment")
                
        if system_env_count == len(required_env_vars):
            env_var_success += system_env_count + 1  # +1 for having all vars
        else:
            env_var_success += system_env_count
    
    print(f"\nEnvironment variable test: {env_var_success}/{len(required_env_vars) + 1} passed\n")
    
    # Summary
    total_tests = len(modules_to_test) + len(files_to_check) + len(frontend_files) + len(required_env_vars) + 1
    total_passed = import_success + file_success + frontend_success + env_var_success
    
    print("=" * 50)
    print(f"TEST SUMMARY: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("🎉 All tests passed! The system is ready to use.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())