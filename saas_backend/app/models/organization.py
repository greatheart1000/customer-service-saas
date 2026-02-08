"""
组织模型
"""
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum


class PlanType(str, enum.Enum):
    """订阅计划类型"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class Organization(Base):
    """组织表"""
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    plan_type = Column(SQLEnum(PlanType), default=PlanType.FREE)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    owner = relationship("User", back_populates="owned_organizations", foreign_keys=[owner_id])
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="organization", cascade="all, delete-orphan")
    bots = relationship("Bot", back_populates="organization", cascade="all, delete-orphan")
    usage_records = relationship("UsageRecord", back_populates="organization")
    orders = relationship("Order", back_populates="organization")
    api_keys = relationship("APIKey", back_populates="organization")

    def __repr__(self):
        return f"<Organization {self.name}>"
