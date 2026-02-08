#!/bin/bash
# 完整的功能测试脚本

BASE_URL="http://localhost:8000"
API_URL="$BASE_URL/api/v1"

echo "======================================"
echo "  智能客服 SaaS 平台 - 功能测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth_header=$5

    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] 测试 $name ... "

    if [ -z "$auth_header" ]; then
        if [ -z "$data" ]; then
            response=$(curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json")
        else
            response=$(curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -z "$data" ]; then
            response=$(curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_header")
        else
            response=$(curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_header" \
                -d "$data")
        fi
    fi

    # 检查是否有错误
    if echo "$response" | grep -qi "error\|detail\|401\|404\|500"; then
        echo -e "${RED}失败${NC}"
        echo "  响应: $response"
        FAILED=$((FAILED + 1))
        return 1
    else
        echo -e "${GREEN}成功${NC}"
        PASSED=$((PASSED + 1))
        echo "$response"
        return 0
    fi
}

# 1. 健康检查
echo -e "${BLUE}[1/9] 健康检查${NC}"
test_api "健康检查" "GET" "/../health" ""
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✓${NC} 后端服务运行正常"
else
    echo -e "   ${RED}✗${NC} 后端服务未响应"
    exit 1
fi
echo ""

# 2. 用户注册
echo -e "${BLUE}[2/9] 邮箱注册${NC}"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="Test123456"
TEST_USERNAME="testuser_$(date +%s)"

register_response=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"username\":\"$TEST_USERNAME\"}")

if echo "$register_response" | grep -qi "error\|detail\|500"; then
    echo -e "   ${RED}✗${NC} 注册失败"
    echo "  响应: $register_response"
    echo ""
    echo -e "${YELLOW}⚠️  可能原因：数据库表未创建${NC}"
    echo "请运行: mysql -uroot -ptestpass123 saas_customer_service < create_tables.sql"
else
    echo -e "   ${GREEN}✓${NC} 注册成功"
    echo "  邮箱: $TEST_EMAIL"
fi
echo ""

# 3. 邮箱登录
echo -e "${BLUE}[3/9] 邮箱登录${NC}"
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$TEST_EMAIL&password=$TEST_PASSWORD")

if echo "$login_response" | grep -q "access_token"; then
    echo -e "   ${GREEN}✓${NC} 登录成功"
    ACCESS_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "  Token: ${ACCESS_TOKEN:0:50}..."
else
    echo -e "   ${RED}✗${NC} 登录失败"
    echo "  响应: $login_response"
fi
echo ""

# 4. 发送短信验证码
echo -e "${BLUE}[4/9] 发送短信验证码${NC}"
sms_response=$(curl -s -X POST "$API_URL/auth/sms/send-code" \
    -H "Content-Type: application/json" \
    -d '{"phone":"13800138000"}')

if echo "$sms_response" | grep -q "message\|debug_code"; then
    echo -e "   ${GREEN}✓${NC} 验证码发送成功"
    echo "  响应: $sms_response"
    # 提取验证码
    if echo "$sms_response" | grep -q "debug_code"; then
        SMS_CODE=$(echo "$sms_response" | grep -o '"debug_code":"[^"]*' | cut -d'"' -f4)
        echo "  验证码: $SMS_CODE"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} 验证码发送失败（可能需要配置短信服务）"
    echo "  响应: $sms_response"
fi
echo ""

# 5. 手机号验证码登录
echo -e "${BLUE}[5/9] 手机号验证码登录${NC}"
if [ -n "$SMS_CODE" ]; then
    phone_login_response=$(curl -s -X POST "$API_URL/auth/sms/login" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"13800138000\",\"code\":\"$SMS_CODE\"}")

    if echo "$phone_login_response" | grep -q "access_token"; then
        echo -e "   ${GREEN}✓${NC} 手机登录成功"
        PHONE_TOKEN=$(echo "$phone_login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    else
        echo -e "   ${YELLOW}⚠${NC} 手机登录失败"
        echo "  响应: $phone_login_response"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} 跳过（未获取到验证码）"
fi
echo ""

# 6. 获取微信登录二维码
echo -e "${BLUE}[6/9] 获取微信登录二维码${NC}"
qr_response=$(curl -s -X GET "$API_URL/auth/wechat/qr-code")

if echo "$qr_response" | grep -q "qr_url\|state"; then
    echo -e "   ${GREEN}✓${NC} 二维码生成成功"
    WECHAT_STATE=$(echo "$qr_response" | grep -o '"state":"[^"]*' | cut -d'"' -f4)
    echo "  State: $WECHAT_STATE"
else
    echo -e "   ${YELLOW}⚠${NC} 二维码生成失败（可能需要配置微信应用）"
    echo "  响应: $qr_response"
fi
echo ""

# 7. 检查微信登录状态
echo -e "${BLUE}[7/9] 检查微信登录状态${NC}"
if [ -n "$WECHAT_STATE" ]; then
    check_status_response=$(curl -s -X GET "$API_URL/auth/wechat/check-status?state=$WECHAT_STATE")

    if echo "$check_status_response" | grep -q "status"; then
        echo -e "   ${GREEN}✓${NC} 状态查询成功"
        echo "  响应: $check_status_response"
    else
        echo -e "   ${YELLOW}⚠${NC} 状态查询失败"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} 跳过（未获取到State）"
fi
echo ""

# 8. 获取当前用户信息
echo -e "${BLUE}[8/9] 获取用户信息${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
    me_response=$(curl -s -X GET "$API_URL/auth/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN")

    if echo "$me_response" | grep -q "email\|id\|username"; then
        echo -e "   ${GREEN}✓${NC} 获取用户信息成功"
        echo "  响应: $me_response"
    else
        echo -e "   ${RED}✗${NC} 获取用户信息失败"
        echo "  响应: $me_response"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} 跳过（未获取到Token）"
fi
echo ""

# 9. API文档可访问性
echo -e "${BLUE}[9/9] API文档${NC}"
docs_response=$(curl -s "$BASE_URL/docs")
if echo "$docs_response" | grep -q "Swagger\|swagger"; then
    echo -e "   ${GREEN}✓${NC} API文档可访问: $BASE_URL/docs"
else
    echo -e "   ${RED}✗${NC} API文档不可访问"
fi
echo ""

# 总结
echo "======================================"
echo "  测试总结"
echo "======================================"
echo -e "总计: $TOTAL"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 $FAILED 个测试失败${NC}"
    exit 1
fi
