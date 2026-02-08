# 🚀 运行指南

本文档提供了完整的启动步骤，帮助你运行智能客服 SaaS 平台。

## 📋 前置要求

### 必需软件
- **Python**: 3.8 或更高版本
- **Node.js**: 16.x 或更高版本
- **PostgreSQL**: 14.x 或更高版本
- **Redis**: 6.x 或更高版本（可选，用于缓存）

### 可选软件
- **Docker**: 用于容器化部署
- **Docker Compose**: 用于多容器编排

---

## 🎯 快速开始（开发环境）

### 方式一：本地开发运行

#### 1. 后端启动

```bash
# 进入后端目录
cd /mnt/d/project/coze-py/customer_service/saas_backend

# 创建虚拟环境（如果还没有）
python -m venv .venv

# 激活虚拟环境
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# 使用 uv 安装依赖
uv pip install -r requirements.txt

# 或者使用 pip
pip install -r requirements.txt

# 设置环境变量（可选，创建 .env 文件）
cat > .env << 'EOF'
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_customer_service

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# JWT 密钥（生产环境请修改）
SECRET_KEY=your-secret-key-change-this-in-production

# 微信配置（可选，用于微信登录）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_REDIRECT_URI=http://localhost:8000/api/v1/auth/wechat/callback

# 短信服务配置（可选，用于手机登录）
ALIYUN_ACCESS_KEY_ID=your_aliyun_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret
SMS_SIGN_NAME=智能客服平台
SMS_TEMPLATE_CODE=SMS_123456789

# Coze API（可选）
COZE_API_TOKEN=your_coze_api_token
COZE_BOT_ID=your_bot_id
EOF

# 初始化数据库
alembic upgrade head

# 启动后端服务
python -m app.main
```

后端将运行在：**http://localhost:8000**

API 文档：**http://localhost:8000/docs**

#### 2. 前端启动

```bash
# 打开新的终端窗口

# 进入前端目录
cd /mnt/d/project/coze-py/customer_service/saas_frontend

# 安装依赖
npm install

# 或使用 yarn
yarn install

# 启动开发服务器
npm run dev

# 或使用 yarn
yarn dev
```

前端将运行在：**http://localhost:3000**

---

### 方式二：使用 Docker Compose（推荐）

这种方式会自动启动所有服务（后端、前端、数据库、Redis）。

```bash
# 进入项目根目录
cd /mnt/d/project/coze-py/customer_service

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问地址：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

## 📦 依赖安装

### 后端依赖

```bash
cd saas_backend

# 使用 uv（推荐）
uv pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings
uv pip install python-jose passlib[bcrypt] python-multipart
uv pip install alembic psycopg2-binary redis httpx
uv pip install email-validator

# 短信服务（可选）
uv pip install alibabacloud_dysmsapi20170525  # 阿里云
uv pip install tencentcloud-sdk-python        # 腾讯云

# 生成 requirements.txt
uv pip freeze > requirements.txt
```

### 前端依赖

```bash
cd saas_frontend

npm install
```

前端依赖已配置在 `package.json` 中，包括：
- React 18
- TypeScript
- Material-UI v5
- Redux Toolkit
- React Router
- Axios
- qrcode.react

---

## 🗄️ 数据库配置

### PostgreSQL 安装

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
下载并安装：https://www.postgresql.org/download/windows/

### 创建数据库

```bash
# 进入 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE saas_customer_service;
CREATE USER saas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saas_customer_service TO saas_user;
\q
```

### 运行数据库迁移

```bash
cd saas_backend

# 初始化 Alembic（首次运行）
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

---

## 🔧 环境变量配置

### 开发环境 (.env)

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑配置
nano .env
```

### 必需配置项

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT 密钥（必须修改）
SECRET_KEY=your-very-secret-key-min-32-chars

# CORS 前端地址
CORS_ORIGINS=["http://localhost:3000"]
```

### 可选配置项

```env
# Redis
REDIS_URL=redis://localhost:6379/0

# 微信开放平台
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=abcdefgh1234567890
WECHAT_REDIRECT_URI=http://localhost:8000/api/v1/auth/wechat/callback

# 阿里云短信
ALIYUN_ACCESS_KEY_ID=your_key_id
ALIYUN_ACCESS_KEY_SECRET=your_secret
SMS_SIGN_NAME=智能客服平台
SMS_TEMPLATE_CODE=SMS_123456789

# Coze API
COZE_API_TOKEN=your_token
COZE_BOT_ID=your_bot_id
```

---

## 🧪 测试服务

### 测试后端 API

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试注册
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","username":"test"}'

# 测试登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=Test123456"
```

### 测试前端

1. 打开浏览器访问：http://localhost:3000
2. 应该看到登录页面（紫色渐变背景）
3. 尝试三种登录方式：
   - 邮箱登录
   - 手机登录（开发环境会显示验证码）
   - 微信登录（需要配置微信）

---

## 🐛 常见问题

### 1. 端口已被占用

**问题**: `Address already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 杀死进程
kill -9 <PID>

# 或修改端口
# 后端：修改 app/main.py 中的 port
# 前端：修改 vite.config.ts 中的 server.port
```

### 2. 数据库连接失败

**问题**: `could not connect to server`

**解决**:
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql

# 检查数据库是否存在
psql -U postgres -l
```

### 3. 依赖安装失败

**问题**: `ModuleNotFoundError: No module named 'xxx'`

**解决**:
```bash
# 确保虚拟环境已激活
source .venv/bin/activate

# 重新安装依赖
uv pip install -r requirements.txt

# 或使用 pip
pip install -r requirements.txt
```

### 4. CORS 错误

**问题**: 前端无法访问后端 API

**解决**:
```python
# 检查 app/main.py 中的 CORS 配置
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Alembic 迁移失败

**问题**: `Target database is not up to date`

**解决**:
```bash
# 查看当前版本
alembic current

# 查看迁移历史
alembic history

# 强制升级到最新版本
alembic upgrade head

# 如果有问题，重置数据库
alembic downgrade base
alembic upgrade head
```

---

## 📊 开发工具

### API 测试工具

访问自动生成的 API 文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 数据库管理工具

推荐使用：
- **pgAdmin**（图形界面）
- **psql**（命令行）
- **DBeaver**（通用数据库工具）

```bash
# 使用 psql 连接数据库
psql -U postgres -d saas_customer_service

# 查看表
\dt

# 查询用户
SELECT id, email, username, created_at FROM users LIMIT 10;
```

---

## 🚀 生产环境部署

详细的部署指南请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

快速部署步骤：

```bash
# 使用 Docker
docker-compose -f docker-compose.prod.yml up -d

# 或手动部署
# 1. 设置环境变量
export production=True

# 2. 使用 Gunicorn 运行
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 3. 前端构建
cd saas_frontend
npm run build

# 4. 使用 Nginx 服务
sudo cp -r dist/* /var/www/html/
```

---

## ✅ 启动检查清单

- [ ] PostgreSQL 已安装并运行
- [ ] 数据库已创建
- [ ] 数据库迁移已执行
- [ ] 后端依赖已安装
- [ ] 前端依赖已安装
- [ ] 环境变量已配置
- [ ] 后端服务已启动（http://localhost:8000）
- [ ] 前端服务已启动（http://localhost:3000）
- [ ] 可以访问 API 文档（http://localhost:8000/docs）
- [ ] 可以访问登录页面（http://localhost:3000/login）

---

## 📚 下一步

启动成功后，你可以：

1. **测试登录功能**: 访问 http://localhost:3000/login
2. **查看 API 文档**: 访问 http://localhost:8000/docs
3. **创建组织**: 登录后自动创建默认组织
4. **配置支付**: 设置微信支付或支付宝
5. **测试多租户**: 创建多个组织测试隔离

---

**需要帮助?** 查看其他文档：
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [LOGIN_FEATURES.md](./LOGIN_FEATURES.md) - 登录功能说明
- [MULTI_LOGIN_COMPLETE.md](./MULTI_LOGIN_COMPLETE.md) - 多种登录方式实现
- [SAAS_ARCHITECTURE.md](./SAAS_ARCHITECTURE.md) - 系统架构设计
