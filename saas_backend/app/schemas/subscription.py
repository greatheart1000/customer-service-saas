"""
订阅相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class SubscriptionBase(BaseModel):
    """订阅基础 Schema"""
    plan_type: str = Field(..., pattern="^(free|pro|enterprise)$")
    billing_cycle: str = Field(default="monthly", pattern="^(monthly|yearly)$")


class SubscriptionCreate(SubscriptionBase):
    """创建订阅 Schema"""
    organization_id: UUID


class SubscriptionUpdate(BaseModel):
    """更新订阅 Schema"""
    plan_type: Optional[str] = Field(None, pattern="^(free|pro|enterprise)$")
    billing_cycle: Optional[str] = Field(None, pattern="^(monthly|yearly)$")
    cancel_at_period_end: Optional[bool] = None


class SubscriptionInDB(BaseModel):
    """数据库中的订阅 Schema"""
    id: UUID
    organization_id: UUID
    plan_type: str
    status: str
    billing_cycle: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Subscription(SubscriptionInDB):
    """返回给客户端的订阅 Schema"""
    pass


class SubscriptionPlan(BaseModel):
    """订阅计划详情 Schema"""
    plan_type: str
    name: str
    price_monthly: int
    price_yearly: int
    currency: str = "CNY"
    features: list[str]
    limits: dict


# 订阅计划配置
SUBSCRIPTION_PLANS = {
    "free": SubscriptionPlan(
        plan_type="free",
        name="免费版",
        price_monthly=0,
        price_yearly=0,
        features=[
            "1000 条消息/月",
            "1 个机器人",
            "基础客服功能",
            "社区支持",
        ],
        limits={
            "messages_per_month": 1000,
            "bots": 1,
            "members": 1,
            "storage_mb": 100,
        }
    ),
    "pro": SubscriptionPlan(
        plan_type="pro",
        name="专业版",
        price_monthly=199,
        price_yearly=1990,
        features=[
            "50,000 条消息/月",
            "10 个机器人",
            "图像识别 + 语音交互",
            "优先支持",
            "自定义品牌",
            "数据分析",
        ],
        limits={
            "messages_per_month": 50000,
            "bots": 10,
            "members": 20,
            "storage_mb": 10000,
        }
    ),
    "enterprise": SubscriptionPlan(
        plan_type="enterprise",
        name="企业版",
        price_monthly=999,
        price_yearly=9990,
        features=[
            "无限消息",
            "无限机器人",
            "全部功能",
            "专属支持",
            "SLA 保证",
            "私有化部署选项",
            "专属客户经理",
        ],
        limits={
            "messages_per_month": -1,  # -1 表示无限
            "bots": -1,
            "members": -1,
            "storage_mb": -1,
        }
    ),
}
