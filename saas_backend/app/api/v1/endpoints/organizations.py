"""
组织相关 API 端点
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.schemas.organization import (
    Organization,
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationWithMembers,
    OrganizationMemberInvite,
    OrganizationMemberRole,
)
from app.models.organization import Organization as OrganizationModel
from app.models.organization_member import OrganizationMember, MemberRole
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[Organization])
def list_organizations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取用户的组织列表
    """
    # 查询用户所属的组织
    memberships = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).all()

    org_ids = [m.organization_id for m in memberships]

    organizations = db.query(OrganizationModel).filter(
        OrganizationModel.id.in_(org_ids)
    ).all()

    return organizations


@router.post("", response_model=Organization)
def create_organization(
    org_in: OrganizationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建组织
    """
    # 创建组织
    organization = OrganizationModel(
        name=org_in.name,
        logo_url=org_in.logo_url,
        owner_id=current_user.id,
    )

    db.add(organization)
    db.commit()
    db.refresh(organization)

    # 添加创建者为所有者
    member = OrganizationMember(
        organization_id=organization.id,
        user_id=current_user.id,
        role=MemberRole.OWNER,
    )

    db.add(member)
    db.commit()

    return organization


@router.get("/{org_id}", response_model=OrganizationWithMembers)
def get_organization(
    org_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取组织详情
    """
    # 检查用户是否是组织成员
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == current_user.id,
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization"
        )

    # 获取组织信息
    organization = db.query(OrganizationModel).filter(
        OrganizationModel.id == org_id
    ).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    # 获取成员列表
    members = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id
    ).all()

    return OrganizationWithMembers(
        **organization.__dict__,
        members=members,
    )


@router.put("/{org_id}", response_model=Organization)
def update_organization(
    org_id: str,
    org_in: OrganizationUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    更新组织信息
    """
    # 检查权限
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == current_user.id,
    ).first()

    if not membership or membership.role not in [MemberRole.OWNER, MemberRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    # 更新组织
    organization = db.query(OrganizationModel).filter(
        OrganizationModel.id == org_id
    ).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    for field, value in org_in.dict(exclude_unset=True).items():
        setattr(organization, field, value)

    db.commit()
    db.refresh(organization)

    return organization


@router.post("/{org_id}/members", response_model=dict)
def invite_member(
    org_id: str,
    invite_in: OrganizationMemberInvite,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    邀请成员加入组织
    """
    # 检查权限
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == current_user.id,
    ).first()

    if not membership or membership.role not in [MemberRole.OWNER, MemberRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    # 查找被邀请用户
    user = db.query(User).filter(User.email == invite_in.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 检查是否已经是成员
    existing = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == user.id,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member"
        )

    # 添加成员
    member = OrganizationMember(
        organization_id=org_id,
        user_id=user.id,
        role=MemberRole(invite_in.role),
    )

    db.add(member)
    db.commit()

    return {"message": "Member added successfully"}


@router.delete("/{org_id}/members/{user_id}")
def remove_member(
    org_id: str,
    user_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    移除组织成员
    """
    # 检查权限
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == current_user.id,
    ).first()

    if not membership or membership.role != MemberRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owner can remove members"
        )

    # 删除成员
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == user_id,
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}
