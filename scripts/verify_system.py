#!/usr/bin/env python3
"""
智能客服 SaaS 平台 - 系统验证脚本

验证所有核心功能是否正常工作
"""
import os
import sys
import asyncio
from typing import Dict, Any
from datetime import datetime, date

# 添加项目路径
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app.db.session import SessionLocal, init_db
    from app.models.user import User
    from app.models.organization import Organization, PlanType
    from app.models.organization_member import OrganizationMember, MemberRole
    from app.models.subscription import Subscription, SubscriptionStatus, BillingCycle
    from app.models.usage import UsageRecord
    from app.models.order import Order, OrderStatus, PaymentMethod
    from app.models.bot import Bot
    from app.models.conversation import Conversation
    from app.services.auth_service import AuthService
    from app.services.usage_service import UsageService
    from app.services.payment_service import PaymentService
    from app.schemas.user import UserRegister
    from app.schemas.subscription import SUBSCRIPTION_PLANS
    from decimal import Decimal
except ImportError as e:
    print(f"❌ 导入错误: {e}")
    print("请确保已安装所有依赖: pip install -r requirements.txt")
    sys.exit(1)


class VerificationTester:
    """系统验证测试器"""

    def __init__(self):
        self.db = None
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": [],
        }

    def setup(self):
        """初始化测试环境"""
        print("=" * 60)
        print("🔍 智能客服 SaaS 平台 - 系统验证")
        print("=" * 60)
        print()

        try:
            self.db = SessionLocal()
            print("✅ 数据库连接成功")
            self.results["passed"].append("数据库连接")
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            self.results["failed"].append("数据库连接")
            return False

        return True

    def teardown(self):
        """清理测试环境"""
        if self.db:
            self.db.close()
            print("\n✅ 测试完成，数据库连接已关闭")

    def test_database_models(self):
        """测试 1: 验证所有数据库模型"""
        print("\n📋 测试 1: 数据库模型验证")
        print("-" * 60)

        models = {
            "User": User,
            "Organization": Organization,
            "OrganizationMember": OrganizationMember,
            "Subscription": Subscription,
            "UsageRecord": UsageRecord,
            "Order": Order,
            "Bot": Bot,
            "Conversation": Conversation,
        }

        for model_name, model_class in models.items():
            try:
                # 尝试查询模型
                count = self.db.query(model_class).count()
                print(f"✅ {model_name}: {count} 条记录")
                self.results["passed"].append(f"{model_name} 模型")
            except Exception as e:
                print(f"❌ {model_name}: {e}")
                self.results["failed"].append(f"{model_name} 模型")

    def test_user_registration(self):
        """测试 2: 用户注册功能"""
        print("\n📋 测试 2: 用户注册功能")
        print("-" * 60)

        try:
            auth_service = AuthService(self.db)

            # 创建测试用户
            test_email = f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
            user_data = UserRegister(
                email=test_email,
                password="TestPassword123",
                username="testuser"
            )

            user = auth_service.register_user(user_data)

            print(f"✅ 用户注册成功: {user.email}")
            print(f"   用户 ID: {user.id}")
            print(f"   是否激活: {user.is_active}")

            # 验证默认组织已创建
            org_count = self.db.query(Organization).filter(
                Organization.owner_id == user.id
            ).count()

            if org_count > 0:
                print(f"✅ 默认组织已创建 ({org_count} 个)")
                self.results["passed"].append("用户注册和默认组织创建")
            else:
                print(f"⚠️  默认组织未创建")
                self.results["warnings"].append("默认组织未创建")

            return user

        except Exception as e:
            print(f"❌ 用户注册失败: {e}")
            self.results["failed"].append("用户注册")
            return None

    def test_user_authentication(self):
        """测试 3: 用户认证功能"""
        print("\n📋 测试 3: 用户认证功能")
        print("-" * 60)

        try:
            auth_service = AuthService(self.db)

            # 获取测试用户
            user = self.db.query(User).first()
            if not user:
                print("❌ 没有找到测试用户")
                self.results["failed"].append("用户认证")
                return

            # 测试登录（需要密码哈希）
            if user.password_hash:
                print("✅ 用户密码哈希存在")

            # 测试 Token 生成
            from app.core.security import create_access_token, create_refresh_token

            access_token = create_access_token(str(user.id))
            refresh_token = create_refresh_token(str(user.id))

            print(f"✅ Token 生成成功")
            print(f"   Access Token: {access_token[:20]}...")
            print(f"   Refresh Token: {refresh_token[:20]}...")

            self.results["passed"].append("用户认证和 Token 生成")

        except Exception as e:
            print(f"❌ 用户认证失败: {e}")
            self.results["failed"].append("用户认证")

    def test_organization_management(self):
        """测试 4: 组织管理功能"""
        print("\n📋 测试 4: 组织管理功能")
        print("-" * 60)

        try:
            # 获取用户
            user = self.db.query(User).first()
            if not user:
                print("❌ 没有找到测试用户")
                return

            # 检查组织成员
            memberships = self.db.query(OrganizationMember).filter(
                OrganizationMember.user_id == user.id
            ).all()

            print(f"✅ 用户属于 {len(memberships)} 个组织")

            for membership in memberships:
                org = self.db.query(Organization).filter(
                    Organization.id == membership.organization_id
                ).first()

                if org:
                    print(f"   - {org.name} ({membership.role})")

            self.results["passed"].append("组织管理")

        except Exception as e:
            print(f"❌ 组织管理失败: {e}")
            self.results["failed"].append("组织管理")

    def test_subscription_plans(self):
        """测试 5: 订阅计划配置"""
        print("\n📋 测试 5: 订阅计划配置")
        print("-" * 60)

        try:
            for plan_key, plan in SUBSCRIPTION_PLANS.items():
                print(f"\n✅ {plan.name} ({plan.plan_type})")
                print(f"   月付: ¥{plan.price_monthly}")
                print(f"   年付: ¥{plan.price_yearly}")
                print(f"   功能数量: {len(plan.features)}")
                print(f"   限制: {plan.limits}")

            self.results["passed"].append("订阅计划配置")

        except Exception as e:
            print(f"❌ 订阅计划配置错误: {e}")
            self.results["failed"].append("订阅计划配置")

    def test_usage_tracking(self):
        """测试 6: 使用量追踪功能"""
        print("\n📋 测试 6: 使用量追踪功能")
        print("-" * 60)

        try:
            usage_service = UsageService(self.db)

            # 获取组织和用户
            org = self.db.query(Organization).first()
            user = self.db.query(User).first()

            if not org or not user:
                print("❌ 缺少测试数据")
                return

            # 记录测试使用量
            record = usage_service.record_usage(
                organization_id=org.id,
                user_id=user.id,
                resource_type="message",
                quantity=1,
                metadata={"test": True}
            )

            print(f"✅ 使用量记录成功: {record.id}")

            # 获取使用量统计
            stats = usage_service.get_usage_stats(org.id)

            print(f"✅ 使用量统计:")
            print(f"   消息使用: {stats.messages_used} / {stats.messages_limit}")
            print(f"   API 调用: {stats.api_calls_used} / {stats.api_calls_limit}")
            print(f"   存储使用: {stats.storage_used_mb} MB / {stats.storage_limit_mb} MB")
            print(f"   是否超限: {stats.is_over_limit}")

            self.results["passed"].append("使用量追踪")

        except Exception as e:
            print(f"❌ 使用量追踪失败: {e}")
            self.results["failed"].append("使用量追踪")

    def test_payment_integration(self):
        """测试 7: 支付集成（模拟）"""
        print("\n📋 测试 7: 支付集成（模拟）")
        print("-" * 60)

        try:
            payment_service = PaymentService(self.db)

            # 获取组织和用户
            org = self.db.query(Organization).first()
            user = self.db.query(User).first()

            if not org or not user:
                print("❌ 缺少测试数据")
                return

            # 创建模拟订单
            order = payment_service.create_order(
                organization_id=org.id,
                user_id=user.id,
                amount=Decimal("199.00"),
                payment_method=PaymentMethod.WECHAT,
                plan_type="pro",
                billing_cycle="monthly"
            )

            print(f"✅ 订单创建成功")
            print(f"   订单号: {order.order_no}")
            print(f"   金额: ¥{order.amount}")
            print(f"   支付方式: {order.payment_method}")

            # 模拟支付成功
            payment_service._activate_subscription(order)

            print(f"✅ 订阅激活成功")

            # 检查订阅状态
            subscription = self.db.query(Subscription).filter(
                Subscription.organization_id == org.id
            ).first()

            if subscription:
                print(f"✅ 订阅状态: {subscription.status}")
                print(f"   计划类型: {subscription.plan_type}")
            else:
                print(f"⚠️  订阅未找到")

            self.results["passed"].append("支付集成")

        except Exception as e:
            print(f"❌ 支付集成失败: {e}")
            self.results["failed"].append("支付集成")

    def test_api_endpoints(self):
        """测试 8: API 端点（健康检查）"""
        print("\n📋 测试 8: API 端点")
        print("-" * 60)

        try:
            import requests

            # 测试健康检查端点
            response = requests.get("http://localhost:8000/health", timeout=5)

            if response.status_code == 200:
                print("✅ 健康检查端点正常")
                print(f"   响应: {response.json()}")
                self.results["passed"].append("API 健康检查")
            else:
                print(f"⚠️  API 服务未运行或响应异常")
                self.results["warnings"].append("API 服务未运行")

        except requests.exceptions.ConnectionError:
            print("⚠️  API 服务未启动（这是正常的，如果您还没有启动服务）")
            self.results["warnings"].append("API 服务未启动")
        except Exception as e:
            print(f"❌ API 端点测试失败: {e}")
            self.results["failed"].append("API 端点")

    def print_summary(self):
        """打印测试总结"""
        print("\n" + "=" * 60)
        print("📊 测试总结")
        print("=" * 60)

        total = len(self.results["passed"]) + len(self.results["failed"])
        passed = len(self.results["passed"])
        failed = len(self.results["failed"])
        warnings = len(self.results["warnings"])

        print(f"\n总计: {total} 项测试")
        print(f"✅ 通过: {passed} 项")
        print(f"❌ 失败: {failed} 项")
        print(f"⚠️  警告: {warnings} 项")

        if self.results["failed"]:
            print("\n❌ 失败的测试:")
            for item in self.results["failed"]:
                print(f"   - {item}")

        if self.results["warnings"]:
            print("\n⚠️  警告:")
            for item in self.results["warnings"]:
                print(f"   - {item}")

        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n成功率: {success_rate:.1f}%")

        if failed == 0:
            print("\n🎉 所有核心功能验证通过！")
        else:
            print(f"\n⚠️  有 {failed} 项测试失败，请检查相关功能")

    def run_all_tests(self):
        """运行所有测试"""
        if not self.setup():
            return

        try:
            # 初始化数据库（如果需要）
            # init_db()

            self.test_database_models()
            self.test_user_registration()
            self.test_user_authentication()
            self.test_organization_management()
            self.test_subscription_plans()
            self.test_usage_tracking()
            self.test_payment_integration()
            self.test_api_endpoints()

            self.print_summary()

        finally:
            self.teardown()


def main():
    """主函数"""
    tester = VerificationTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
