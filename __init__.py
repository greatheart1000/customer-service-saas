"""智能客服系统 - 支持图像识别和语音交互的客户服务平台"""

__version__ = "1.0.0"
__author__ = "Coze Developer"

from .main import CustomerServiceSystem
from .image_service import ImageService
from .audio_service import AudioService
from .config import get_coze_api_token, get_bot_id, get_coze_api_base

__all__ = [
    "CustomerServiceSystem",
    "ImageService", 
    "AudioService",
    "get_coze_api_token",
    "get_bot_id",
    "get_coze_api_base"
]