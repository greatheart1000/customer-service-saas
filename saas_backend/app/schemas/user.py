"""
用户相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """用户基础 Schema"""
    email: EmailStr
    username: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    """创建用户 Schema"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """更新用户 Schema"""
    username: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    """数据库中的用户 Schema"""
    id: UUID
    is_active: bool
    is_verified: bool
    is_admin: bool = False  # 平台管理员
    is_org_admin: bool = False  # 组织管理员
    avatar_url: Optional[str] = None
    wechat_openid: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class User(UserInDB):
    """返回给客户端的用户 Schema"""
    pass


class UserLogin(BaseModel):
    """用户登录 Schema"""
    email: EmailStr
    password: str


class UserRegister(UserCreate):
    """用户注册 Schema"""
    pass


class Token(BaseModel):
    """Token 响应 Schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """Token 载荷 Schema"""
    sub: str  # user_id
    exp: Optional[int] = None
    type: str  # access 或 refresh
