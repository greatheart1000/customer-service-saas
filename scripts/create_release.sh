#!/bin/bash
# 创建版本标签和发布脚本

# 版本号
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "用法: ./create_release.sh v1.0.0"
    exit 1
fi

echo "🏷️  创建版本标签: $VERSION"

# 1. 创建带注释的标签
git tag -a "$VERSION" -m "Release $VERSION

## 主要功能
- 多租户架构实现
- 客服工作台界面
- 嵌入式聊天组件

## 技术栈
- 前端: React 18 + TypeScript
- 后端: FastAPI + Python
- 算法: RAG + LangChain

## 文档
- docs/MULTI_TENANT_ARCHITECTURE.md
- docs/AGENT_DASHBOARD_SUMMARY.md
"

# 2. 推送标签到远程
git push origin "$VERSION"

echo "✅ 版本 $VERSION 已创建并推送"
echo "📦 查看所有版本: git tag -l"
echo "🔍 查看版本详情: git show $VERSION"
