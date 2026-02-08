"""
组织相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from app.models.organization import PlanType


class OrganizationBase(BaseModel):
    """组织基础 Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    logo_url: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    """创建组织 Schema"""
    pass


class OrganizationUpdate(BaseModel):
    """更新组织 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    logo_url: Optional[str] = None


class OrganizationInDB(OrganizationBase):
    """数据库中的组织 Schema"""
    id: UUID
    owner_id: UUID
    plan_type: PlanType
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Organization(OrganizationInDB):
    """返回给客户端的组织 Schema"""
    pass


class OrganizationMemberRole(BaseModel):
    """组织成员角色更新 Schema"""
    role: str = Field(..., pattern="^(owner|admin|member|viewer)$")


class OrganizationMemberInvite(BaseModel):
    """邀请成员 Schema"""
    email: str
    role: str = Field(default="member", pattern="^(admin|member|viewer)$")


class OrganizationMemberInDB(BaseModel):
    """组织成员 Schema"""
    id: UUID
    organization_id: UUID
    user_id: UUID
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationWithMembers(Organization):
    """包含成员的组织 Schema"""
    members: List[OrganizationMemberInDB] = []
