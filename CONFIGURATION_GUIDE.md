# 智能客服系统 - 完整配置指南

## 📱 访问系统

### 1. 前端界面访问
打开浏览器访问：http://localhost:3000

**主要页面：**
- 登录页：http://localhost:3000/login
- 注册页：http://localhost:3000/register
- 仪表盘：http://localhost:3000/dashboard（登录后）

### 2. API 文档访问
打开浏览器访问：http://localhost:8000/docs

**交互式 API 测试：**
- 可以直接在浏览器中测试所有 API
- 无需编写代码即可调用接口
- 查看请求/响应格式

**其他文档：**
- ReDoc：http://localhost:8000/redoc
- OpenAPI JSON：http://localhost:8000/openapi.json

---

## 🔐 管理员登录

### 方式一：通过前端界面
1. 访问 http://localhost:3000/login
2. 输入邮箱：`admin@example.com`
3. 输入密码：`Admin123456`
4. 点击"登录"

### 方式二：通过 API
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=Admin123456"
```

### 方式三：通过 Swagger 文档
1. 访问 http://localhost:8000/docs
2. 找到 `/api/v1/auth/login` 接口
3. 点击 "Try it out"
4. 输入用户名和密码
5. 点击 "Execute"

---

## 🚀 核心功能测试

### 1. 用户管理
```bash
# 获取当前用户信息
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 更新用户信息
curl -X PUT "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "新用户名"}'
```

### 2. 组织管理
```bash
# 获取组织列表
curl -X GET "http://localhost:8000/api/v1/organizations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 创建新组织
curl -X POST "http://localhost:8000/api/v1/organizations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "新组织", "plan_type": "free"}'
```

### 3. 对话管理
```bash
# 创建对话
curl -X POST "http://localhost:8000/api/v1/conversations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bot_id": "YOUR_BOT_ID", "message": "你好"}'

# 获取对话历史
curl -X GET "http://localhost:8000/api/v1/conversations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ⚙️ 高级功能配置

### 1. 短信服务配置

#### 阿里云短信服务
编辑 `saas_backend/.env` 文件：

```bash
# 短信服务提供商
SMS_PROVIDER=aliyun

# 阿里云访问密钥
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret

# 短信签名
SMS_SIGN_NAME=智能客服平台

# 短信模板代码
SMS_TEMPLATE_CODE=SMS_123456789
```

**获取阿里云密钥：**
1. 访问阿里云控制台：https://console.aliyun.com/
2. 进入"AccessKey 管理"
3. 创建 AccessKey
4. 进入"短信服务"控制台
5. 申请签名和模板

#### 腾讯云短信服务
```bash
SMS_PROVIDER=tencent

# 腾讯云密钥
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_SMS_APP_ID=your_app_id
TENCENT_SMS_SIGN_NAME=您的签名
TENCENT_SMS_TEMPLATE_ID=your_template_id
```

**测试短信发送：**
```bash
# 发送验证码
curl -X POST "http://localhost:8000/api/v1/auth/sms/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'

# 使用验证码登录
curl -X POST "http://localhost:8000/api/v1/auth/sms/login" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456"}'
```

### 2. 微信登录配置

#### 步骤一：申请微信开放平台账号
1. 访问微信开放平台：https://open.weixin.qq.com/
2. 注册并创建网站应用
3. 获取 AppID 和 AppSecret

#### 步骤二：配置环境变量
编辑 `saas_backend/.env`：

```bash
# 微信开放平台配置
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=abcdefgh1234567890
WECHAT_REDIRECT_URI=http://localhost:8000/api/v1/auth/wechat/callback
```

#### 步骤三：测试微信登录
```bash
# 获取微信登录二维码
curl -X GET "http://localhost:8000/api/v1/auth/wechat/qr-code"

# 检查登录状态
curl -X GET "http://localhost:8000/api/v1/auth/wechat/check-status?state=YOUR_STATE"
```

### 3. 支付功能配置

#### 微信支付
```bash
# 微信支付配置
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your_api_key_here
WECHAT_PAY_CERT_PATH=/path/to/cert.pem
WECHAT_PAY_KEY_PATH=/path/to/key.pem
```

#### 支付宝
```bash
# 支付宝配置
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=alipay_public_key
```

### 4. Coze 机器人配置

系统已配置您的 Coze Token：
```bash
COZE_API_TOKEN=pat_fHoypKwkf2V9XkOJdrsZlqrImJhPKXMRRb9gYoGptbPtyOASQtJpoPlnv5Ry4J4m
COZE_API_BASE=https://api.coze.cn
COZE_BOT_ID=7482601981945839670
```

**测试 Coze 对话：**
```bash
# 发送消息给机器人
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bot_id": "7482601981945839670", "message": "你好"}'
```

### 5. Redis 缓存配置（可选）

#### 安装 Redis
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# 启动 Redis
redis-server
```

#### 配置环境变量
```bash
REDIS_URL=redis://localhost:6379/0
```

---

## 🧪 测试脚本

### 完整功能测试
```bash
cd /mnt/d/project/coze-py/customer_service
python test_admin.py
```

### 手动测试登录
```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试登录
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -d "username=admin@example.com&password=Admin123456" \
  | jq -r '.access_token')

# 测试获取用户信息
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"

# 测试获取组织列表
curl -X GET "http://localhost:8000/api/v1/organizations" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 监控和日志

### 查看后端日志
```bash
# 实时查看
tail -f /mnt/d/project/coze-py/customer_service/backend.log

# 查看最近 100 行
tail -n 100 /mnt/d/project/coze-py/customer_service/backend.log
```

### 查看前端日志
```bash
# 实时查看
tail -f /mnt/d/project/coze-py/customer_service/frontend.log

# 查看最近 100 行
tail -n 100 /mnt/d/project/coze-py/customer_service/frontend.log
```

### 检查服务状态
```bash
# 检查后端进程
ps aux | grep "app.main"

# 检查前端进程
ps aux | grep "vite"

# 检查端口占用
lsof -i :8000  # 后端
lsof -i :3000  # 前端
```

---

## 🛠️ 常用管理命令

### 停止服务
```bash
cd /mnt/d/project/coze-py/customer_service
bash stop.sh
```

### 启动服务
```bash
cd /mnt/d/project/coze-py/customer_service
bash start.sh
```

### 重启服务
```bash
# 停止
bash stop.sh

# 启动
bash start.sh
```

### 重置管理员密码
```bash
cd saas_backend
source .venv/bin/activate
python reset_admin.py
```

### 数据库管理
```bash
# 连接数据库
mysql -u root -ptestpass123 saas_customer_service

# 查看所有表
SHOW TABLES;

# 查看用户
SELECT id, email, username, is_active, is_verified FROM users;

# 查看组织
SELECT * FROM organizations;

# 退出
\q
```

---

## 🎯 下一步建议

### 1. 安全加固
- 修改 `SECRET_KEY` 为随机字符串
- 配置 HTTPS
- 设置防火墙规则
- 修改数据库密码

### 2. 性能优化
- 配置 Redis 缓存
- 启用数据库连接池
- 配置 CDN
- 启用 gzip 压缩

### 3. 功能扩展
- 配置邮件服务
- 添加更多机器人
- 自定义订阅计划
- 集成第三方服务

### 4. 监控告警
- 配置日志收集
- 设置性能监控
- 配置错误告警
- 定期数据备份

---

## 📞 获取帮助

- API 文档：http://localhost:8000/docs
- 项目文档：/mnt/d/project/coze-py/customer_service/README.md
- 架构说明：/mnt/d/project/coze-py/customer_service/SAAS_ARCHITECTURE.md
- 部署指南：/mnt/d/project/coze-py/customer_service/DEPLOYMENT.md

---

**系统版本：** 1.0.0
**最后更新：** 2026-02-08
