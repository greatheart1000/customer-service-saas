#!/usr/bin/env python3
"""
智能客服系统 - 支持图像识别和语音交互的客户服务平台

功能特性：
1. 图像识别 - 可分析图片内容并回答相关问题
2. 语音交互 - 支持语音输入和输出
3. 文本聊天 - 传统的文本对话模式
"""

import os
import sys
import time
from pathlib import Path

from .config import get_coze_api_token, get_bot_id
from .image_service import ImageService
from .audio_service import AudioService
from .advanced_audio_service import EnhancedAudioService, SimpleAudioChatService, OneToOneAudioChatService
from .workflow_service import WorkflowService
from .chat_service import ChatService
from .conversation_service import ConversationService
from .dataset_bot_service import DatasetBotService
from .audio_http_service import AudioHttpService


class CustomerServiceSystem:
    """Main customer service system class."""

    def __init__(self):
        """Initialize the customer service system."""
        print("Initializing Intelligent Customer Service System...")
        
        # Check required environment variables
        try:
            get_coze_api_token()
            get_bot_id()
        except ValueError as e:
            print(f"Error: {e}")
            print("Please set the required environment variables:")
            print("  COZE_API_TOKEN - Your Coze API token")
            print("  COZE_BOT_ID - Your customer service bot ID")
            sys.exit(1)
        
        # Initialize services
        self.image_service = ImageService()
        self.audio_service = AudioService()
        self.enhanced_audio_service = EnhancedAudioService()
        self.workflow_service = WorkflowService()
        self.chat_service = ChatService()
        self.conversation_service = ConversationService()
        self.dataset_bot_service = DatasetBotService()
        self.audio_http_service = AudioHttpService()
        
        print("Customer service system initialized successfully!")

    def show_menu(self):
        """Display the main menu."""
        print("\n" + "="*60)
        print("🤖 智能客服系统 - 多功能版")
        print("="*60)
        print("1.  🖼️  图像识别服务")
        print("2.  🎤  语音交互服务")
        print("3.  💬  文本聊天服务")
        print("4.  🔄  工作流服务")
        print("5.  📂  对话管理服务")
        print("6.  🤖  机器人管理服务")
        print("7.  🎵  音频HTTP服务")
        print("8.  ❓  帮助信息")
        print("9.  🚪  退出系统")
        print("="*60)

    def handle_image_service(self):
        """Handle image recognition service."""
        print("\n🖼️  图像识别服务")
        print("-" * 30)
        print("功能：")
        print("1. 描述图片内容")
        print("2. 提取图片中的文字")
        print("3. 自定义问题询问")
        
        choice = input("\n请选择功能 (1-3, 或按回车返回主菜单): ").strip()
        
        if not choice:
            return
            
        if choice not in ['1', '2', '3']:
            print("❌ 无效选择，请重新输入")
            return
            
        image_path = input("请输入图片路径: ").strip()
        if not image_path:
            print("❌ 图片路径不能为空")
            return
            
        if not os.path.exists(image_path):
            print("❌ 图片文件不存在")
            return
            
        print("\n🔄 正在处理图片，请稍候...")
        
        try:
            if choice == '1':
                result = self.image_service.describe_image(image_path)
                print("\n📋 图片描述结果:")
                print(result)
            elif choice == '2':
                result = self.image_service.extract_text_from_image(image_path)
                print("\n📝 图片文字提取结果:")
                print(result)
            elif choice == '3':
                question = input("请输入您的问题: ").strip()
                if not question:
                    print("❌ 问题不能为空")
                    return
                result = self.image_service.process_image_with_question(image_path, question)
                print("\n💬 回答:")
                print(result)
        except Exception as e:
            print(f"❌ 处理图片时出错: {e}")

    def handle_audio_service(self):
        """Handle audio interaction service."""
        print("\n🎤 语音交互服务")
        print("-" * 30)
        print("说明：")
        print("1. 系统将开始录音，您可以直接说话")
        print("2. 说完后按回车键结束录音")
        print("3. 系统会自动播放回复")
        
        input("\n按回车键开始录音...")
        
        print("🎙️  开始录音... (说话后按回车结束)")
        self.audio_service.start_recording()
        
        input("按回车键结束录音...")
        self.audio_service.stop_recording()
        
        print("🔄 正在处理语音，请稍候...")
        # Audio processing happens in the background
        time.sleep(3)  # Give some time for processing
        
        print("✅ 语音处理完成")

    def handle_text_service(self):
        """Handle text chat service."""
        print("\n💬 文本聊天服务")
        print("-" * 30)
        print("输入 'quit' 或 'exit' 返回主菜单")
        
        while True:
            user_input = input("\n👤 您: ").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() in ['quit', 'exit']:
                break
                
            try:
                # For simplicity, we'll use the image service's chat functionality
                # In a full implementation, we would have a dedicated text chat method
                print("🤖 客服: 抱歉，文本聊天功能需要额外实现。")
                print("   请使用环境变量和Coze API实现完整的文本对话功能。")
            except Exception as e:
                print(f"❌ 对话时出错: {e}")

    def show_help(self):
        """Display help information."""
        print("\n❓ 帮助信息")
        print("-" * 30)
        print("环境变量设置：")
        print("  COZE_API_TOKEN - 您的Coze API令牌")
        print("  COZE_BOT_ID - 您的客服机器人ID")
        print("  COZE_WORKSPACE_ID - 您的工作区ID (用于数据集和机器人功能)")
        print("  COZE_API_BASE - API基础URL (可选，默认为https://api.coze.cn)")
        print("\n使用说明：")
        print("1. 图像识别：支持分析图片内容、提取文字等")
        print("2. 语音交互：实时语音对话，支持语音输入和输出")
        print("3. 文本聊天：传统文本对话模式")
        print("4. 工作流：支持各种工作流操作")
        print("5. 对话管理：创建、管理和查看对话历史")
        print("6. 机器人管理：创建、更新和发布机器人")
        print("7. 音频HTTP：文本转语音功能")
        print("\n注意事项：")
        print("- 使用语音功能需要麦克风和扬声器")
        print("- 确保网络连接正常")
        print("- 图片格式支持常见的JPG/PNG等")
        print("- 某些功能需要相应权限和配置")

    def run(self):
        """Run the main application loop."""
        print("🚀 启动智能客服系统...")
        
        while True:
            try:
                self.show_menu()
                choice = input("\n请选择服务 (1-5): ").strip()
                
                if choice == '1':
                    self.handle_image_service()
                elif choice == '2':
                    self.handle_audio_service()
                elif choice == '3':
                    self.handle_text_service()
                elif choice == '4':
                    self.handle_workflow_service()
                elif choice == '5':
                    self.handle_conversation_service()
                elif choice == '6':
                    self.handle_bot_service()
                elif choice == '7':
                    self.handle_audio_http_service()
                elif choice == '8':
                    self.show_help()
                elif choice == '9':
                    print("👋 感谢使用智能客服系统，再见！")
                    break
                else:
                    print("❌ 无效选择，请输入 1-5 之间的数字")
                    
            except KeyboardInterrupt:
                print("\n\n👋 收到中断信号，正在退出...")
                break
            except Exception as e:
                print(f"❌ 程序运行出错: {e}")
        
        # Clean up resources
        self.audio_service.close()
        self.enhanced_audio_service.close()


def main():
    """Main entry point."""
    app = CustomerServiceSystem()
    app.run()


    def handle_workflow_service(self):
        """Handle workflow service."""
        print("\n🔄 工作流服务")
        print("-" * 30)
        print("功能：")
        print("1. 流式运行工作流")
        print("2. 非流式运行工作流")
        print("3. 异步运行工作流")
        print("4. 工作流聊天")
        print("5. 列出工作流版本")
        
        choice = input("\n请选择功能 (1-5, 或按回车返回主菜单): ").strip()
        
        if not choice:
            return
            
        try:
            if choice == '1':
                params_input = input("请输入工作流参数 (JSON格式, 或回车使用默认): ").strip()
                params = eval(params_input) if params_input else {}
                result = self.workflow_service.run_workflow_stream(params)
                print("\n工作流运行结果:")
                print(result)
            elif choice == '2':
                result = self.workflow_service.run_workflow_no_stream()
                print("\n工作流运行结果:")
                print(result)
            elif choice == '3':
                result = self.workflow_service.run_workflow_async()
                print("\n工作流运行结果:")
                print(result)
            elif choice == '4':
                user_input = input("请输入您的问题: ").strip()
                if user_input:
                    result = self.workflow_service.handle_workflow_chat_stream(user_input)
                    print("\n工作流聊天结果:")
                    print(result)
            elif choice == '5':
                versions = self.workflow_service.list_workflow_versions()
                print("\n工作流版本列表:")
                for version in versions:
                    print(f"版本: {version['version']}, 创建时间: {version['created_at']}, 状态: {version['status']}")
        except Exception as e:
            print(f"❌ 处理工作流时出错: {e}")

    def handle_conversation_service(self):
        """Handle conversation service."""
        print("\n📂 对话管理服务")
        print("-" * 30)
        print("功能：")
        print("1. 创建对话")
        print("2. 查看对话")
        print("3. 添加消息到对话")
        print("4. 列出对话")
        print("5. 清除对话")
        
        choice = input("\n请选择功能 (1-5, 或按回车返回主菜单): ").strip()
        
        if not choice:
            return
            
        try:
            if choice == '1':
                result = self.conversation_service.create_conversation()
                print("\n创建的对话:")
                print(result)
            elif choice == '2':
                conv_id = input("请输入对话ID: ").strip()
                if conv_id:
                    result = self.conversation_service.retrieve_conversation(conv_id)
                    print("\n对话详情:")
                    print(result)
            elif choice == '3':
                conv_id = input("请输入对话ID: ").strip()
                if conv_id:
                    role = input("请输入角色 (USER/ASSISTANT): ").strip() or "USER"
                    content = input("请输入消息内容: ").strip()
                    if content:
                        result = self.conversation_service.add_message_to_conversation(conv_id, role, content)
                        print("\n添加的消息:")
                        print(result)
            elif choice == '4':
                page_size = input("请输入每页数量 (默认10): ").strip()
                page_size = int(page_size) if page_size.isdigit() else 10
                result = self.conversation_service.list_conversations(page_size)
                print("\n对话列表:")
                for conv in result:
                    print(f"ID: {conv['id']}, 创建时间: {conv['created_at']}")
            elif choice == '5':
                conv_id = input("请输入要清除的对话ID: ").strip()
                if conv_id:
                    result = self.conversation_service.clear_conversation(conv_id)
                    print("\n清除结果:")
                    print(result)
        except Exception as e:
            print(f"❌ 处理对话时出错: {e}")

    def handle_bot_service(self):
        """Handle bot management service."""
        print("\n🤖 机器人管理服务")
        print("-" * 30)
        print("功能：")
        print("1. 创建机器人")
        print("2. 更新机器人")
        print("3. 发布机器人")
        print("4. 列出机器人")
        print("5. 测试已发布机器人")
        
        choice = input("\n请选择功能 (1-5, 或按回车返回主菜单): ").strip()
        
        if not choice:
            return
            
        try:
            if choice == '1':
                name = input("请输入机器人名称: ").strip()
                prompt = input("请输入系统提示: ").strip()
                if name and prompt:
                    result = self.dataset_bot_service.create_bot(name, prompt)
                    print("\n创建的机器人:")
                    print(result)
            elif choice == '2':
                bot_id = input("请输入机器人ID: ").strip()
                if bot_id:
                    name = input("请输入新名称 (可选): ").strip()
                    prompt = input("请输入新系统提示 (可选): ").strip()
                    result = self.dataset_bot_service.update_bot(bot_id, name if name else None, prompt if prompt else None)
                    print("\n更新结果:")
                    print(result)
            elif choice == '3':
                bot_id = input("请输入要发布的机器人ID: ").strip()
                if bot_id:
                    result = self.dataset_bot_service.publish_bot(bot_id)
                    print("\n发布结果:")
                    print(result)
            elif choice == '4':
                result = self.dataset_bot_service.list_bots()
                print("\n机器人列表:")
                for bot in result:
                    print(f"名称: {bot['name']}, ID: {bot['bot_id']}, 状态: {bot['status']}")
            elif choice == '5':
                bot_id = input("请输入要测试的机器人ID: ").strip()
                test_input = input("请输入测试消息: ").strip()
                if bot_id and test_input:
                    print("\n机器人回复:")
                    result = self.dataset_bot_service.test_published_bot(bot_id, test_input)
                    print("\n测试完成")
        except Exception as e:
            print(f"❌ 处理机器人时出错: {e}")

    def handle_audio_http_service(self):
        """Handle HTTP audio service."""
        print("\n🎵 音频HTTP服务")
        print("-" * 30)
        print("功能：")
        print("1. 列出可用声音")
        print("2. 文本转语音")
        print("3. 批量文本转语音")
        print("4. 创建语音预览")
        
        choice = input("\n请选择功能 (1-4, 或按回车返回主菜单): ").strip()
        
        if not choice:
            return
            
        try:
            if choice == '1':
                voices = self.audio_http_service.list_voices()
                print("\n可用声音列表:")
                for voice in voices:
                    print(f"ID: {voice['voice_id']}, 名称: {voice['name']}, 语言: {voice['language_name']}")
            elif choice == '2':
                text = input("请输入要转换的文本: ").strip()
                if text:
                    file_path = self.audio_http_service.create_speech_from_text(text)
                    print("\n生成的音频文件:")
                    print(file_path)
            elif choice == '3':
                texts_input = input("请输入多个文本，用分号分隔: ").strip()
                if texts_input:
                    texts = [t.strip() for t in texts_input.split(';')]
                    file_paths = self.audio_http_service.batch_create_speech(texts)
                    print("\n生成的音频文件列表:")
                    for path in file_paths:
                        print(path)
            elif choice == '4':
                text = input("请输入预览文本 (可选，回车使用默认): ").strip()
                file_path = self.audio_http_service.create_speech_preview(text if text else None)
                print("\n生成的预览音频文件:")
                print(file_path)
        except Exception as e:
            print(f"❌ 处理音频时出错: {e}")


if __name__ == "__main__":
    main()