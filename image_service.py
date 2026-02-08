import os
from pathlib import Path
from typing import Optional

from cozepy import (
    COZE_CN_BASE_URL,
    ChatEventType,
    Coze,
    Message,
    MessageObjectString,
    TokenAuth,
)
from .config import get_coze_api_base, get_coze_api_token, get_bot_id


class ImageService:
    """Service for handling image recognition and processing."""

    def __init__(self):
        """Initialize the image service with Coze client."""
        self.coze = Coze(
            auth=TokenAuth(token=get_coze_api_token()), 
            base_url=get_coze_api_base()
        )
        self.bot_id = get_bot_id()
        self.user_id = "customer_service_user"

    def process_image_with_question(self, image_path: str, question: str = "What's in this image?") -> str:
        """
        Process an image with a question and return the AI response.
        
        Args:
            image_path: Path to the image file
            question: Question to ask about the image
            
        Returns:
            Response from the AI model
        """
        # Upload the image file
        file = self.coze.files.upload(file=Path(image_path))
        
        # Create a chat with the image and question
        response_text = ""
        for event in self.coze.chat.stream(
            bot_id=self.bot_id,
            user_id=self.user_id,
            additional_messages=[
                Message.build_user_question_objects(
                    [
                        MessageObjectString.build_text(question),
                        MessageObjectString.build_image(file_id=file.id),
                    ]
                ),
            ],
        ):
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                response_text += event.message.content
                
        return response_text

    def describe_image(self, image_path: str) -> str:
        """
        Describe what's in an image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Description of the image from the AI model
        """
        return self.process_image_with_question(image_path, "Describe this image in detail.")

    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Extracted text from the image
        """
        return self.process_image_with_question(image_path, "Extract all text from this image.")