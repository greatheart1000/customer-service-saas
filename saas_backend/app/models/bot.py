"""
机器人模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Bot(Base):
    """机器人配置表"""
    __tablename__ = "bots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    bot_id = Column(String(100), nullable=False)  # Coze bot ID
    avatar_url = Column(String(500), nullable=True)
    welcome_message = Column(String(1000), nullable=True)

    bot_settings = Column(JSON, nullable=True)  # 机器人配置（JSON 格式）
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="bots")
    conversations = relationship("Conversation", back_populates="bot", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Bot {self.name}:{self.bot_id}>"
