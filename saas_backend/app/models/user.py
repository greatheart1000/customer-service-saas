"""
用户模型
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    username = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    wechat_openid = Column(String(100), unique=True, nullable=True, index=True)
    wechat_unionid = Column(String(100), unique=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    owned_organizations = relationship("Organization", back_populates="owner", foreign_keys="Organization.owner_id")
    organization_memberships = relationship("OrganizationMember", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    usage_records = relationship("UsageRecord", back_populates="user")
    orders = relationship("Order", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>"
