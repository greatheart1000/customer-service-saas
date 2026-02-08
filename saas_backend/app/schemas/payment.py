"""
支付相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal


class PaymentBase(BaseModel):
    """支付基础 Schema"""
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    plan_type: str = Field(..., pattern="^(pro|enterprise)$")
    billing_cycle: str = Field(..., pattern="^(monthly|yearly)$")


class WechatPayCreate(PaymentBase):
    """创建微信支付订单 Schema"""
    pass


class AlipayCreate(PaymentBase):
    """创建支付宝支付订单 Schema"""
    pass


class PaymentResponse(BaseModel):
    """支付响应 Schema"""
    order_id: UUID
    order_no: str
    amount: Decimal
    currency: str
    payment_method: str
    payment_url: Optional[str] = None
    qr_code: Optional[str] = None


class PaymentCallback(BaseModel):
    """支付回调 Schema"""
    # 微信支付回调字段
    return_code: Optional[str] = None
    result_code: Optional[str] = None
    out_trade_no: Optional[str] = None
    transaction_id: Optional[str] = None

    # 支付宝回调字段
    trade_status: Optional[str] = None
    out_order_no: Optional[str] = None
    trade_no: Optional[str] = None


class OrderInDB(BaseModel):
    """数据库中的订单 Schema"""
    id: UUID
    organization_id: UUID
    user_id: UUID
    order_no: str
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str] = None
    payment_no: Optional[str] = None
    plan_type: Optional[str] = None
    billing_cycle: Optional[str] = None
    created_at: datetime
    paid_at: Optional[datetime] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Order(OrderInDB):
    """返回给客户端的订单 Schema"""
    pass
