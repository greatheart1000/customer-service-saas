"""
生成测试数据脚本
用于创建测试用户、知识库和文档
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.knowledge_base import KnowledgeBase, Document
from app.core.security import get_password_hash
import uuid

def generate_test_data():
    """生成测试数据"""
    db = SessionLocal()

    try:
        # 先创建第一个测试用户（作为组织拥有者）
        admin_user_data = {
            "email": "admin@test.com",
            "username": "管理员",
            "password": "Admin123",
            "is_admin": True,
            "is_org_admin": True
        }

        admin_user = db.query(User).filter(User.email == admin_user_data["email"]).first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                email=admin_user_data["email"],
                username=admin_user_data["username"],
                password_hash=get_password_hash(admin_user_data["password"]),
                is_active=True,
                is_verified=True,
                is_admin=admin_user_data["is_admin"],
                is_org_admin=admin_user_data["is_org_admin"]
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✓ 创建管理员用户: {admin_user.username} ({admin_user.email})")
        else:
            print(f"✓ 管理员用户已存在: {admin_user.username}")

        # 创建测试组织（使用管理员作为拥有者）
        org = db.query(Organization).filter(Organization.name == "测试组织").first()
        if not org:
            org = Organization(
                id=str(uuid.uuid4()),
                name="测试组织",
                logo_url=None,
                owner_id=admin_user.id,
                is_active=True
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"✓ 创建测试组织: {org.name}")
        else:
            print(f"✓ 测试组织已存在: {org.name}")

        # 将管理员用户添加到组织
        existing_member = db.query(OrganizationMember).filter(
            OrganizationMember.user_id == admin_user.id,
            OrganizationMember.organization_id == org.id
        ).first()
        if not existing_member:
            org_member = OrganizationMember(
                id=str(uuid.uuid4()),
                user_id=admin_user.id,
                organization_id=org.id,
                role="admin"
            )
            db.add(org_member)
            db.commit()
            print(f"✓ 将管理员添加到组织")

        # 创建其他测试用户
        test_users = [
            {
                "email": "user1@test.com",
                "username": "张三",
                "password": "User123456",
                "is_admin": False,
                "is_org_admin": True
            },
            {
                "email": "user2@test.com",
                "username": "李四",
                "password": "User123456",
                "is_admin": False,
                "is_org_admin": False
            },
            {
                "email": "user3@test.com",
                "username": "王五",
                "password": "User123456",
                "is_admin": False,
                "is_org_admin": False
            }
        ]

        for user_data in test_users:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                user = User(
                    id=str(uuid.uuid4()),
                    email=user_data["email"],
                    username=user_data["username"],
                    password_hash=get_password_hash(user_data["password"]),
                    is_active=True,
                    is_verified=True,
                    is_admin=user_data["is_admin"],
                    is_org_admin=user_data["is_org_admin"]
                )
                db.add(user)
                db.commit()

                # 将用户添加到组织
                org_member = OrganizationMember(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    organization_id=org.id,
                    role="admin" if user_data["is_org_admin"] else "member"
                )
                db.add(org_member)
                db.commit()

                print(f"✓ 创建测试用户: {user.username} ({user.email})")
            else:
                print(f"✓ 测试用户已存在: {existing_user.username}")

        # 创建测试知识库
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.name == "产品知识库").first()
        if not kb:
            kb = KnowledgeBase(
                id=str(uuid.uuid4()),
                name="产品知识库",
                description="包含产品使用说明、常见问题等信息",
                organization_id=org.id,
                document_count=0,
                is_active=True
            )
            db.add(kb)
            db.commit()
            db.refresh(kb)
            print(f"✓ 创建测试知识库: {kb.name}")
        else:
            print(f"✓ 测试知识库已存在: {kb.name}")

        # 创建测试文档
        test_documents = [
            {
                "title": "产品介绍",
                "content": """# 产品介绍

欢迎使用智能客服SaaS系统！

## 主要功能

1. **用户管理** - 管理系统用户、角色和权限
2. **机器人管理** - 创建和管理AI客服机器人
3. **知识库管理** - 维护知识库和文档
4. **对话管理** - 查看和管理用户对话记录

## 技术特点

- 基于Coze API的智能对话
- 实时流式响应
- 多租户支持
- RBAC权限控制

## 联系我们

如有问题，请联系技术支持。"""
            },
            {
                "title": "常见问题FAQ",
                "content": """# 常见问题FAQ

## Q1: 如何创建新的机器人？

A: 在管理后台的机器人管理页面，点击"创建机器人"按钮，填写机器人信息并配置Coze API。

## Q2: 如何上传文档到知识库？

A: 在知识库管理页面，选择目标知识库，点击"上传文件"或"添加文档"按钮。

## Q3: 用户角色有哪些区别？

A:
- **平台管理员**: 拥有所有权限
- **组织管理员**: 可以管理本组织和用户
- **普通用户**: 只能使用聊天功能

## Q4: 如何重置密码？

A: 在登录页面点击"忘记密码"，按照提示进行密码重置。

## Q5: 支持哪些文件格式？

A: 目前支持 .txt, .md, .pdf, .doc, .docx 格式的文件。"""
            },
            {
                "title": "API接口文档",
                "content": """# API接口文档

## 认证接口

### POST /api/v1/auth/login
用户登录

**请求参数:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**响应:**
```json
{
  "access_token": "xxx",
  "refresh_token": "yyy",
  "user": {...}
}
```

## 用户管理接口

### GET /api/v1/admin/users
获取用户列表

**查询参数:**
- page: 页码
- page_size: 每页数量
- search: 搜索关键词

### DELETE /api/v1/admin/users/{user_id}
删除用户

## 知识库接口

### GET /api/v1/admin/knowledge
获取知识库列表

### POST /api/v1/admin/knowledge
创建知识库

**请求参数:**
```json
{
  "name": "知识库名称",
  "description": "描述"
}
```

### POST /api/v1/admin/knowledge/{kb_id}/documents
创建文档"""
            }
        ]

        for doc_data in test_documents:
            existing_doc = db.query(Document).filter(
                Document.knowledge_base_id == kb.id,
                Document.title == doc_data["title"]
            ).first()

            if not existing_doc:
                # 获取第一个用户作为上传者
                uploader = db.query(User).filter(User.email == "admin@test.com").first()
                if not uploader:
                    uploader = db.query(User).first()

                doc = Document(
                    id=str(uuid.uuid4()),
                    title=doc_data["title"],
                    content=doc_data["content"],
                    knowledge_base_id=kb.id,
                    uploaded_by=uploader.id if uploader else None,
                    status="completed",
                    file_type=None
                )
                db.add(doc)
                db.commit()
                print(f"✓ 创建测试文档: {doc.title}")
            else:
                print(f"✓ 测试文档已存在: {existing_doc.title}")

        # 更新知识库文档计数
        kb_doc_count = db.query(Document).filter(Document.knowledge_base_id == kb.id).count()
        kb.document_count = kb_doc_count
        db.commit()

        print("\n" + "="*50)
        print("测试数据生成完成！")
        print("="*50)
        print(f"\n组织: {org.name} (ID: {org.id})")
        print(f"知识库: {kb.name} (ID: {kb.id})")
        print(f"文档数量: {kb.document_count}")
        print(f"\n测试用户账号:")
        print(f"  - admin@test.com / Admin123 (管理员)")
        for user_data in test_users:
            print(f"  - {user_data['email']} / {user_data['password']}")

    except Exception as e:
        print(f"❌ 生成测试数据失败: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data()
