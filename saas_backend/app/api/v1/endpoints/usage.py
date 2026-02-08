"""
使用量相关 API 端点
"""
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.v1.endpoints import deps
from app.schemas.usage import UsageStats, UsageHistory
from app.services.usage_service import UsageService
from app.models.user import User

router = APIRouter()


@router.get("/stats", response_model=UsageStats)
def get_usage_stats(
    organization_id: UUID,
    period_start: Optional[date] = Query(None),
    period_end: Optional[date] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取使用量统计
    """
    usage_service = UsageService(db)

    stats = usage_service.get_usage_stats(
        organization_id=organization_id,
        period_start=period_start,
        period_end=period_end,
    )

    return stats


@router.get("/history", response_model=list[UsageHistory])
def get_usage_history(
    organization_id: UUID,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取使用量历史
    """
    usage_service = UsageService(db)

    history = usage_service.get_usage_history(
        organization_id=organization_id,
        days=days,
    )

    return history


@router.post("/record")
def record_usage(
    organization_id: UUID,
    resource_type: str,
    quantity: int = Query(1, ge=1),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    记录使用量（内部 API）
    """
    usage_service = UsageService(db)

    record = usage_service.record_usage(
        organization_id=organization_id,
        user_id=current_user.id,
        resource_type=resource_type,
        quantity=quantity,
    )

    return {"message": "Usage recorded", "record_id": str(record.id)}
