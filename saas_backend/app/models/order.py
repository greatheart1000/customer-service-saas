"""
订单模型
"""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, DateTime, String, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum


class OrderStatus(str, enum.Enum):
    """订单状态"""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    """支付方式"""
    WECHAT = "wechat"
    ALIPAY = "alipay"


class Order(Base):
    """订单表"""
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    order_no = Column(String(100), unique=True, nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="CNY")

    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=True)
    payment_no = Column(String(100), nullable=True)  # 第三方支付订单号

    plan_type = Column(String(50), nullable=True)  # 购买的计划类型
    billing_cycle = Column(String(20), nullable=True)  # 计费周期

    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="orders")
    user = relationship("User", back_populates="orders")

    def __repr__(self):
        return f"<Order {self.order_no}:{self.status}>"
