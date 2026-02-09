"""
对话管理 API 端点
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.bots import get_current_org
from app.api.v1.endpoints.rbac import require_org_admin
from app.schemas.conversation import (
    Conversation, ConversationCreate, ConversationUpdate,
    ConversationListResponse, Message, MessageCreate
)
from app.schemas.user import User
from app.models.conversation import Conversation as ConversationModel
from app.models.bot import Bot
from app.models.user import User as UserModel
from app.models.message import Message as MessageModel

router = APIRouter()


@router.get("", response_model=ConversationListResponse)
def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    bot_id: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    获取对话列表（用户端：只能看到自己的对话）
    """
    org = get_current_org(current_user, db)

    query = db.query(ConversationModel).filter(
        ConversationModel.organization_id == org.id,
        ConversationModel.user_id == current_user.id
    )

    if bot_id:
        query = query.filter(ConversationModel.bot_id == bot_id)

    # 按更新时间倒序
    query = query.order_by(ConversationModel.updated_at.desc())

    total = query.count()
    conversations = query.offset((page - 1) * page_size).limit(page_size).all()

    return ConversationListResponse(
        items=conversations,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )


@router.post("", response_model=Conversation, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation_in: ConversationCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    创建新对话
    """
    org = get_current_org(current_user, db)

    # 验证 bot 是否存在且属于该组织
    bot = db.query(Bot).filter(
        Bot.id == conversation_in.bot_id,
        Bot.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    if not bot.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is not active"
        )

    conversation = ConversationModel(
        bot_id=conversation_in.bot_id,
        user_id=current_user.id,
        organization_id=org.id,
        title=conversation_in.title or "新对话",
        message_count=0
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


@router.get("/{conversation_id}", response_model=Conversation)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    获取对话详情
    """
    org = get_current_org(current_user, db)

    conversation = db.query(ConversationModel).filter(
        ConversationModel.id == conversation_id,
        ConversationModel.organization_id == org.id,
        ConversationModel.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.put("/{conversation_id}", response_model=Conversation)
def update_conversation(
    conversation_id: str,
    conversation_in: ConversationUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    更新对话（如标题）
    """
    org = get_current_org(current_user, db)

    conversation = db.query(ConversationModel).filter(
        ConversationModel.id == conversation_id,
        ConversationModel.organization_id == org.id,
        ConversationModel.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # 更新字段
    update_data = conversation_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(conversation, field, value)

    db.commit()
    db.refresh(conversation)

    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    删除对话
    """
    org = get_current_org(current_user, db)

    conversation = db.query(ConversationModel).filter(
        ConversationModel.id == conversation_id,
        ConversationModel.organization_id == org.id,
        ConversationModel.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    db.delete(conversation)
    db.commit()

    return None


@router.get("/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    获取对话的消息列表
    """
    org = get_current_org(current_user, db)

    conversation = db.query(ConversationModel).filter(
        ConversationModel.id == conversation_id,
        ConversationModel.organization_id == org.id,
        ConversationModel.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # 查询消息
    query = db.query(MessageModel).filter(
        MessageModel.conversation_id == conversation_id
    ).order_by(MessageModel.created_at.asc())

    total = query.count()
    messages = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": messages,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": page * page_size < total
    }


# ==================== 管理端：所有对话管理 ====================

@router.get("/admin/all", response_model=ConversationListResponse)
def list_all_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    bot_id: Optional[str] = None,
    user_id: Optional[str] = None,
    current_admin: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取所有对话列表（管理端）
    """
    org = get_current_org(current_admin, db)

    query = db.query(ConversationModel).filter(
        ConversationModel.organization_id == org.id
    )

    if bot_id:
        query = query.filter(ConversationModel.bot_id == bot_id)

    if user_id:
        query = query.filter(ConversationModel.user_id == user_id)

    # 按更新时间倒序
    query = query.order_by(ConversationModel.updated_at.desc())

    total = query.count()
    conversations = query.offset((page - 1) * page_size).limit(page_size).all()

    return ConversationListResponse(
        items=conversations,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )
