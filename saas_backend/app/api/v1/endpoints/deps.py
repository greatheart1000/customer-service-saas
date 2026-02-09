"""
FastAPI 依赖注入
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.organization import Organization


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    获取当前登录用户
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 解码 Token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    token_type: str = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # 查询用户
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前活跃用户
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


async def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Organization:
    """
    获取当前用户的租户（组织）
    - 从用户信息中获取所属组织
    - 用于客服/运营人员登录后的租户隔离
    """
    # 检查用户是否属于某个组织
    from app.models.organization_member import OrganizationMember

    membership = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any organization"
        )

    organization = db.query(Organization).filter(
        Organization.id == membership.organization_id
    ).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    if not organization.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization is not active"
        )

    return organization


async def get_tenant_from_uuid(
    tenant_uuid: str,
    db: Session = Depends(get_db)
) -> Organization:
    """
    通过 UUID 获取租户（组织）
    - 用于终端用户通过域名+UUID访问时
    - 从路径参数中解析租户UUID
    """
    organization = db.query(Organization).filter(
        Organization.id == tenant_uuid
    ).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant with UUID {tenant_uuid} not found"
        )

    if not organization.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant is not active"
        )

    return organization


async def require_org_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    要求用户必须是组织管理员
    """
    if not current_user.is_org_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an organization admin"
        )
    return current_user


async def require_platform_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    要求用户必须是平台管理员
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a platform admin"
        )
    return current_user
