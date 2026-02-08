#!/usr/bin/env python3
"""
WSL Compatibility Test Script
This script verifies that the system can run properly in WSL environment.
"""

import os
import sys
import platform
import subprocess

def check_wsl():
    """Check if we're running in WSL."""
    # Method 1: Check kernel release
    uname = platform.uname()
    if 'microsoft' in uname.release.lower():
        return True, "WSL2 detected via kernel release"
    
    # Method 2: Check /proc/version
    try:
        with open('/proc/version', 'r') as f:
            content = f.read().lower()
            if 'microsoft' in content:
                return True, "WSL detected via /proc/version"
    except:
        pass
    
    # Method 3: Check environment variables
    if 'WSL_DISTRO_NAME' in os.environ:
        return True, "WSL detected via WSL_DISTRO_NAME environment variable"
    
    return False, "Not running in WSL"

def check_python():
    """Check Python version."""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        return True, f"Python {version.major}.{version.minor}.{version.micro} - OK"
    else:
        return False, f"Python {version.major}.{version.minor}.{version.micro} - Version too old (need 3.8+)"

def check_dependencies():
    """Check if required Python packages are installed."""
    required_packages = [
        'cozepy',
        'pyaudio',
        'requests',
        'websocket-client'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        return False, f"Missing packages: {', '.join(missing_packages)}"
    else:
        return True, "All required packages installed"

def check_audio_support():
    """Check if audio support is available."""
    try:
        import pyaudio
        pa = pyaudio.PyAudio()
        device_count = pa.get_device_count()
        pa.terminate()
        return True, f"Audio support available ({device_count} devices)"
    except Exception as e:
        return False, f"Audio support not available: {str(e)}"

def check_network():
    """Check network connectivity."""
    try:
        import requests
        response = requests.get("https://api.coze.cn", timeout=5)
        return True, "Network connectivity to Coze API - OK"
    except Exception as e:
        return False, f"Network connectivity issue: {str(e)}"

def main():
    print("🐧 WSL Compatibility Test for Intelligent Customer Service System")
    print("=" * 65)
    
    # Check WSL environment
    is_wsl, wsl_msg = check_wsl()
    print(f"🖥️  WSL Environment: {wsl_msg}")
    
    # Check Python version
    python_ok, python_msg = check_python()
    print(f"🐍 Python Version: {python_msg}")
    
    # Check dependencies
    deps_ok, deps_msg = check_dependencies()
    print(f"📦 Dependencies: {deps_msg}")
    
    # Check audio support
    audio_ok, audio_msg = check_audio_support()
    print(f"🔊 Audio Support: {audio_msg}")
    
    # Check network
    network_ok, network_msg = check_network()
    print(f"🌐 Network: {network_msg}")
    
    # Summary
    print("\n" + "=" * 65)
    all_checks = [
        ("WSL Environment", is_wsl, wsl_msg),
        ("Python Version", python_ok, python_msg),
        ("Dependencies", deps_ok, deps_msg),
        ("Audio Support", audio_ok, audio_msg),
        ("Network", network_ok, network_msg)
    ]
    
    passed = sum(1 for _, ok, _ in all_checks if ok)
    total = len(all_checks)
    
    print(f"SUMMARY: {passed}/{total} checks passed")
    
    if passed == total:
        print("✅ All checks passed! The system should work properly in WSL.")
        return 0
    else:
        print("⚠️  Some checks failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())