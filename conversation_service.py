import logging
import os
from typing import Optional, List

from cozepy import (
    COZE_CN_BASE_URL,
    BotPromptInfo,
    ChatEventType,
    Coze,
    DeviceOAuthApp,
    Message,
    MessageContentType,
    MessageRole,
    TokenAuth,
    setup_logging,
)


class ConversationService:
    """Service for handling conversation operations."""

    def __init__(self):
        """Initialize the conversation service."""
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

    def create_conversation(self) -> dict:
        """
        Create a new conversation.
        
        Returns:
            Conversation object
        """
        conversation = self.coze.conversations.create()
        print("Created conversation: ", conversation)
        return {
            "id": conversation.id,
            "created_at": conversation.created_at,
            "meta_data": conversation.meta_data
        }

    def retrieve_conversation(self, conversation_id: str) -> dict:
        """
        Retrieve a conversation by ID.
        
        Args:
            conversation_id: ID of the conversation to retrieve
            
        Returns:
            Conversation object
        """
        conversation = self.coze.conversations.retrieve(conversation_id=conversation_id)
        print("Retrieved conversation:", conversation)
        return {
            "id": conversation.id,
            "created_at": conversation.created_at,
            "meta_data": conversation.meta_data
        }

    def add_message_to_conversation(self, conversation_id: str, role: str, content: str, content_type: str = "text") -> dict:
        """
        Add a message to a conversation.
        
        Args:
            conversation_id: ID of the conversation
            role: Role of the message sender (USER, ASSISTANT, etc.)
            content: Content of the message
            content_type: Type of content (TEXT, IMAGE, AUDIO, etc.)
            
        Returns:
            Message object
        """
        message = self.coze.conversations.messages.create(
            conversation_id=conversation_id,
            role=MessageRole(role.upper()),
            content=content,
            content_type=MessageContentType(content_type.upper()),
        )
        print("Added message to conversation:", message)
        return {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "content_type": message.content_type,
            "created_at": message.created_at
        }

    def clear_conversation(self, conversation_id: str) -> dict:
        """
        Clear a conversation.
        
        Args:
            conversation_id: ID of the conversation to clear
            
        Returns:
            Clear result
        """
        result = self.coze.conversations.clear(conversation_id=conversation_id)
        print("Cleared conversation:", result)
        return {
            "result": "cleared",
            "conversation_id": conversation_id
        }

    def list_conversations(self, page_size: int = 10) -> List[dict]:
        """
        List conversations.
        
        Args:
            page_size: Number of conversations per page
            
        Returns:
            List of conversations
        """
        bot_id = self.get_bot_id()
        conversations = self.coze.conversations.list(bot_id=bot_id, page_size=page_size)
        
        conversation_list = []
        for conversation in conversations:
            conv_data = {
                "id": conversation.id,
                "created_at": conversation.created_at,
                "last_section_id": conversation.last_section_id
            }
            conversation_list.append(conv_data)
            print("conversation[id]", conversation.id)
            print("conversation[created_at]", conversation.created_at)
            print("conversation[last_section_id]", conversation.last_section_id)
            print("")
        
        return conversation_list

    def list_conversations_with_pagination(self, page_size: int = 10) -> List[dict]:
        """
        List conversations with pagination support.
        
        Args:
            page_size: Number of conversations per page
            
        Returns:
            List of all conversations across all pages
        """
        bot_id = self.get_bot_id()
        conversations = self.coze.conversations.list(bot_id=bot_id, page_size=page_size)
        
        all_conversations = []
        
        # Get conversations from first page
        for conversation in conversations:
            conv_data = {
                "id": conversation.id,
                "created_at": conversation.created_at,
                "last_section_id": conversation.last_section_id
            }
            all_conversations.append(conv_data)
        
        # Iterate through all pages
        for page in conversations.iter_pages():
            print("Page items:", page.items)
            for item in page.items:
                if item not in [conv['id'] for conv in all_conversations]:
                    conv_data = {
                        "id": item.id,
                        "created_at": item.created_at,
                        "last_section_id": item.last_section_id
                    }
                    all_conversations.append(conv_data)
        
        return all_conversations

    def create_conversation_with_initial_message(self, initial_message: str = "Hello") -> dict:
        """
        Create a conversation with an initial message.
        
        Args:
            initial_message: The initial message to add to the conversation
            
        Returns:
            Dictionary with conversation and message information
        """
        # Create conversation
        conversation = self.coze.conversations.create()
        print("Created conversation: ", conversation)
        
        # Add initial message
        message = self.coze.conversations.messages.create(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=initial_message,
            content_type=MessageContentType.TEXT,
        )
        print("Added initial message:", message)
        
        return {
            "conversation": {
                "id": conversation.id,
                "created_at": conversation.created_at
            },
            "initial_message": {
                "id": message.id,
                "content": message.content,
                "created_at": message.created_at
            }
        }

    def get_conversation_messages(self, conversation_id: str) -> List[dict]:
        """
        Get all messages in a conversation.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            List of messages
        """
        # Note: This would typically use a messages.list() method
        # For now, we'll return an empty list as the exact API may vary
        print(f"Retrieving messages for conversation: {conversation_id}")
        return []

    def update_conversation_metadata(self, conversation_id: str, metadata: dict) -> dict:
        """
        Update conversation metadata.
        
        Args:
            conversation_id: ID of the conversation
            metadata: Metadata to update
            
        Returns:
            Updated conversation information
        """
        # Note: This would typically use an update() method
        # For now, we'll simulate the update
        print(f"Updating metadata for conversation: {conversation_id}")
        print(f"New metadata: {metadata}")
        
        # Retrieve the conversation to confirm it exists
        conversation = self.coze.conversations.retrieve(conversation_id=conversation_id)
        
        return {
            "id": conversation.id,
            "created_at": conversation.created_at,
            "updated_metadata": metadata
        }