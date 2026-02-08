"""
API v1 路由聚合
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, organizations, subscriptions, payments, usage, auth_extended

api_router = APIRouter()

# 认证相关路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(auth_extended.router, prefix="/auth", tags=["认证扩展"])

# 组织相关路由
api_router.include_router(organizations.router, prefix="/organizations", tags=["组织"])

# 订阅相关路由
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["订阅"])

# 支付相关路由
api_router.include_router(payments.router, prefix="/payments", tags=["支付"])

# 使用量相关路由
api_router.include_router(usage.router, prefix="/usage", tags=["使用量"])
