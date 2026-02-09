"""
RBAC 权限验证依赖
简化版 RBAC - 支持 3 种角色：
1. 平台管理员 (is_admin=True) - 全平台管理
2. 组织管理员 (is_org_admin=True) - 管理本组织
3. 普通用户 - 基本功能
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.schemas.user import User


async def require_platform_admin(
    current_user: User = Depends(deps.get_current_user),
) -> User:
    """
    要求平台管理员权限
    - 可以管理整个平台
    - 可以查看所有数据
    - 可以修改系统设置
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要平台管理员权限",
        )
    return current_user


async def require_org_admin(
    current_user: User = Depends(deps.get_current_user),
) -> User:
    """
    要求组织管理员权限
    - 可以管理本组织的机器人、知识库、成员
    - 平台管理员自动拥有此权限
    """
    if not (current_user.is_admin or current_user.is_org_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要组织管理员权限",
        )
    return current_user


async def require_active_user(
    current_user: User = Depends(deps.get_current_user),
) -> User:
    """
    要求活跃用户（已验证且未禁用）
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户账户已被禁用",
        )
    return current_user


def check_permission(
    current_user: User,
    required_permission: str,
    resource_org_id: str = None,
) -> bool:
    """
    检查用户是否具有特定权限

    Args:
        current_user: 当前用户
        required_permission: 所需权限
            - 'platform:admin' - 平台管理
            - 'org:admin' - 组织管理
            - 'org:member' - 组织成员
            - 'chat:send' - 发送消息
        resource_org_id: 资源所属组织ID（用于数据范围检查）

    Returns:
        bool: 是否有权限
    """
    # 平台管理员拥有所有权限
    if current_user.is_admin:
        return True

    # 组织管理权限
    if required_permission == 'org:admin':
        return current_user.is_org_admin

    # 组织成员权限（后续可扩展检查用户是否属于该组织）
    if required_permission == 'org:member':
        # TODO: 检查用户是否属于 resource_org_id 对应的组织
        return True

    # 普通用户权限
    if required_permission == 'chat:send':
        return current_user.is_active

    return False
