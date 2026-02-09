"""
对话相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class ConversationBase(BaseModel):
    """对话基础 Schema"""
    title: Optional[str] = Field(None, max_length=500)


class ConversationCreate(ConversationBase):
    """创建对话 Schema"""
    bot_id: str = Field(..., min_length=1)
    title: Optional[str] = Field(None, max_length=500)


class ConversationUpdate(BaseModel):
    """更新对话 Schema"""
    title: Optional[str] = Field(None, max_length=500)


class ConversationInDB(ConversationBase):
    """数据库中的对话 Schema"""
    id: str
    organization_id: str
    bot_id: str
    user_id: str
    conversation_id: Optional[str] = None  # Coze conversation ID
    message_count: int
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Conversation(ConversationInDB):
    """返回给客户端的对话 Schema"""
    pass


class ConversationListResponse(BaseModel):
    """对话列表响应"""
    items: list[Conversation]
    total: int
    page: int
    page_size: int
    has_more: bool


class MessageRole:
    """消息角色"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageBase(BaseModel):
    """消息基础 Schema"""
    content: str = Field(..., min_length=1, max_length=10000)
    role: str = Field(..., pattern="^(user|assistant|system)$")


class MessageCreate(MessageBase):
    """创建消息 Schema"""
    conversation_id: str = Field(..., min_length=1)


class MessageInDB(MessageBase):
    """数据库中的消息 Schema"""
    id: str
    conversation_id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Message(MessageInDB):
    """返回给客户端的消息 Schema"""
    pass


class ChatRequest(BaseModel):
    """聊天请求 Schema"""
    bot_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    """聊天响应 Schema"""
    message_id: str
    conversation_id: str
    content: str
    role: str
    created_at: datetime


class ChatStreamChunk(BaseModel):
    """流式聊天响应块"""
    type: str  # 'message', 'error', 'done'
    content: Optional[str] = None
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    error: Optional[str] = None
