import os
from typing import Optional


def get_coze_api_base() -> str:
    """Get the Coze API base URL."""
    # The default access is api.coze.cn, but if you need to access api.coze.com,
    # please use base_url to configure the api endpoint to access
    coze_api_base = os.getenv("COZE_API_BASE")
    if coze_api_base:
        return coze_api_base
    return "https://api.coze.cn"  # default


def get_coze_api_token(workspace_id: Optional[str] = None) -> str:
    """Get an access_token through personal access token or oauth."""
    coze_api_token = os.getenv("COZE_API_TOKEN")
    if coze_api_token:
        return coze_api_token

    raise ValueError("COZE_API_TOKEN environment variable is required")


def get_bot_id() -> str:
    """Get the bot ID for the customer service."""
    bot_id = os.getenv("COZE_BOT_ID")
    if not bot_id:
        raise ValueError("COZE_BOT_ID environment variable is required")
    return bot_id


# Audio settings
AUDIO_SAMPLE_RATE = 24000
AUDIO_CHANNELS = 1
AUDIO_FORMAT = "pcm"
AUDIO_CHUNK_SIZE = 1024