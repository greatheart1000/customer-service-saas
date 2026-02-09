"""
用户管理 API 端点（管理端）
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.rbac import require_platform_admin, require_org_admin, check_permission
from app.schemas.admin import UserListResponse, UserUpdateByAdmin
from app.schemas.user import User
from app.models.user import User as UserModel
from app.models.organization_member import OrganizationMember

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
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 更新字段
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    删除用户（管理端）
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 软删除：设置为不活跃
    user.is_active = False
    db.commit()

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
