"""
对话模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Conversation(Base):
    """对话历史表"""
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    bot_id = Column(String(36), ForeignKey("bots.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    conversation_id = Column(String(100), nullable=True)  # Coze conversation ID
    title = Column(String(500), nullable=True)
    message_count = Column(Integer, default=0)

    extra_data = Column(JSON, nullable=True)  # 额外的元数据

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    bot = relationship("Bot", back_populates="conversations")
    user = relationship("User", back_populates="conversations")

    def __repr__(self):
        return f"<Conversation {self.conversation_id}>"
