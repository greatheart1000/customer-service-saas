"""
订阅模型
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum


class SubscriptionStatus(str, enum.Enum):
    """订阅状态"""
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"


class BillingCycle(str, enum.Enum):
    """计费周期"""
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Subscription(Base):
    """订阅表"""
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    plan_type = Column(String(50), nullable=False)  # free, pro, enterprise
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    billing_cycle = Column(SQLEnum(BillingCycle), default=BillingCycle.MONTHLY)

    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="subscriptions")

    def __repr__(self):
        return f"<Subscription {self.organization_id}:{self.plan_type}>"
