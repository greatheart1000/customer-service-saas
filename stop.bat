@echo off
REM 停止服务脚本 - Windows

echo ========================================
echo   停止智能客服 SaaS 平台服务
echo ========================================
echo.

echo 停止后端和前端服务...
taskkill /FI "WINDOWTITLE eq SaaS Backend*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq SaaS Frontend*" /F > nul 2>&1

echo.
echo ✅ 服务已停止
echo.
timeout /t 2 /nobreak > nul
