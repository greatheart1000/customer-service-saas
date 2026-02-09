"""
数据库迁移脚本 - 添加知识库和文档表
"""
import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings


def migrate_create_knowledge_base_tables():
    """创建知识库和文档表"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 创建 knowledge_bases 表
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS knowledge_bases (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    organization_id VARCHAR(36) NOT NULL,
                    document_count INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    INDEX ix_knowledge_bases_organization_id (organization_id),
                    INDEX ix_knowledge_bases_is_active (is_active),
                    FOREIGN KEY (organization_id) REFERENCES organizations(id)
                )
            """))
            conn.commit()
            print("✓ 创建 knowledge_bases 表成功")
        except Exception as e:
            if "already exists" not in str(e):
                print(f"✗ 创建 knowledge_bases 表失败: {e}")
                conn.rollback()
            else:
                conn.commit()

        # 创建 documents 表
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS documents (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    content TEXT,
                    file_url VARCHAR(500),
                    file_type VARCHAR(50),
                    file_size INT,
                    knowledge_base_id VARCHAR(36) NOT NULL,
                    uploaded_by VARCHAR(36) NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    error_message TEXT,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    INDEX ix_documents_knowledge_base_id (knowledge_base_id),
                    INDEX ix_documents_status (status),
                    INDEX ix_documents_uploaded_by (uploaded_by),
                    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
                    FOREIGN KEY (uploaded_by) REFERENCES users(id)
                )
            """))
            conn.commit()
            print("✓ 创建 documents 表成功")
        except Exception as e:
            if "already exists" not in str(e):
                print(f"✗ 创建 documents 表失败: {e}")
                conn.rollback()
            else:
                conn.commit()


def main():
    """运行迁移"""
    print("=" * 50)
    print("开始知识库数据库迁移...")
    print("=" * 50)

    migrate_create_knowledge_base_tables()

    print("\n" + "=" * 50)
    print("知识库数据库迁移完成！")
    print("=" * 50)


if __name__ == "__main__":
    main()
