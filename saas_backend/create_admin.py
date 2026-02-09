#!/usr/bin/env python3
"""
创建管理员账号脚本
"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, PlanType
from app.models.organization_member import OrganizationMember, MemberRole
from app.core.security import get_password_hash


def create_admin_user(
    email: str = "admin@example.com",
    password: str = "admin123456",
    username: str = "Admin"
):
    """
    创建管理员账号
    """
    db = SessionLocal()

    try:
        # 检查用户是否已存在
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️  用户 {email} 已存在")
            return existing_user

        # 创建用户
        user = User(
            email=email,
            username=username,
            password_hash=get_password_hash(password),
            is_active=True,
            is_verified=True,  # 管理员账号直接验证
            is_admin=True,  # 平台管理员
            is_org_admin=True,  # 组织管理员
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"✅ 用户创建成功: {email}")

        # 创建默认组织
        org_name = f"{username}'s Organization"
        organization = Organization(
            name=org_name,
            owner_id=user.id,
            plan_type=PlanType.FREE,
        )

        db.add(organization)
        db.commit()
        db.refresh(organization)

        print(f"✅ 组织创建成功: {org_name}")

        # 添加用户为组织所有者
        member = OrganizationMember(
            organization_id=organization.id,
            user_id=user.id,
            role=MemberRole.OWNER,
        )

        db.add(member)
        db.commit()

        print(f"✅ 管理员账号设置完成！")
        print(f"\n📋 登录信息:")
        print(f"   邮箱: {email}")
        print(f"   密码: {password}")
        print(f"   用户名: {username}")
        print(f"\n🔗 访问地址:")
        print(f"   前端: http://localhost:3000")
        print(f"   后端: http://localhost:8000")

        return user

    except Exception as e:
        db.rollback()
        print(f"❌ 创建失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # 创建管理员账号
    create_admin_user(
        email="admin@example.com",
        password="Admin123456",
        username="Administrator"
    )
