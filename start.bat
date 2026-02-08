@echo off
REM 快速启动脚本 - Windows

echo ========================================
echo   智能客服 SaaS 平台 - 快速启动
echo ========================================
echo.

REM 后端启动
echo [1/2] 启动后端服务...
cd saas_backend

REM 检查虚拟环境
if not exist ".venv" (
    echo 创建虚拟环境...
    python -m venv .venv
)

REM 激活虚拟环境
call .venv\Scripts\activate.bat

REM 安装依赖
echo 安装 Python 依赖...
pip install -q -r requirements.txt

REM 检查 .env 文件
if not exist ".env" (
    echo 创建 .env 文件...
    (
        echo # 数据库配置
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_customer_service
        echo.
        echo # Redis 配置
        echo REDIS_URL=redis://localhost:6379/0
        echo.
        echo # JWT 密钥（生产环境请修改）
        echo SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
        echo.
        echo # CORS 前端地址
        echo CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
        echo.
        echo # 调试模式
        echo DEBUG=True
    ) > .env
)

REM 启动后端（在新窗口）
echo 启动后端 API (端口 8000)...
start "SaaS Backend" cmd /k ".venv\Scripts\activate.bat && python -m app.main"

cd ..

REM 等待后端启动
echo 等待后端服务启动...
timeout /t 3 /nobreak > nul

echo.
echo [2/2] 启动前端服务...
cd saas_frontend

REM 安装依赖
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install --silent
)

REM 启动前端（在新窗口）
echo 启动前端服务 (端口 3000)...
start "SaaS Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo   📱 前端地址: http://localhost:3000
echo   🔧 后端 API: http://localhost:8000
echo   📚 API 文档: http://localhost:8000/docs
echo.
echo   按任意键关闭此窗口...
pause > nul
