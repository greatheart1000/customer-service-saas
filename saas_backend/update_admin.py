#!/usr/bin/env python3
"""
将现有用户设置为管理员
"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User


def set_user_admin(email: str):
    """
    将指定用户设置为管理员
    """
    db = SessionLocal()

    try:
        # 查找用户
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ 用户 {email} 不存在")
            return False

        # 更新管理员权限
        user.is_admin = True
        user.is_org_admin = True
        db.commit()

        print(f"✅ 用户 {email} 已设置为管理员")
        print(f"\n📋 用户信息:")
        print(f"   邮箱: {user.email}")
        print(f"   用户名: {user.username}")
        print(f"   平台管理员: {user.is_admin}")
        print(f"   组织管理员: {user.is_org_admin}")
        print(f"\n🔗 登录地址:")
        print(f"   前端: http://localhost:3000/login")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ 更新失败: {e}")
        raise
    finally:
        db.close()


def list_admins():
    """
    列出所有管理员
    """
    db = SessionLocal()

    try:
        admins = db.query(User).filter(
            (User.is_admin == True) | (User.is_org_admin == True)
        ).all()

        if not admins:
            print("📋 当前没有管理员用户")
        else:
            print("📋 当前管理员列表:")
            for admin in admins:
                roles = []
                if admin.is_admin:
                    roles.append("平台管理员")
                if admin.is_org_admin:
                    roles.append("组织管理员")

                print(f"   - {admin.email} ({', '.join(roles)})")

    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        email = sys.argv[1]
        set_user_admin(email)
    else:
        # 默认设置 admin@example.com 为管理员
        print("正在设置 admin@example.com 为管理员...")
        set_user_admin("admin@example.com")

    print("\n" + "=" * 50)
    list_admins()
