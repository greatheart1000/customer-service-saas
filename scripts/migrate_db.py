"""
数据库迁移脚本 - 添加用户角色和消息表
"""
import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.base import Base


def migrate_add_user_roles():
    """添加用户角色字段"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 检查并添加 is_admin 字段
        try:
            # 检查列是否存在
            result = conn.execute(text("""
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'is_admin'
            """))

            if result.fetchone() is None:
                # 列不存在，添加它
                conn.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✓ 添加 is_admin 字段成功")
            else:
                print("✓ is_admin 字段已存在")
        except Exception as e:
            print(f"✗ 处理 is_admin 字段失败: {e}")

        # 检查并添加 is_org_admin 字段
        try:
            # 检查列是否存在
            result = conn.execute(text("""
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'is_org_admin'
            """))

            if result.fetchone() is None:
                # 列不存在，添加它
                conn.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN is_org_admin BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✓ 添加 is_org_admin 字段成功")
            else:
                print("✓ is_org_admin 字段已存在")
        except Exception as e:
            print(f"✗ 处理 is_org_admin 字段失败: {e}")


def migrate_create_messages_table():
    """创建消息表"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 创建 messages 表
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS messages (
                    id VARCHAR(36) PRIMARY KEY,
                    conversation_id VARCHAR(36) NOT NULL,
                    user_id VARCHAR(36) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    content TEXT NOT NULL,
                    coze_message_id VARCHAR(100),
                    created_at DATETIME NOT NULL,
                    INDEX ix_messages_conversation_id (conversation_id),
                    INDEX ix_messages_user_id (user_id),
                    INDEX ix_messages_created_at (created_at)
                )
            """))
            print("✓ 创建 messages 表成功")
        except Exception as e:
            if "already exists" not in str(e):
                print(f"✗ 创建 messages 表失败: {e}")


def main():
    """运行所有迁移"""
    print("=" * 50)
    print("开始数据库迁移...")
    print("=" * 50)

    print("\n步骤 1: 添加用户角色字段")
    migrate_add_user_roles()

    print("\n步骤 2: 创建消息表")
    migrate_create_messages_table()

    print("\n" + "=" * 50)
    print("数据库迁移完成！")
    print("=" * 50)


if __name__ == "__main__":
    main()
