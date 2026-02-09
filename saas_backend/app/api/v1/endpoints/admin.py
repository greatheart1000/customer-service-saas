"""
管理端统计和系统管理 API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.rbac import require_platform_admin, require_org_admin
from app.schemas.admin import DashboardStats, SystemSettings, SystemSettingsUpdate
from app.schemas.user import User
from app.models.user import User as UserModel
from app.models.conversation import Conversation as ConversationModel
from app.models.bot import Bot
from app.models.organization import Organization
from app.models.subscription import Subscription
from app.models.order import Order

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取仪表板统计数据
    """
    # 用户统计
    total_users = db.query(UserModel).count()
    active_users = db.query(UserModel).filter(UserModel.is_active == True).count()

    # 对话统计
    total_conversations = db.query(ConversationModel).count()

    # 消息统计（简化：使用对话的消息计数总和）
    result = db.query(func.sum(ConversationModel.message_count)).scalar()
    total_messages = result if result else 0

    # 机器人统计
    total_bots = db.query(Bot).count()

    # 组织统计
    total_organizations = db.query(Organization).count()

    # 收入统计（从订单表）
    result = db.query(func.sum(Order.amount)).filter(
        Order.status == "completed"
    ).scalar()
    revenue_total = float(result) if result else 0.0

    # 当月收入
    from datetime import datetime, timedelta
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = db.query(func.sum(Order.amount)).filter(
        Order.status == "completed",
        Order.created_at >= month_start
    ).scalar()
    revenue_month = float(result) if result else 0.0

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_conversations=total_conversations,
        total_messages=total_messages,
        total_bots=total_bots,
        total_organizations=total_organizations,
        revenue_month=revenue_month,
        revenue_total=revenue_total
    )


@router.get("/system/settings", response_model=SystemSettings)
def get_system_settings(
    current_admin: User = Depends(require_platform_admin),
):
    """
    获取系统设置（当前返回默认值，可以后续扩展到数据库存储）
    """
    return SystemSettings()


@router.put("/system/settings", response_model=SystemSettings)
def update_system_settings(
    settings_in: SystemSettingsUpdate,
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    更新系统设置（当前仅返回输入值，可以后续扩展到数据库存储）
    """
    # TODO: 将设置保存到数据库或配置文件
    current = SystemSettings()

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current, field, value)

    return current


@router.get("/system/health")
def get_system_health(
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取系统健康状态
    """
    # 检查数据库连接
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    # TODO: 检查其他服务（Redis, Coze API 等）

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "services": {
            "database": db_status,
            "redis": "unknown",  # TODO: 实现 Redis 健康检查
            "coze_api": "unknown"  # TODO: 实现 Coze API 健康检查
        }
    }
