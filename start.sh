#!/bin/bash
# 快速启动脚本 - 开发环境

set -e

echo "🚀 智能客服 SaaS 平台 - 快速启动"
echo "================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 后端启动
echo "📦 启动后端服务..."
cd saas_backend

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv .venv
fi

# 激活虚拟环境
source .venv/bin/activate

# 安装依赖
echo "安装 Python 依赖..."
pip install -q -r requirements.txt

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."
    cat > .env << 'EOF'
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_customer_service

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# JWT 密钥（生产环境请修改）
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars

# CORS 前端地址
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# 调试模式
DEBUG=True
EOF
fi

# 后台启动后端
echo "启动后端 API (端口 8000)..."
python -m app.main > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"
echo $BACKEND_PID > ../backend.pid

cd ..

# 等待后端启动
echo "等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "⚠️  后端服务可能未正常启动，请检查日志: tail -f backend.log"
fi

echo ""

# 前端启动
echo "🎨 启动前端服务..."
cd saas_frontend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install --silent
fi

# 启动前端
echo "启动前端服务 (端口 3000)..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端 PID: $FRONTEND_PID"
echo $FRONTEND_PID > ../frontend.pid

cd ..

echo ""
echo "🎉 启动完成！"
echo "================================"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端 API: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
echo "查看日志:"
echo "  后端: tail -f backend.log"
echo "  前端: tail -f frontend.log"
echo ""
echo "停止服务:"
echo "  ./stop.sh"
echo ""
