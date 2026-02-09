"""
租户相关 API - 基于UUID的多租户访问
用于终端用户通过域名+UUID访问特定租户的聊天窗口
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.api.v1.endpoints.deps import get_tenant_from_uuid
from app.models.organization import Organization
from app.models.bot import Bot
from app.models.knowledge_base import KnowledgeBase


router = APIRouter()


# ============ Pydantic Models ============

class BotResponse(BaseModel):
    """机器人响应"""
    id: str
    name: str
    description: Optional[str]
    avatar_url: Optional[str]
    welcome_message: Optional[str]

    class Config:
        from_attributes = True


class TenantInfoResponse(BaseModel):
    """租户信息响应"""
    id: str
    name: str
    is_active: bool
    bots: List[BotResponse] = []

    class Config:
        from_attributes = True


# ============ Public Endpoints (无需认证) ============

@router.get("/{tenant_uuid}/info", response_model=TenantInfoResponse)
def get_tenant_info(
    tenant_uuid: str,
    db: Session = Depends(get_db)
):
    """
    获取租户公开信息（用于终端用户）
    - 返回租户基本信息
    - 返回可用的机器人列表
    - 用于加载聊天窗口时的初始化
    """
    # 验证租户存在且活跃
    tenant = db.query(Organization).filter(
        Organization.id == tenant_uuid,
        Organization.is_active == True
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive"
        )

    # 获取该租户的所有活跃机器人
    bots = db.query(Bot).filter(
        Bot.organization_id == tenant_uuid,
        Bot.is_active == True
    ).all()

    return TenantInfoResponse(
        id=tenant.id,
        name=tenant.name,
        is_active=tenant.is_active,
        bots=[BotResponse(
            id=bot.id,
            name=bot.name,
            description=bot.description,
            avatar_url=bot.avatar_url,
            welcome_message=bot.welcome_message
        ) for bot in bots]
    )


@router.get("/{tenant_uuid}/bots", response_model=List[BotResponse])
def get_tenant_bots(
    tenant_uuid: str,
    db: Session = Depends(get_db)
):
    """
    获取租户的所有机器人（用于终端用户）
    """
    # 验证租户存在
    tenant = db.query(Organization).filter(
        Organization.id == tenant_uuid,
        Organization.is_active == True
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive"
        )

    bots = db.query(Bot).filter(
        Bot.organization_id == tenant_uuid,
        Bot.is_active == True
    ).all()

    return [BotResponse(
        id=bot.id,
        name=bot.name,
        description=bot.description,
        avatar_url=bot.avatar_url,
        welcome_message=bot.welcome_message
    ) for bot in bots]


@router.get("/{tenant_uuid}/bots/{bot_id}", response_model=BotResponse)
def get_tenant_bot(
    tenant_uuid: str,
    bot_id: str,
    db: Session = Depends(get_db)
):
    """
    获取租户的特定机器人详情（用于终端用户）
    """
    # 验证租户存在
    tenant = db.query(Organization).filter(
        Organization.id == tenant_uuid,
        Organization.is_active == True
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive"
        )

    # 查询机器人
    bot = db.query(Bot).filter(
        Bot.id == bot_id,
        Bot.organization_id == tenant_uuid,
        Bot.is_active == True
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    return BotResponse(
        id=bot.id,
        name=bot.name,
        description=bot.description,
        avatar_url=bot.avatar_url,
        welcome_message=bot.welcome_message
    )


@router.get("/{tenant_uuid}/knowledge-bases")
def get_tenant_knowledge_bases(
    tenant_uuid: str,
    db: Session = Depends(get_db)
):
    """
    获取租户的知识库列表（用于终端用户搜索）
    - 仅返回活跃的知识库
    - 用于聊天时检索相关文档
    """
    # 验证租户存在
    tenant = db.query(Organization).filter(
        Organization.id == tenant_uuid,
        Organization.is_active == True
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive"
        )

    knowledge_bases = db.query(KnowledgeBase).filter(
        KnowledgeBase.organization_id == tenant_uuid,
        KnowledgeBase.is_active == True
    ).all()

    return {
        "total": len(knowledge_bases),
        "items": [
            {
                "id": kb.id,
                "name": kb.name,
                "description": kb.description,
                "document_count": kb.document_count
            }
            for kb in knowledge_bases
        ]
    }
