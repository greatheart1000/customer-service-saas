#!/usr/bin/env python3
"""
Example usage script for the Intelligent Customer Service System
This script demonstrates how to use the system programmatically.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    print("🤖 Intelligent Customer Service System - Example Usage")
    print("=" * 55)
    
    # Check if environment variables are set
    api_token = os.environ.get("COZE_API_TOKEN")
    bot_id = os.environ.get("COZE_BOT_ID")
    
    if not api_token or not bot_id:
        print("⚠️  Warning: Required environment variables not set!")
        print("   Please set COZE_API_TOKEN and COZE_BOT_ID to test all functionality.")
        print("   Some features will be limited in this demo mode.")
        print()
    
    # Demonstrate importing services
    print("1. Importing services...")
    try:
        from image_service import ImageService
        from audio_service import AudioService
        from chat_service import ChatService
        from workflow_service import WorkflowService
        from conversation_service import ConversationService
        from bot_service import BotService
        from audio_http_service import AudioHTTPService
        
        print("✅ All services imported successfully!")
    except ImportError as e:
        print(f"❌ Failed to import services: {e}")
        return 1
    
    # Demonstrate service instantiation
    print("\n2. Instantiating services...")
    try:
        # Note: These will use mock functionality if environment variables are not set
        image_service = ImageService()
        audio_service = AudioService()
        chat_service = ChatService()
        workflow_service = WorkflowService()
        conversation_service = ConversationService()
        bot_service = BotService()
        audio_http_service = AudioHTTPService()
        
        print("✅ All services instantiated successfully!")
    except Exception as e:
        print(f"❌ Failed to instantiate services: {e}")
        return 1
    
    # Demonstrate basic functionality
    print("\n3. Demonstrating basic functionality...")
    
    # Image service example
    print("   - Image service: Ready to analyze images")
    
    # Audio service example
    print("   - Audio service: Ready for voice interactions")
    
    # Chat service example
    print("   - Chat service: Ready for text conversations")
    
    # Workflow service example
    print("   - Workflow service: Ready to execute workflows")
    
    # Conversation service example
    print("   - Conversation service: Ready to manage conversations")
    
    # Bot service example
    print("   - Bot service: Ready to manage bots")
    
    # Audio HTTP service example
    print("   - Audio HTTP service: Ready for text-to-speech")
    
    print("\n🎉 Example usage completed successfully!")
    print("\n📝 To use the full system:")
    print("   1. Set the required environment variables:")
    print("      export COZE_API_TOKEN=your_token")
    print("      export COZE_BOT_ID=your_bot_id")
    print("   2. Run the interactive system with: python main.py")
    print("   3. Or run the frontend with: npm run dev (in frontend directory)")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())