import logging
import os
import sys
from pathlib import Path
from typing import Optional

from cozepy import (
    COZE_CN_BASE_URL,
    BotPromptInfo,
    ChatEventType,
    Coze,
    CreateDatasetResp,
    DeviceOAuthApp,
    DocumentFormatType,
    Message,
    MessageContentType,
    TokenAuth,
    setup_logging,
)


class DatasetBotService:
    """Service for handling dataset and bot management operations."""

    def __init__(self):
        """Initialize the dataset and bot service."""
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

    def get_workspace_id(self) -> str:
        """Get the workspace ID from environment variables."""
        workspace_id = os.getenv("COZE_WORKSPACE_ID")
        if not workspace_id:
            raise ValueError("COZE_WORKSPACE_ID environment variable is required")
        return workspace_id

    def create_dataset(self, name: str, format_type: str = "document") -> dict:
        """
        Create a new dataset.
        
        Args:
            name: Name of the dataset
            format_type: Format type of the dataset (DOCUMENT, TEXT, QA, etc.)
            
        Returns:
            Dataset creation result
        """
        workspace_id = self.get_workspace_id()
        
        # Map format type string to enum
        format_type_enum = {
            "document": DocumentFormatType.DOCUMENT,
            "text": DocumentFormatType.TEXT,
            "qa": DocumentFormatType.QA
        }.get(format_type.lower(), DocumentFormatType.DOCUMENT)
        
        res = self.coze.datasets.create(
            name=name,
            space_id=workspace_id,
            format_type=format_type_enum,
        )
        
        print(f"Created dataset: {res.dataset_id}")
        return {
            "dataset_id": res.dataset_id,
            "name": name,
            "format_type": format_type,
            "workspace_id": workspace_id
        }

    def create_bot(self, name: str, prompt: str, avatar_path: str = None) -> dict:
        """
        Create a new bot.
        
        Args:
            name: Name of the bot
            prompt: System prompt for the bot
            avatar_path: Path to the avatar image file (optional)
            
        Returns:
            Bot creation result
        """
        workspace_id = self.get_workspace_id()
        
        # Upload avatar if provided
        icon_file_id = None
        if avatar_path and os.path.exists(avatar_path):
            avatar = self.coze.files.upload(file=Path(avatar_path))
            icon_file_id = avatar.id
            print(f"Uploaded avatar with ID: {icon_file_id}")
        
        # Create the bot
        bot = self.coze.bots.create(
            space_id=workspace_id,
            name=name,
            icon_file_id=icon_file_id,
            prompt_info=BotPromptInfo(prompt=prompt),
        )
        
        print(f"Created bot with ID: {bot.bot_id}")
        return {
            "bot_id": bot.bot_id,
            "name": name,
            "prompt": prompt,
            "workspace_id": workspace_id,
            "avatar_file_id": icon_file_id
        }

    def update_bot(self, bot_id: str, name: str = None, prompt: str = None, avatar_path: str = None) -> dict:
        """
        Update an existing bot.
        
        Args:
            bot_id: ID of the bot to update
            name: New name for the bot (optional)
            prompt: New system prompt for the bot (optional)
            avatar_path: Path to new avatar image file (optional)
            
        Returns:
            Bot update result
        """
        # Upload new avatar if provided
        icon_file_id = None
        if avatar_path and os.path.exists(avatar_path):
            avatar = self.coze.files.upload(file=Path(avatar_path))
            icon_file_id = avatar.id
            print(f"Uploaded new avatar with ID: {icon_file_id}")
        
        # Prepare update parameters
        update_params = {}
        if name:
            update_params["name"] = name
        if prompt:
            update_params["prompt_info"] = BotPromptInfo(prompt=prompt)
        if icon_file_id:
            update_params["icon_file_id"] = icon_file_id
            
        # Update the bot
        self.coze.bots.update(bot_id=bot_id, **update_params)
        
        print(f"Updated bot with ID: {bot_id}")
        return {
            "bot_id": bot_id,
            "updated_fields": list(update_params.keys())
        }

    def publish_bot(self, bot_id: str, connector_ids: list = None) -> dict:
        """
        Publish a bot.
        
        Args:
            bot_id: ID of the bot to publish
            connector_ids: List of connector IDs to publish to (optional)
            
        Returns:
            Bot publish result
        """
        if connector_ids:
            self.coze.bots.publish(bot_id=bot_id, connector_ids=connector_ids)
        else:
            self.coze.bots.publish(bot_id=bot_id)
        
        print(f"Published bot with ID: {bot_id}")
        return {
            "bot_id": bot_id,
            "status": "published",
            "connector_ids": connector_ids or []
        }

    def unpublish_bot(self, bot_id: str) -> dict:
        """
        Unpublish a bot.
        
        Args:
            bot_id: ID of the bot to unpublish
            
        Returns:
            Bot unpublish result
        """
        self.coze.bots.unpublish(bot_id=bot_id)
        
        print(f"Unpublished bot with ID: {bot_id}")
        return {
            "bot_id": bot_id,
            "status": "unpublished"
        }

    def test_published_bot(self, bot_id: str, test_input: str) -> str:
        """
        Test a published bot with a sample input.
        
        Args:
            bot_id: ID of the published bot
            test_input: Test input message
            
        Returns:
            Bot response
        """
        response_text = ""
        
        # Call the coze.chat.stream method to create a chat
        for event in self.coze.chat.stream(
            bot_id=bot_id,
            user_id="customer_service_test_user",
            additional_messages=[Message.build_user_question_text(test_input)],
        ):
            if (
                event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA
                and event.message.content_type == MessageContentType.TEXT
            ):
                response_text += event.message.content
                print(event.message.content, end="")
        
        return response_text

    def list_bots(self, page_size: int = 20) -> list:
        """
        List all bots in the workspace.
        
        Args:
            page_size: Number of bots per page
            
        Returns:
            List of bots
        """
        workspace_id = self.get_workspace_id()
        bots = self.coze.bots.list(space_id=workspace_id, page_size=page_size)
        
        bot_list = []
        for bot in bots:
            bot_data = {
                "bot_id": bot.bot_id,
                "name": bot.name,
                "description": bot.description,
                "status": bot.status,
                "created_at": bot.created_at
            }
            bot_list.append(bot_data)
            print(f"Bot: {bot.name} (ID: {bot.bot_id}) - Status: {bot.status}")
        
        return bot_list

    def retrieve_bot(self, bot_id: str) -> dict:
        """
        Retrieve details of a specific bot.
        
        Args:
            bot_id: ID of the bot to retrieve
            
        Returns:
            Bot details
        """
        bot = self.coze.bots.retrieve(bot_id=bot_id)
        
        bot_details = {
            "bot_id": bot.bot_id,
            "name": bot.name,
            "description": bot.description,
            "status": bot.status,
            "created_at": bot.created_at,
            "icon_file_id": bot.icon_file_id,
            "version": bot.version
        }
        
        print(f"Retrieved bot: {bot.name} (ID: {bot.bot_id})")
        return bot_details

    def delete_bot(self, bot_id: str) -> dict:
        """
        Delete a bot.
        
        Args:
            bot_id: ID of the bot to delete
            
        Returns:
            Deletion result
        """
        self.coze.bots.delete(bot_id=bot_id)
        
        print(f"Deleted bot with ID: {bot_id}")
        return {
            "bot_id": bot_id,
            "status": "deleted"
        }