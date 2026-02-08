"""
订阅相关 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.v1.endpoints import deps
from app.schemas.subscription import Subscription, SubscriptionCreate, SubscriptionUpdate, SUBSCRIPTION_PLANS
from app.models.subscription import Subscription as SubscriptionModel
from app.models.organization import Organization
from app.models.user import User

router = APIRouter()


@router.get("/plans")
def list_subscription_plans():
    """
    获取所有订阅计划
    """
    plans = [
        {
            "plan_type": plan.plan_type,
            "name": plan.name,
            "price_monthly": plan.price_monthly,
            "price_yearly": plan.price_yearly,
            "currency": plan.currency,
            "features": plan.features,
            "limits": plan.limits,
        }
        for plan in SUBSCRIPTION_PLANS.values()
    ]

    return {"plans": plans}


@router.get("/current", response_model=Subscription)
def get_current_subscription(
    organization_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取当前订阅
    """
    # 验证用户是否有权限访问该组织
    # TODO: 添加权限检查

    subscription = db.query(SubscriptionModel).filter(
        SubscriptionModel.organization_id == organization_id
    ).first()

    if not subscription:
        # 返回默认免费订阅
        return Subscription(
            id=None,
            organization_id=organization_id,
            plan_type="free",
            status="active",
            billing_cycle="monthly",
            current_period_start=None,
            current_period_end=None,
            cancel_at_period_end=False,
            created_at=None,
            updated_at=None,
        )

    return subscription


@router.post("/upgrade")
def upgrade_subscription(
    organization_id: UUID,
    plan_type: str,
    billing_cycle: str = "monthly",
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    升级订阅（返回支付信息）
    """
    # 验证计划类型
    if plan_type not in ["pro", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type"
        )

    # 获取计划价格
    plan = SUBSCRIPTION_PLANS[plan_type]
    if billing_cycle == "yearly":
        amount = plan.price_yearly
    else:
        amount = plan.price_monthly

    # 返回支付信息
    return {
        "organization_id": str(organization_id),
        "plan_type": plan_type,
        "billing_cycle": billing_cycle,
        "amount": amount,
        "currency": plan.currency,
        "message": "Please proceed to payment",
    }


@router.post("/cancel")
def cancel_subscription(
    organization_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    取消订阅
    """
    subscription = db.query(SubscriptionModel).filter(
        SubscriptionModel.organization_id == organization_id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # 设置在周期结束后取消
    subscription.cancel_at_period_end = True
    db.commit()

    return {"message": "Subscription will be canceled at the end of the billing period"}
