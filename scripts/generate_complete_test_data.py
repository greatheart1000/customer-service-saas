#!/usr/bin/env python3
"""
完整的测试数据生成脚本
包含：用户、组织、机器人、对话、消息
"""
import sys
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.bot import Bot
from app.models.conversation import Conversation as ConversationModel
from app.models.message import Message as MessageModel
from app.models.knowledge_base import KnowledgeBase, Document
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)


def generate_test_data():
    """生成完整的测试数据"""
    db = SessionLocal()

    try:
        print("🚀 开始生成测试数据...")

        # ========== 1. 创建用户 ==========
        print("\n📝 创建用户...")

        # 检查管理员是否存在
        admin_user = db.query(User).filter(User.email == "admin@test.com").first()

        if not admin_user:
            print("  创建管理员用户...")
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@test.com",
                username="系统管理员",
                password_hash=hash_password("Admin123"),
                is_admin=True,
                is_org_admin=True,
                is_verified=True,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"  ✅ 管理员创建成功: {admin_user.email}")
        else:
            print(f"  ✅ 管理员已存在: {admin_user.email}")

        # 创建组织
        print("\n🏢 创建组织...")
        org = db.query(Organization).filter(Organization.name == "测试公司").first()

        if not org:
            org = Organization(
                id=str(uuid.uuid4()),
                name="测试公司",
                owner_id=admin_user.id,
                is_active=True,
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"  ✅ 组织创建成功: {org.name}")

            # 将管理员加入组织
            admin_member = OrganizationMember(
                organization_id=org.id,
                user_id=admin_user.id,
                role="admin",
            )
            db.add(admin_member)
            db.commit()
        else:
            print(f"  ✅ 组织已存在: {org.name}")

        # 创建普通用户
        test_users_data = [
            {
                "email": "user1@test.com",
                "username": "张三",
                "password": "User123456",
            },
            {
                "email": "user2@test.com",
                "username": "李四",
                "password": "User123456",
            },
            {
                "email": "user3@test.com",
                "username": "王五",
                "password": "User123456",
            },
        ]

        users = [admin_user]
        for user_data in test_users_data:
            user = db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                user = User(
                    id=str(uuid.uuid4()),
                    email=user_data["email"],
                    username=user_data["username"],
                    password_hash=hash_password(user_data["password"]),
                    is_admin=False,
                    is_org_admin=i == 0,  # 第一个是组织管理员
                    is_verified=True,
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"  ✅ 用户创建成功: {user.email} ({user.username})")

                # 加入组织
                member = OrganizationMember(
                    organization_id=org.id,
                    user_id=user.id,
                    role="admin" if i == 0 else "member",
                )
                db.add(member)
                db.commit()
            else:
                print(f"  ✅ 用户已存在: {user.email}")
            users.append(user)

        # ========== 2. 创建机器人 ==========
        print("\n🤖 创建机器人...")

        bots_data = [
            {
                "name": "客服助手",
                "description": "处理常见客户咨询问题",
                "welcome_message": "您好！我是智能客服助手，有什么可以帮助您的吗？",
                "bot_id": "bot_001",
            },
            {
                "name": "技术支持",
                "description": "协助解决技术相关问题",
                "welcome_message": "您好！我是技术支持助手，请问遇到什么技术问题？",
                "bot_id": "bot_002",
            },
            {
                "name": "销售顾问",
                "description": "产品咨询和销售引导",
                "welcome_message": "您好！我是销售顾问，欢迎咨询我们的产品！",
                "bot_id": "bot_003",
            },
        ]

        bots = []
        for bot_data in bots_data:
            bot = db.query(Bot).filter(Bot.name == bot_data["name"]).first()
            if not bot:
                bot = Bot(
                    id=str(uuid.uuid4()),
                    organization_id=org.id,
                    name=bot_data["name"],
                    description=bot_data["description"],
                    welcome_message=bot_data["welcome_message"],
                    bot_id=bot_data["bot_id"],
                    is_active=True,
                )
                db.add(bot)
                db.commit()
                db.refresh(bot)
                print(f"  ✅ 机器人创建成功: {bot.name}")
            else:
                print(f"  ✅ 机器人已存在: {bot.name}")
            bots.append(bot)

        # ========== 3. 创建对话和消息 ==========
        print("\n💬 创建对话和消息...")

        conversation_templates = [
            {
                "title": "产品咨询",
                "messages": [
                    {"role": "user", "content": "您好，我想了解一下你们的产品"},
                    {"role": "assistant", "content": "您好！我们提供智能客服SaaS系统，可以帮助企业高效管理客户咨询。"},
                    {"role": "user", "content": "价格是多少？"},
                    {"role": "assistant", "content": "我们有多个套餐可供选择，基础版每月99元，企业版请联系我们的销售团队。"},
                ],
            },
            {
                "title": "技术问题",
                "messages": [
                    {"role": "user", "content": "系统登录不了怎么办？"},
                    {"role": "assistant", "content": "请先检查您的账号和密码是否正确。如果还是不行，请清除浏览器缓存后重试。"},
                    {"role": "user", "content": "好的，我试试"},
                    {"role": "assistant", "content": "如果还有问题，请随时联系我们！"},
                ],
            },
            {
                "title": "功能咨询",
                "messages": [
                    {"role": "user", "content": "系统支持多语言吗？"},
                    {"role": "assistant", "content": "是的，我们的系统目前支持中文、英文、日文等多种语言。"},
                    {"role": "user", "content": "太好了！"},
                ],
            },
            {
                "title": "售后支持",
                "messages": [
                    {"role": "user", "content": "我想申请退款"},
                    {"role": "assistant", "content": "您好，请问是什么原因想要退款呢？我们会尽力解决问题。"},
                    {"role": "user", "content": "暂时不需要这个服务了"},
                    {"role": "assistant", "content": "明白了，您可以联系我们的客服团队办理退款手续。"},
                ],
            },
        ]

        conversation_count = 0
        message_count = 0

        for user in users[1:]:  # 跳过管理员
            for bot in bots:
                # 为每个用户和机器人的组合创建2-3个对话
                num_conversations = 2

                for i in range(num_conversations):
                    template = conversation_templates[i % len(conversation_templates)]
                    created_time = datetime.now() - timedelta(days=i, hours=i * 2)

                    # 创建对话
                    conversation = ConversationModel(
                        id=str(uuid.uuid4()),
                        bot_id=bot.id,
                        user_id=user.id,
                        organization_id=org.id,
                        title=template["title"],
                        message_count=0,
                        created_at=created_time,
                        updated_at=created_time,
                    )
                    db.add(conversation)
                    db.commit()
                    db.refresh(conversation)
                    conversation_count += 1

                    # 创建消息
                    msg_count = 0
                    for msg_data in template["messages"]:
                        msg_time = created_time + timedelta(minutes=msg_count)

                        # 映射角色
                        role_mapping = {
                            "user": "user",
                            "assistant": "assistant",
                        }

                        # 注意：user_id是必填字段，即使是assistant消息也需要提供
                        # 这里的逻辑是：所有消息都属于当前对话的用户
                        message = MessageModel(
                            id=str(uuid.uuid4()),
                            conversation_id=conversation.id,
                            user_id=user.id,  # 所有消息都属于当前用户
                            role=role_mapping.get(msg_data["role"], "user"),
                            content=msg_data["content"],
                            created_at=msg_time,
                        )
                        db.add(message)
                        msg_count += 1
                        message_count += 1

                    # 更新对话的消息计数
                    conversation.message_count = len(template["messages"])
                    db.commit()

        print(f"  ✅ 创建了 {conversation_count} 个对话")
        print(f"  ✅ 创建了 {message_count} 条消息")

        # ========== 4. 创建知识库 ==========
        print("\n📚 创建知识库...")

        kb = db.query(KnowledgeBase).filter(KnowledgeBase.name == "产品知识库").first()
        if not kb:
            kb = KnowledgeBase(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                name="产品知识库",
                description="包含产品介绍、使用指南、常见问题等文档",
                is_active=True,
                document_count=0,
            )
            db.add(kb)
            db.commit()
            db.refresh(kb)
            print(f"  ✅ 知识库创建成功: {kb.name}")
        else:
            print(f"  ✅ 知识库已存在: {kb.name}")

        # 创建文档
        documents_data = [
            {
                "title": "产品介绍",
                "content": """
# 智能客服SaaS系统

## 产品概述
我们的智能客服SaaS系统是基于先进AI技术的客户服务解决方案，帮助企业提升客户服务效率和满意度。

## 核心功能
1. 智能对话 - 基于Coze API的AI对话能力
2. 知识库管理 - 支持文档上传和管理
3. 多机器人管理 - 可配置多个专业机器人
4. 对话记录 - 完整的对话历史记录
5. 数据统计 - 实时的服务数据分析

## 技术优势
- 基于FastAPI的高性能后端
- React + TypeScript现代化前端
- 支持多租户架构
- RESTful API设计
""",
                "file_type": "md",
                "status": "completed",
            },
            {
                "title": "使用指南",
                "content": """
# 使用指南

## 快速开始

### 1. 登录系统
使用管理员账号登录后台管理系统。

### 2. 创建机器人
进入"机器人管理"页面，点击"创建机器人"，填写机器人信息。

### 3. 配置知识库
进入"知识库管理"页面，创建知识库并上传相关文档。

### 4. 开始使用
在聊天界面选择机器人，开始对话。

## 常见操作

### 用户管理
- 添加新用户
- 分配角色权限
- 查看用户活动

### 对话管理
- 查看对话记录
- 分析对话内容
- 导出对话数据
""",
                "file_type": "md",
                "status": "completed",
            },
            {
                "title": "常见问题FAQ",
                "content": """
# 常见问题

## Q1: 如何重置密码？
A: 点击登录页面的"忘记密码"，输入邮箱后按照提示操作即可。

## Q2: 支持哪些文件格式？
A: 知识库支持TXT、MD、PDF、DOC、DOCX等格式的文件。

## Q3: 如何创建多个机器人？
A: 在机器人管理页面，点击"创建机器人"按钮，每个机器人可以配置不同的专业领域。

## Q4: 数据安全如何保障？
A: 我们采用企业级数据加密，所有数据传输使用HTTPS加密，数据库定期备份。

## Q5: 如何联系技术支持？
A: 您可以通过以下方式联系我们：
- 邮箱：support@example.com
- 电话：400-xxx-xxxx
- 在线客服：系统右下角
""",
                "file_type": "md",
                "status": "completed",
            },
        ]

        for doc_data in documents_data:
            doc = db.query(Document).filter(
                Document.knowledge_base_id == kb.id,
                Document.title == doc_data["title"]
            ).first()

            if not doc:
                doc = Document(
                    id=str(uuid.uuid4()),
                    knowledge_base_id=kb.id,
                    title=doc_data["title"],
                    content=doc_data["content"],
                    file_type=doc_data["file_type"],
                    status=doc_data["status"],
                    uploaded_by=admin_user.id,  # 添加上传者
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                )
                db.add(doc)
                db.commit()
                print(f"  ✅ 文档创建成功: {doc.title}")

        # 更新知识库文档计数
        kb.document_count = len(documents_data)
        db.commit()

        # ========== 5. 打印统计信息 ==========
        print("\n" + "=" * 50)
        print("📊 测试数据生成完成！")
        print("=" * 50)

        user_count = db.query(User).count()
        org_count = db.query(Organization).count()
        bot_count = db.query(Bot).count()
        conv_count = db.query(ConversationModel).count()
        msg_count = db.query(MessageModel).count()
        kb_count = db.query(KnowledgeBase).count()
        doc_count = db.query(Document).count()

        print(f"\n📈 数据统计：")
        print(f"  用户数: {user_count}")
        print(f"  组织数: {org_count}")
        print(f"  机器人数: {bot_count}")
        print(f"  对话数: {conv_count}")
        print(f"  消息数: {msg_count}")
        print(f"  知识库数: {kb_count}")
        print(f"  文档数: {doc_count}")

        print(f"\n🔑 测试账号：")
        print(f"  管理员: admin@test.com / Admin123")
        print(f"  用户1: user1@test.com / User123456 (组织管理员)")
        print(f"  用户2: user2@test.com / User123456")
        print(f"  用户3: user3@test.com / User123456")

        print(f"\n🌐 访问地址：")
        print(f"  前端: http://localhost:3000")
        print(f"  后端: http://localhost:8000")
        print(f"  API文档: http://localhost:8000/docs")

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    generate_test_data()
