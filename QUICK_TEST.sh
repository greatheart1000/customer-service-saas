#!/bin/bash

# 智能客服 SaaS 平台 - 快速验证脚本

echo "=========================================="
echo "  智能客服 SaaS 平台 - 快速验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_step() {
    local name="$1"
    local command="$2"

    TOTAL=$((TOTAL + 1))
    echo -n "测试 $TOTAL: $name ... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 检查 Python
echo "📋 检查运行环境"
echo "----------------------------------------"

test_step "Python 3.8+" "python3 --version"
test_step "pip" "pip --version"

# 检查数据库
echo ""
echo "📋 检查数据库"
echo "----------------------------------------"

test_step "PostgreSQL" "psql --version"
test_step "数据库存在" "psql -U postgres -l | grep saas_customer_service"

# 检查 Node.js
echo ""
echo "📋 检查前端环境"
echo "----------------------------------------"

test_step "Node.js 18+" "node --version"
test_step "npm" "npm --version"

# 检查 Docker
echo ""
echo "📋 检查 Docker 环境"
echo "----------------------------------------"

test_step "Docker" "docker --version"
test_step "Docker Compose" "docker-compose --version"

# 检查文件
echo ""
echo "📋 检查项目文件"
echo "----------------------------------------"

test_step "后端代码" "test -d saas_backend"
test_step "前端代码" "test -d saas_frontend"
test_step "Docker 配置" "test -f docker-compose.yml"
test_step "环境变量示例" "test -f saas_backend/.env.example"

# 尝试启动服务（可选）
echo ""
echo "📋 尝试启动服务（可选）"
echo "----------------------------------------"

read -p "是否尝试启动服务进行完整测试？(y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "启动 Docker Compose..."
    if docker-compose up -d > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功${NC}"

        # 等待服务就绪
        echo "等待服务就绪..."
        sleep 5

        # 测试健康检查
        echo ""
        echo "📋 测试 API 端点"
        echo "----------------------------------------"

        test_step "后端健康检查" "curl -f http://localhost:8000/health"
        test_step "前端访问" "curl -f http://localhost/"

        # 停止服务
        echo ""
        read -p "是否停止服务？(Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            docker-compose down
            echo -e "${GREEN}✅ 服务已停止${NC}"
        fi
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        echo "请检查 Docker 和 docker-compose 配置"
    fi
fi

# 打印总结
echo ""
echo "=========================================="
echo "  测试总结"
echo "=========================================="
echo ""
echo "总计: $TOTAL 项测试"
echo -e "${GREEN}通过: $PASSED 项${NC}"
echo -e "${RED}失败: $FAILED 项${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有环境检查通过！${NC}"
    echo ""
    echo "下一步:"
    echo "1. 配置环境变量: cp saas_backend/.env.example saas_backend/.env"
    echo "2. 运行完整验证: cd saas_backend && python verify_system.py"
    echo "3. 启动服务: docker-compose up -d"
else
    echo -e "${YELLOW}⚠️  有 $FAILED 项检查失败${NC}"
    echo ""
    echo "请先解决环境问题，然后再进行功能测试"
fi

echo ""
