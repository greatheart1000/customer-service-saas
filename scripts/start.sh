#!/bin/bash

# 智能客服 SaaS 平台 - 启动脚本

echo "========================================"
echo "  智能客服 SaaS 平台 - 后端服务"
echo "========================================"
echo ""

# 检查 Python 版本
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python 版本: $python_version"

# 检查是否安装了依赖
if [ ! -d "venv" ]; then
    echo ""
    echo "创建虚拟环境..."
    python3 -m venv venv
    echo "✓ 虚拟环境创建完成"
fi

# 激活虚拟环境
echo ""
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo ""
echo "检查并安装依赖..."
pip install -q -r requirements.txt
echo "✓ 依赖安装完成"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  警告: .env 文件不存在"
    echo "从 .env.example 创建 .env 文件..."
    cp .env.example .env
    echo "✓ .env 文件已创建"
    echo "⚠️  请编辑 .env 文件并配置正确的参数"
    echo ""
    read -p "按回车键继续..."
fi

# 启动服务
echo ""
echo "========================================"
echo "  启动 FastAPI 服务器"
echo "========================================"
echo ""
echo "API 文档: http://localhost:8000/docs"
echo "健康检查: http://localhost:8000/health"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

python -m app.main
