#!/bin/bash
# 测试脚本 - 验证所有功能

set -e

echo "🧪 智能客服 SaaS 平台 - 功能测试"
echo "================================"
echo ""

BASE_URL="http://localhost:8000"
API_URL="$BASE_URL/api/v1"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -n "测试 $name ... "

    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if echo "$response" | grep -q "error\|Error\|404\|500"; then
        echo -e "${RED}失败${NC}"
        echo "  响应: $response"
        return 1
    else
        echo -e "${GREEN}成功${NC}"
        return 0
    fi
}

# 1. 健康检查
echo "1. 健康检查"
response=$(curl -s "$BASE_URL/health")
if echo "$response" | grep -q "healthy"; then
    echo -e "   ${GREEN}✓${NC} 后端服务运行正常"
else
    echo -e "   ${RED}✗${NC} 后端服务未响应"
    exit 1
fi

# 2. 测试用户注册
echo ""
echo "2. 用户注册"
email="test_$(date +%s)@example.com"
test_api "用户注册" "POST" "/auth/register" \
    "{\"email\":\"$email\",\"password\":\"Test123456\",\"username\":\"testuser\"}"

# 3. 测试邮箱登录
echo ""
echo "3. 邮箱登录"
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$email&password=Test123456")

if echo "$login_response" | grep -q "access_token"; then
    echo -e "   ${GREEN}✓${NC} 邮箱登录成功"
    token=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "   ${RED}✗${NC} 邮箱登录失败"
    echo "  响应: $login_response"
fi

# 4. 测试发送验证码
echo ""
echo "4. 短信验证码"
sms_response=$(curl -s -X POST "$API_URL/auth/sms/send-code" \
    -H "Content-Type: application/json" \
    -d '{"phone":"13800138000"}')

if echo "$sms_response" | grep -q "message\|debug_code"; then
    echo -e "   ${GREEN}✓${NC} 验证码发送成功"
    echo "  响应: $sms_response"
else
    echo -e "   ${YELLOW}⚠${NC} 验证码发送失败（可能需要配置短信服务）"
fi

# 5. 测试微信登录二维码
echo ""
echo "5. 微信登录"
qr_response=$(curl -s -X GET "$API_URL/auth/wechat/qr-code")

if echo "$qr_response" | grep -q "qr_url\|state"; then
    echo -e "   ${GREEN}✓${NC} 微信二维码生成成功"
else
    echo -e "   ${YELLOW}⚠${NC} 微信二维码生成失败（可能需要配置微信应用）"
fi

# 6. 测试当前用户信息
echo ""
echo "6. 获取用户信息"
if [ -n "$token" ]; then
    me_response=$(curl -s -X GET "$API_URL/auth/me" \
        -H "Authorization: Bearer $token")

    if echo "$me_response" | grep -q "email\|id"; then
        echo -e "   ${GREEN}✓${NC} 获取用户信息成功"
    else
        echo -e "   ${RED}✗${NC} 获取用户信息失败"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} 跳过（未获取到 Token）"
fi

# 7. 测试 API 文档
echo ""
echo "7. API 文档"
docs_response=$(curl -s "$BASE_URL/docs")
if echo "$docs_response" | grep -q "Swagger\|swagger"; then
    echo -e "   ${GREEN}✓${NC} API 文档可访问"
else
    echo -e "   ${RED}✗${NC} API 文档不可访问"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 测试完成！${NC}"
echo ""
echo "📚 访问 API 文档: $BASE_URL/docs"
echo "🎨 访问前端页面: http://localhost:3000"
echo ""
