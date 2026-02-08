"""
API 路由
"""
from fastapi import APIRouter
from app.api.v1 import api_router as api_v1_router

router = APIRouter()

# 包含 v1 API
router.include_router(api_v1_router, prefix="/v1")
