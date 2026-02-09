"""
消息模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Text

from app.db.base_class import Base


class Message(Base):
    """消息表"""
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    coze_message_id = Column(String(100), nullable=True)  # Coze 消息 ID

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Message {self.role}: {self.content[:50]}>"
