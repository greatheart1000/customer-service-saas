"""
使用量追踪服务
"""
from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.usage import UsageRecord
from app.models.organization import Organization
from app.models.subscription import Subscription
from app.schemas.usage import UsageStats, UsageHistory
from app.schemas.subscription import SUBSCRIPTION_PLANS


class UsageService:
    """使用量服务类"""

    def __init__(self, db: Session):
        self.db = db

    def record_usage(
        self,
        organization_id: UUID,
        user_id: UUID,
        resource_type: str,
        quantity: int = 1,
        metadata: Optional[dict] = None
    ) -> UsageRecord:
        """
        记录使用量
        """
        record = UsageRecord(
            organization_id=organization_id,
            user_id=user_id,
            resource_type=resource_type,
            quantity=quantity,
            extra_data=extra_data,
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return record

    def get_usage_stats(
        self,
        organization_id: UUID,
        period_start: Optional[date] = None,
        period_end: Optional[date] = None
    ) -> UsageStats:
        """
        获取使用量统计
        """
        # 默认统计当前月份
        if not period_start:
            period_start = date.today().replace(day=1)
        if not period_end:
            period_end = date.today()

        # 获取组织信息
        organization = self.db.query(Organization).filter(
            Organization.id == organization_id
        ).first()

        if not organization:
            raise ValueError("Organization not found")

        # 获取订阅计划限制
        plan = SUBSCRIPTION_PLANS[organization.plan_type]
        limits = plan.limits

        # 查询使用量
        usage_records = self.db.query(UsageRecord).filter(
            UsageRecord.organization_id == organization_id,
            UsageRecord.date >= period_start,
            UsageRecord.date <= period_end,
        ).all()

        # 统计各类资源使用量
        messages_used = sum(
            r.quantity for r in usage_records if r.resource_type == "message"
        )
        api_calls_used = sum(
            r.quantity for r in usage_records if r.resource_type == "api_call"
        )
        storage_used = sum(
            r.quantity for r in usage_records if r.resource_type == "storage"
        )

        # 计算百分比
        messages_limit = limits["messages_per_month"]
        api_calls_limit = limits.get("api_calls", 10000)
        storage_limit = limits.get("storage_mb", 1000)

        messages_percentage = (
            (messages_used / messages_limit * 100) if messages_limit > 0 else 0
        )
        api_calls_percentage = (
            (api_calls_used / api_calls_limit * 100) if api_calls_limit > 0 else 0
        )
        storage_percentage = (
            (storage_used / storage_limit * 100) if storage_limit > 0 else 0
        )

        # 检查是否超出限制
        is_over_limit = False
        if messages_limit > 0 and messages_used > messages_limit:
            is_over_limit = True
        if api_calls_limit > 0 and api_calls_used > api_calls_limit:
            is_over_limit = True
        if storage_limit > 0 and storage_used > storage_limit:
            is_over_limit = True

        return UsageStats(
            organization_id=organization_id,
            period_start=period_start,
            period_end=period_end,
            messages_used=messages_used,
            api_calls_used=api_calls_used,
            storage_used_mb=storage_used,
            messages_limit=messages_limit,
            api_calls_limit=api_calls_limit,
            storage_limit_mb=storage_limit,
            messages_percentage=messages_percentage,
            api_calls_percentage=api_calls_percentage,
            storage_percentage=storage_percentage,
            is_over_limit=is_over_limit,
        )

    def get_usage_history(
        self,
        organization_id: UUID,
        days: int = 30
    ) -> List[UsageHistory]:
        """
        获取使用量历史
        """
        start_date = date.today() - timedelta(days=days)

        # 查询使用量记录
        records = self.db.query(UsageRecord).filter(
            UsageRecord.organization_id == organization_id,
            UsageRecord.date >= start_date,
        ).all()

        # 按日期分组统计
        history = {}
        for record in records:
            if record.date not in history:
                history[record.date] = {
                    "date": record.date,
                    "messages": 0,
                    "api_calls": 0,
                    "storage_mb": 0,
                }

            if record.resource_type == "message":
                history[record.date]["messages"] += record.quantity
            elif record.resource_type == "api_call":
                history[record.date]["api_calls"] += record.quantity
            elif record.resource_type == "storage":
                history[record.date]["storage_mb"] += record.quantity

        # 转换为列表并排序
        result = [
            UsageHistory(**v) for v in sorted(history.values(), key=lambda x: x["date"])
        ]

        return result

    def check_usage_limit(
        self,
        organization_id: UUID,
        resource_type: str,
        additional_quantity: int = 1
    ) -> bool:
        """
        检查是否超出使用限制
        """
        try:
            stats = self.get_usage_stats(organization_id)

            if resource_type == "message":
                limit = stats.messages_limit
                used = stats.messages_used
            elif resource_type == "api_call":
                limit = stats.api_calls_limit
                used = stats.api_calls_used
            elif resource_type == "storage":
                limit = stats.storage_limit_mb
                used = stats.storage_used_mb
            else:
                return True  # 未知类型，允许使用

            # -1 表示无限
            if limit < 0:
                return True

            return (used + additional_quantity) <= limit

        except Exception:
            return True  # 出错时允许使用
