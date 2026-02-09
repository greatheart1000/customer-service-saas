"""
管理端相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import User


class DashboardStats(BaseModel):
    """仪表板统计数据"""
    total_users: int = 0
    active_users: int = 0
    total_conversations: int = 0
    total_messages: int = 0
    total_bots: int = 0
    total_organizations: int = 0
    revenue_month: float = 0
    revenue_total: float = 0


class UserListResponse(BaseModel):
    """用户列表响应"""
    items: List[User]
    total: int
    page: int
    page_size: int
    has_more: bool


class UserUpdateByAdmin(BaseModel):
    """管理员更新用户 Schema"""
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None
    is_org_admin: Optional[bool] = None
    username: Optional[str] = Field(None, min_length=1, max_length=100)


class SystemSettings(BaseModel):
    """系统设置 Schema"""
    site_name: str = "智能客服系统"
    site_description: Optional[str] = None
    allow_registration: bool = True
    max_free_conversations_per_day: int = 100
    max_organization_members_free: int = 5


class SystemSettingsUpdate(BaseModel):
    """系统设置更新 Schema"""
    site_name: Optional[str] = Field(None, min_length=1, max_length=100)
    site_description: Optional[str] = None
    allow_registration: Optional[bool] = None
    max_free_conversations_per_day: Optional[int] = Field(None, ge=1)
    max_organization_members_free: Optional[int] = Field(None, ge=1)
