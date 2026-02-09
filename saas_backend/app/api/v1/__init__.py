"""
API v1 路由聚合
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, organizations, subscriptions, payments, usage, auth_extended,
    bots, conversations, chat, users, admin, knowledge
)

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

# 机器人相关路由
api_router.include_router(bots.router, prefix="/bots", tags=["机器人"])

# 对话相关路由
api_router.include_router(conversations.router, prefix="/conversations", tags=["对话"])

# 聊天相关路由（用户端核心功能）
api_router.include_router(chat.router, prefix="/chat", tags=["聊天"])

# 知识库管理路由（管理端）
api_router.include_router(knowledge.router, prefix="/admin/knowledge", tags=["管理端-知识库"])

# 用户管理路由（管理端）
api_router.include_router(users.router, prefix="/admin/users", tags=["管理端-用户"])

# 管理端统计和系统管理
api_router.include_router(admin.router, prefix="/admin", tags=["管理端"])
