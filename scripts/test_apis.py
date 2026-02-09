#!/usr/bin/env python3
"""测试API端点"""
import requests
import json

BASE_URL = "http://localhost:8000"

# 1. 登录获取token
print("🔑 登录...")
login_response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    data={"username": "admin@test.com", "password": "Admin123"}  # 使用form-data
)
login_response.raise_for_status()
token = login_response.json()["access_token"]
print(f"✅ 登录成功，Token: {token[:50]}...")

headers = {"Authorization": f"Bearer {token}"}

# 2. 测试用户API
print("\n👥 测试用户API...")
users_response = requests.get(f"{BASE_URL}/api/v1/admin/users", headers=headers)
users_response.raise_for_status()
users_data = users_response.json()
print(f"✅ 用户API正常，共 {users_data['total']} 个用户")

# 3. 测试知识库API
print("\n📚 测试知识库API...")
kb_response = requests.get(f"{BASE_URL}/api/v1/admin/knowledge", headers=headers)
kb_response.raise_for_status()
kb_data = kb_response.json()
print(f"✅ 知识库API正常，共 {kb_data['total']} 个知识库")

# 4. 测试对话API
print("\n💬 测试对话API...")
conv_response = requests.get(f"{BASE_URL}/api/v1/conversations/admin/all", headers=headers)
conv_response.raise_for_status()
conv_data = conv_response.json()
print(f"✅ 对话API正常，共 {conv_data['total']} 个对话")

print("\n" + "=" * 50)
print("✅ 所有API测试通过！")
print("=" * 50)
print(f"\n📊 数据统计：")
print(f"  用户数: {users_data['total']}")
print(f"  知识库数: {kb_data['total']}")
print(f"  对话数: {conv_data['total']}")
