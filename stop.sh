#!/bin/bash
# 停止服务脚本

echo "🛑 停止智能客服 SaaS 平台服务"
echo "================================"

# 停止后端
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "停止后端服务 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || echo "后端进程已停止"
    rm backend.pid
else
    echo "后端 PID 文件不存在，尝试查找进程..."
    pkill -f "python -m app.main" || echo "未找到后端进程"
fi

# 停止前端
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || echo "前端进程已停止"
    rm frontend.pid
else
    echo "前端 PID 文件不存在，尝试查找进程..."
    pkill -f "vite" || echo "未找到前端进程"
fi

echo ""
echo "✅ 服务已停止"
