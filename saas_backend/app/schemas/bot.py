"""
机器人相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class BotBase(BaseModel):
    """机器人基础 Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    bot_id: str = Field(..., min_length=1, max_length=100)  # Coze bot ID
    avatar_url: Optional[str] = Field(None, max_length=500)
    welcome_message: Optional[str] = Field(None, max_length=1000)
    bot_settings: Optional[Dict[str, Any]] = None
    is_active: bool = True


class BotCreate(BotBase):
    """创建机器人 Schema"""
    pass


class BotUpdate(BaseModel):
    """更新机器人 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    bot_id: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    welcome_message: Optional[str] = Field(None, max_length=1000)
    bot_settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class BotInDB(BotBase):
    """数据库中的机器人 Schema"""
    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Bot(BotInDB):
    """返回给客户端的机器人 Schema"""
    pass


class BotListResponse(BaseModel):
    """机器人列表响应"""
    items: list[Bot]
    total: int
    page: int
    page_size: int
    has_more: bool


class BotTestRequest(BaseModel):
    """测试机器人请求"""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
