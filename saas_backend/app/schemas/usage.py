"""
使用量相关的 Pydantic Schemas
"""
from datetime import datetime, date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UsageRecordBase(BaseModel):
    """使用量基础 Schema"""
    resource_type: str
    quantity: int = 1


class UsageRecordCreate(UsageRecordBase):
    """创建使用量记录 Schema"""
    organization_id: UUID
    user_id: UUID


class UsageRecordInDB(BaseModel):
    """数据库中的使用量记录 Schema"""
    id: UUID
    organization_id: UUID
    user_id: UUID
    resource_type: str
    quantity: int
    date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsageRecord(UsageRecordInDB):
    """返回给客户端的使用量记录 Schema"""
    pass


class UsageStats(BaseModel):
    """使用量统计 Schema"""
    organization_id: UUID
    period_start: date
    period_end: date

    # 当前使用量
    messages_used: int
    api_calls_used: int
    storage_used_mb: int

    # 限制
    messages_limit: int
    api_calls_limit: int
    storage_limit_mb: int

    # 百分比
    messages_percentage: float
    api_calls_percentage: float
    storage_percentage: float

    # 是否超出限制
    is_over_limit: bool


class UsageHistory(BaseModel):
    """使用量历史 Schema"""
    date: date
    messages: int
    api_calls: int
    storage_mb: int
