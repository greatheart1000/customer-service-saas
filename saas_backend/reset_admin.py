#!/usr/bin/env python3
"""
重置管理员账号
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, PlanType
from app.models.organization_member import OrganizationMember, MemberRole
from app.core.security import get_password_hash


def reset_admin():
    """重置管理员账号"""
    db = SessionLocal()

    try:
        # 删除旧的管理员账号
        old_users = db.query(User).filter(
            User.email.in_(['admin@coze.test', 'admin@example.com'])
        ).all()

        for user in old_users:
            # 删除相关的组织成员记录
            db.query(OrganizationMember).filter(
                OrganizationMember.user_id == user.id
            ).delete()

            # 删除相关的组织
            db.query(Organization).filter(
                Organization.owner_id == user.id
            ).delete()

            # 删除用户
            db.delete(user)

        db.commit()
        print("✅ 清理旧账号完成")

        # 创建新的管理员账号
        user = User(
            email="admin@example.com",
            username="Administrator",
            password_hash=get_password_hash("Admin123456"),
            is_active=True,
            is_verified=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"✅ 用户创建成功: admin@example.com")

        # 创建默认组织
        organization = Organization(
            name="Administrator's Organization",
            owner_id=user.id,
            plan_type=PlanType.FREE,
        )

        db.add(organization)
        db.commit()
        db.refresh(organization)

        print(f"✅ 组织创建成功")

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
        print(f"   邮箱: admin@example.com")
        print(f"   密码: Admin123456")

    except Exception as e:
        db.rollback()
        print(f"❌ 失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_admin()
