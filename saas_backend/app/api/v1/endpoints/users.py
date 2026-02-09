"""
用户管理 API 端点（管理端）
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.rbac import require_platform_admin, require_org_admin, check_permission
from app.schemas.admin import UserListResponse, UserUpdateByAdmin
from app.schemas.user import User
from app.models.user import User as UserModel
from app.models.organization_member import OrganizationMember

# 配置日志
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=UserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    search: Optional[str] = None,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取用户列表（仅平台管理员）
    """
    query = db.query(UserModel)

    if is_active is not None:
        query = query.filter(UserModel.is_active == is_active)

    if is_verified is not None:
        query = query.filter(UserModel.is_verified == is_verified)

    if search:
        query = query.filter(
            (UserModel.email.ilike(f"%{search}%")) |
            (UserModel.username.ilike(f"%{search}%")) |
            (UserModel.phone.ilike(f"%{search}%"))
        )

    # 按创建时间倒序
    query = query.order_by(UserModel.created_at.desc())

    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()

    return UserListResponse(
        items=users,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: str,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取用户详情（管理端）
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: str,
    user_in: UserUpdateByAdmin,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    更新用户（管理端）
    """
    logger.info(f"[用户管理] 管理员 {current_admin.email} 尝试更新用户 ID: {user_id}, 数据: {user_in.model_dump(exclude_unset=True)}")

    # 检查用户是否存在
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        logger.warning(f"[用户管理] 更新失败：用户不存在 - ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户不存在 (ID: {user_id})"
        )

    # 记录更新前的状态
    old_values = {}
    update_data = user_in.model_dump(exclude_unset=True)

    for field in update_data.keys():
        old_values[field] = getattr(user, field, None)

    logger.info(f"[用户管理] 更新前状态 - 用户ID: {user_id}, 旧值: {old_values}, 新值: {update_data}")

    # 更新字段
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    logger.info(f"[用户管理] 成功更新用户 - ID: {user_id}, Email: {user.email}, 操作者: {current_admin.email}")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    删除用户（管理端）- 软删除
    """
    logger.info(f"[用户管理] 管理员 {current_admin.email} 尝试删除用户 ID: {user_id}")

    # 检查用户是否存在
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        logger.warning(f"[用户管理] 删除失败：用户不存在 - ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户不存在 (ID: {user_id})"
        )

    # 检查是否尝试删除自己
    if user.id == current_admin.id:
        logger.warning(f"[用户管理] 删除失败：不能删除自己 - 操作者: {current_admin.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账户"
        )

    # 检查用户是否已经是非活跃状态
    if not user.is_active:
        logger.info(f"[用户管理] 用户已经是非活跃状态 - ID: {user_id}, Email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"用户已经是非活跃状态 (Email: {user.email})"
        )

    # 记录删除前的用户信息
    user_info = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_admin": user.is_admin,
        "is_org_admin": user.is_org_admin
    }
    logger.info(f"[用户管理] 准备删除用户: {user_info}")

    # 软删除：设置为不活跃
    user.is_active = False
    db.commit()

    logger.info(f"[用户管理] 成功软删除用户 - ID: {user_id}, Email: {user.email}, 操作者: {current_admin.email}")
    return None


@router.get("/{user_id}/organizations")
def get_user_organizations(
    user_id: str,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取用户所属组织
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    memberships = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id
    ).all()

    organizations = []
    for membership in memberships:
        # TODO: 加载组织详情
        pass

    return {
        "items": organizations,
        "total": len(organizations)
    }
