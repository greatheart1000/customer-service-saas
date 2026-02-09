"""
机器人管理 API 端点
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.schemas.bot import (
    Bot, BotCreate, BotUpdate, BotListResponse, BotTestRequest
)
from app.schemas.user import User
from app.models.bot import Bot as BotModel
from app.models.organization import Organization

router = APIRouter()


def get_current_org(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Organization:
    """获取当前用户所属组织（简化版：取第一个组织）"""
    from app.models.organization import OrganizationMember
    from app.models.user import User

    # 查询用户的组织成员记录
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not belong to any organization"
        )

    org = db.query(Organization).filter(Organization.id == membership.organization_id).first()
    return org


@router.get("", response_model=BotListResponse)
def list_bots(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    获取机器人列表（用户端：只能看到自己组织的机器人）
    """
    org = get_current_org(current_user, db)

    query = db.query(BotModel).filter(BotModel.organization_id == org.id)

    if is_active is not None:
        query = query.filter(BotModel.is_active == is_active)

    total = query.count()
    bots = query.offset((page - 1) * page_size).limit(page_size).all()

    return BotListResponse(
        items=bots,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )


@router.post("", response_model=Bot, status_code=status.HTTP_201_CREATED)
def create_bot(
    bot_in: BotCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    创建机器人
    """
    org = get_current_org(current_user, db)

    # 检查 bot_id 是否已存在
    existing_bot = db.query(BotModel).filter(
        BotModel.bot_id == bot_in.bot_id,
        BotModel.organization_id == org.id
    ).first()

    if existing_bot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot ID already exists in this organization"
        )

    bot = BotModel(
        **bot_in.model_dump(),
        organization_id=org.id
    )
    db.add(bot)
    db.commit()
    db.refresh(bot)

    return bot


@router.get("/{bot_id}", response_model=Bot)
def get_bot(
    bot_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    获取机器人详情
    """
    org = get_current_org(current_user, db)

    bot = db.query(BotModel).filter(
        BotModel.id == bot_id,
        BotModel.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    return bot


@router.put("/{bot_id}", response_model=Bot)
def update_bot(
    bot_id: str,
    bot_in: BotUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    更新机器人
    """
    org = get_current_org(current_user, db)

    bot = db.query(BotModel).filter(
        BotModel.id == bot_id,
        BotModel.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    # 更新字段
    update_data = bot_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bot, field, value)

    db.commit()
    db.refresh(bot)

    return bot


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bot(
    bot_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    删除机器人
    """
    org = get_current_org(current_user, db)

    bot = db.query(BotModel).filter(
        BotModel.id == bot_id,
        BotModel.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    db.delete(bot)
    db.commit()

    return None


@router.post("/{bot_id}/test")
def test_bot(
    bot_id: str,
    test_request: BotTestRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    测试机器人
    """
    org = get_current_org(current_user, db)

    bot = db.query(BotModel).filter(
        BotModel.id == bot_id,
        BotModel.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    # TODO: 实现实际的机器人测试逻辑（调用 Coze API）
    return {
        "message": "Bot test endpoint - needs Coze API integration",
        "bot_id": bot.bot_id,
        "test_message": test_request.message
    }
