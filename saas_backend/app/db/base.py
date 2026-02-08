"""
数据库基础类
"""
from typing import Type

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


def get_model_classes() -> dict[str, Type]:
    """获取所有模型类"""
    from app.models.user import User
    from app.models.organization import Organization
    from app.models.organization_member import OrganizationMember
    from app.models.subscription import Subscription
    from app.models.usage import UsageRecord
    from app.models.order import Order
    from app.models.bot import Bot
    from app.models.conversation import Conversation
    from app.models.apikey import APIKey

    return {
        "users": User,
        "organizations": Organization,
        "organization_members": OrganizationMember,
        "subscriptions": Subscription,
        "usage_records": UsageRecord,
        "orders": Order,
        "bots": Bot,
        "conversations": Conversation,
        "api_keys": APIKey,
    }
