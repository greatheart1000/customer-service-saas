import json
import logging
import os
import time
from typing import List, Optional

from cozepy import (
    COZE_CN_BASE_URL,
    ChatEvent,
    ChatEventType,
    ChatStatus,
    Coze,
    DeviceOAuthApp,
    Message,
    MessageContentType,
    Stream,
    TokenAuth,
    ToolOutput,
)


class ChatService:
    """Service for handling various chat operations."""

    def __init__(self):
        """Initialize the chat service."""
        self.coze = Coze(
            auth=TokenAuth(token=self._get_coze_api_token()),
            base_url=self._get_coze_api_base(),
        )

    def _get_coze_api_base(self) -> str:
        """Get the Coze API base URL."""
        coze_api_base = os.getenv("COZE_API_BASE")
        if coze_api_base:
            return coze_api_base
        return COZE_CN_BASE_URL  # default

    def _get_coze_api_token(self, workspace_id: Optional[str] = None) -> str:
        """Get an access_token through personal access token or oauth."""
        coze_api_token = os.getenv("COZE_API_TOKEN")
        if coze_api_token:
            return coze_api_token

        coze_api_base = self._get_coze_api_base()

        device_oauth_app = DeviceOAuthApp(
            client_id="57294420732781205987760324720643.app.coze", 
            base_url=coze_api_base
        )
        device_code = device_oauth_app.get_device_code(workspace_id)
        print(f"Please Open: {device_code.verification_url} to get the access token")
        return device_oauth_app.get_access_token(
            device_code=device_code.device_code, 
            poll=True
        ).access_token

    def get_bot_id(self) -> str:
        """Get the bot ID from environment variables."""
        bot_id = os.getenv("COZE_BOT_ID")
        if not bot_id:
            raise ValueError("COZE_BOT_ID environment variable is required")
        return bot_id

    def chat_stream(self, user_question: str, parameters: dict = None) -> str:
        """
        Chat with streaming response.
        
        Args:
            user_question: User's question
            parameters: Additional parameters
            
        Returns:
            Combined response from the chat
        """
        if parameters is None:
            parameters = json.loads(os.getenv("COZE_PARAMETERS") or "{}")
            
        bot_id = self.get_bot_id()
        user_id = "customer_service_user"
        
        response_text = ""
        is_first_reasoning_content = True
        is_first_content = True
        
        stream = self.coze.chat.stream(
            bot_id=bot_id,
            user_id=user_id,
            additional_messages=[
                Message.build_user_question_text(user_question),
            ],
            parameters=parameters,
        )
        
        print("Chat logid:", stream.response.logid)
        
        for event in stream:
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                if event.message.reasoning_content:
                    if is_first_reasoning_content:
                        is_first_reasoning_content = not is_first_reasoning_content
                        response_text += "----- reasoning_content start -----\n> "
                    response_text += event.message.reasoning_content
                    print(event.message.reasoning_content, end="", flush=True)
                else:
                    if is_first_content and not is_first_reasoning_content:
                        is_first_content = not is_first_content
                        response_text += "----- reasoning_content end -----\n"
                    response_text += event.message.content
                    print(event.message.content, end="", flush=True)

            if event.event == ChatEventType.CONVERSATION_CHAT_COMPLETED:
                response_text += f"\ntoken usage: {event.chat.usage.token_count}\n"
                print(f"\ntoken usage: {event.chat.usage.token_count}")

            if event.event == ChatEventType.CONVERSATION_CHAT_FAILED:
                error_msg = f"\nchat failed: {event.chat.last_error}\n"
                response_text += error_msg
                print(error_msg)
                break
                
        return response_text

    def chat_no_stream(self, user_questions: List[str], use_step_by_step: bool = False) -> str:
        """
        Chat without streaming response.
        
        Args:
            user_questions: List of user questions
            use_step_by_step: Whether to use step-by-step approach
            
        Returns:
            Combined response from the chat
        """
        bot_id = self.get_bot_id()
        user_id = "customer_service_user"
        
        # Build messages
        messages = []
        for i, question in enumerate(user_questions):
            if i % 2 == 0:
                messages.append(Message.build_user_question_text(question))
            else:
                messages.append(Message.build_assistant_answer(question))
        
        response_text = ""
        
        if use_step_by_step:
            # Call the coze.chat.create method to create a chat
            chat = self.coze.chat.create(
                bot_id=bot_id,
                user_id=user_id,
                additional_messages=messages,
            )

            # Poll the status of the chat
            start = int(time.time())
            timeout = 600
            while chat.status == ChatStatus.IN_PROGRESS:
                if int(time.time()) - start > timeout:
                    # Too long, cancel chat
                    self.coze.chat.cancel(conversation_id=chat.conversation_id, chat_id=chat.id)
                    break

                time.sleep(1)
                # Fetch the latest data
                chat = self.coze.chat.retrieve(conversation_id=chat.conversation_id, chat_id=chat.id)

            # Retrieve all messages
            messages = self.coze.chat.messages.list(conversation_id=chat.conversation_id, chat_id=chat.id)
            for message in messages:
                response_text += f"role={message.role}, content={message.content}\n"
                print(f"role={message.role}, content={message.content}")
        else:
            # Use create_and_poll to simplify the process
            chat_poll = self.coze.chat.create_and_poll(
                bot_id=bot_id,
                user_id=user_id,
                additional_messages=messages,
            )
            
            for message in chat_poll.messages:
                response_text += message.content
                print(message.content, end="", flush=True)

            if chat_poll.chat.status == ChatStatus.COMPLETED:
                usage_msg = f"\ntoken usage: {chat_poll.chat.usage.token_count}\n"
                response_text += usage_msg
                print(usage_msg)
                
        return response_text

    class LocalPluginMocker(object):
        """Mock local plugin implementations."""
        
        @staticmethod
        def get_schedule():
            return "I have two interviews in the afternoon."
            
        @staticmethod
        def screenshot():
            return "The background of my screen is a little dog running on the beach."
            
        @staticmethod
        def get_weather():
            return "The weather is sunny with a temperature of 25°C."
            
        @staticmethod
        def get_news():
            return "Today's top news: AI technology continues to advance rapidly."
            
        @staticmethod
        def get_function(name: str):
            return {
                "get_schedule": ChatService.LocalPluginMocker.get_schedule,
                "screenshot": ChatService.LocalPluginMocker.screenshot,
                "get_weather": ChatService.LocalPluginMocker.get_weather,
                "get_news": ChatService.LocalPluginMocker.get_news,
            }.get(name, lambda: "Function not implemented")

    def _handle_stream(self, stream: Stream[ChatEvent], response_collector: List[str]) -> str:
        """Handle chat stream events."""
        for event in stream:
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                response_collector.append(event.message.content)
                print(event.message.content, end="", flush=True)

            if event.event == ChatEventType.CONVERSATION_CHAT_REQUIRES_ACTION:
                if not event.chat.required_action or not event.chat.required_action.submit_tool_outputs:
                    continue
                tool_calls = event.chat.required_action.submit_tool_outputs.tool_calls
                tool_outputs: List[ToolOutput] = []
                for tool_call in tool_calls:
                    print(f"function call: {tool_call.function.name} {tool_call.function.arguments}")
                    local_function = self.LocalPluginMocker.get_function(tool_call.function.name)
                    output = json.dumps({"output": local_function()})
                    tool_outputs.append(ToolOutput(tool_call_id=tool_call.id, output=output))

                # Recursively handle the tool output submission
                self._handle_stream(
                    self.coze.chat.submit_tool_outputs(
                        conversation_id=event.chat.conversation_id,
                        chat_id=event.chat.id,
                        tool_outputs=tool_outputs,
                        stream=True,
                    ),
                    response_collector
                )

            if event.event == ChatEventType.CONVERSATION_CHAT_COMPLETED:
                usage_msg = f"\ntoken usage: {event.chat.usage.token_count}\n"
                response_collector.append(usage_msg)
                print(usage_msg)

    def chat_with_local_plugin(self, user_question: str) -> str:
        """
        Chat with local plugin support.
        
        Args:
            user_question: User's question that may trigger local plugins
            
        Returns:
            Response from the chat with local plugin execution
        """
        bot_id = self.get_bot_id()
        user_id = "customer_service_user"
        
        response_collector = []
        
        # Handle stream with local plugin support
        self._handle_stream(
            self.coze.chat.stream(
                bot_id=bot_id,
                user_id=user_id,
                additional_messages=[
                    Message.build_user_question_text(user_question),
                ],
            ),
            response_collector
        )
        
        return "".join(response_collector)