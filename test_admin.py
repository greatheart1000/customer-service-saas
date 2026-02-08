#!/usr/bin/env python3
"""
测试管理员登录和核心功能
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# 管理员账号
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin123456"


def test_health():
    """测试健康检查"""
    print("\n=== 测试健康检查 ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    assert response.status_code == 200
    print("✅ 健康检查通过")


def test_register():
    """测试用户注册"""
    print("\n=== 测试用户注册 ===")

    # 测试重复注册（应该失败）
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "username": "Administrator"
        }
    )
    print(f"状态码: {response.status_code}")
    if response.status_code == 400:
        print("✅ 重复注册被正确阻止")
    else:
        print(f"响应: {response.json()}")


def test_login():
    """测试管理员登录"""
    print("\n=== 测试管理员登录 ===")

    # OAuth2 登录使用 form-data 格式，username 字段实际是邮箱
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={
            "username": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
    )

    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 登录成功")
        print(f"访问令牌: {data.get('access_token', '')[:50]}...")
        print(f"刷新令牌: {data.get('refresh_token', '')[:50]}...")
        return data.get('access_token')
    else:
        print(f"❌ 登录失败: {response.text}")
        return None


def test_get_profile(token):
    """测试获取用户信息"""
    print("\n=== 测试获取用户信息 ===")

    response = requests.get(
        f"{BASE_URL}/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 获取用户信息成功")
        print(f"用户邮箱: {data.get('email')}")
        print(f"用户名: {data.get('username')}")
        print(f"是否激活: {data.get('is_active')}")
        print(f"是否验证: {data.get('is_verified')}")
    else:
        print(f"❌ 获取用户信息失败: {response.text}")


def test_get_organizations(token):
    """测试获取组织列表"""
    print("\n=== 测试获取组织列表 ===")

    response = requests.get(
        f"{BASE_URL}/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"}
    )

    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            print(f"✅ 获取组织列表成功")
            print(f"组织数量: {len(data)}")
            for org in data:
                print(f"  - {org.get('name')} (计划: {org.get('plan_type')})")
        elif isinstance(data, dict) and 'items' in data:
            print(f"✅ 获取组织列表成功")
            print(f"组织数量: {len(data['items'])}")
            for org in data['items']:
                print(f"  - {org.get('name')} (计划: {org.get('plan_type')})")
    else:
        print(f"❌ 获取组织列表失败: {response.text}")


def test_api_docs():
    """测试 API 文档"""
    print("\n=== 测试 API 文档 ===")

    response = requests.get(f"{BASE_URL}/docs")
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        print("✅ API 文档可访问: http://localhost:8000/docs")
    else:
        print("❌ API 文档不可访问")


def main():
    """运行所有测试"""
    print("=" * 50)
    print("智能客服系统 - 管理员功能测试")
    print("=" * 50)

    try:
        test_health()
        test_register()
        token = test_login()

        if token:
            test_get_profile(token)
            test_get_organizations(token)
        else:
            print("❌ 无法继续测试，因为登录失败")

        test_api_docs()

        print("\n" + "=" * 50)
        print("测试完成！")
        print("=" * 50)
        print("\n📋 管理员登录信息:")
        print(f"   邮箱: {ADMIN_EMAIL}")
        print(f"   密码: {ADMIN_PASSWORD}")
        print(f"\n🔗 访问地址:")
        print(f"   前端: http://localhost:3000")
        print(f"   后端: http://localhost:8000")
        print(f"   API 文档: http://localhost:8000/docs")

    except requests.exceptions.ConnectionError:
        print("\n❌ 无法连接到服务器，请确保后端服务正在运行")
        print("启动后端: cd saas_backend && python -m app.main")
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")


if __name__ == "__main__":
    main()
