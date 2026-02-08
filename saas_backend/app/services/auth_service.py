"""
认证服务
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.user import User
from app.models.organization import Organization, PlanType
from app.models.organization_member import OrganizationMember, MemberRole
from app.schemas.user import UserCreate, UserRegister, Token
from app.schemas.organization import OrganizationCreate
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)


class AuthService:
    """认证服务类"""

    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_in: UserRegister) -> User:
        """
        用户注册
        """
        # 检查邮箱是否已存在
        existing_user = self.db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise ValueError("Email already registered")

        # 创建用户
        user = User(
            email=user_in.email,
            username=user_in.username,
            password_hash=get_password_hash(user_in.password),
            is_active=True,
            is_verified=False,  # 需要邮箱验证
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # 创建默认组织
        org_name = f"{user.username or user.email.split('@')[0]}'s Organization"
        organization = Organization(
            name=org_name,
            owner_id=user.id,
            plan_type=PlanType.FREE,
        )

        self.db.add(organization)
        self.db.commit()
        self.db.refresh(organization)

        # 添加用户为组织所有者
        member = OrganizationMember(
            organization_id=organization.id,
            user_id=user.id,
            role=MemberRole.OWNER,
        )

        self.db.add(member)
        self.db.commit()

        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        验证用户邮箱和密码
        """
        user = self.db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not user.password_hash:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    def login(self, email: str, password: str) -> Token:
        """
        用户登录
        """
        user = self.authenticate_user(email, password)

        if not user:
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User account is inactive")

        # 创建 Token
        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60,  # 30 分钟
        )

    def refresh_token(self, refresh_token: str) -> Token:
        """
        刷新 Token
        """
        from app.core.security import decode_token

        payload = decode_token(refresh_token)
        if payload is None:
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid refresh token")

        token_type = payload.get("type")
        if token_type != "refresh":
            raise ValueError("Invalid token type")

        # 验证用户是否存在
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")

        # 创建新的 Token
        access_token = create_access_token(str(user.id))
        new_refresh_token = create_refresh_token(str(user.id))

        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=30 * 60,
        )

    def change_password(self, user: User, old_password: str, new_password: str) -> bool:
        """
        修改密码
        """
        if not user.password_hash:
            raise ValueError("User has no password set")

        if not verify_password(old_password, user.password_hash):
            raise ValueError("Incorrect password")

        user.password_hash = get_password_hash(new_password)
        self.db.commit()

        return True
