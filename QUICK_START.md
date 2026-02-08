# 🚀 快速开始

## 一键启动

### Linux / macOS
```bash
./start.sh
```

### Windows
```cmd
start.bat
```

## 手动启动

### 1. 后端服务

```bash
cd saas_backend

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 创建配置文件
cp .env.example .env

# 启动后端
python -m app.main
```

后端运行在: **http://localhost:8000**

### 2. 前端服务

```bash
cd saas_frontend

# 安装依赖
npm install

# 启动前端
npm run dev
```

前端运行在: **http://localhost:3000**

## 测试功能

```bash
# 运行测试脚本
./test_setup.sh

# 或手动测试
curl http://localhost:8000/health
```

## 停止服务

### Linux / macOS
```bash
./stop.sh
```

### Windows
```cmd
stop.bat
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 🎨 前端界面 | http://localhost:3000 |
| 🔧 后端 API | http://localhost:8000 |
| 📚 API 文档 | http://localhost:8000/docs |
| 📖 ReDoc | http://localhost:8000/redoc |

## 首次运行

1. **安装 PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql

   # macOS
   brew install postgresql

   # 启动 PostgreSQL
   sudo systemctl start postgresql
   ```

2. **创建数据库**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE saas_customer_service;
   \q
   ```

3. **运行数据库迁移**（可选）
   ```bash
   cd saas_backend
   alembic upgrade head
   ```

## 测试登录

### 邮箱登录
1. 访问 http://localhost:3000/login
2. 切换到"邮箱登录"标签
3. 输入邮箱和密码
4. 点击"登录"

### 手机登录
1. 切换到"手机登录"标签
2. 输入手机号（如：13800138000）
3. 点击"发送"获取验证码
4. 开发环境会显示验证码
5. 输入验证码并登录

### 微信登录
1. 切换到"微信登录"标签
2. 点击"生成微信登录二维码"
3. 使用微信扫码（需要配置微信）

## 常见问题

### 端口被占用
```bash
# 查找并杀死占用 8000 端口的进程
lsof -ti:8000 | xargs kill -9

# 查找并杀死占用 3000 端口的进程
lsof -ti:3000 | xargs kill -9
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql
```

### 查看日志
```bash
# 后端日志
tail -f backend.log

# 前端日志
tail -f frontend.log
```

## 下一步

- 配置真实短信服务：编辑 `.env` 文件中的短信配置
- 配置微信登录：在微信开放平台申请应用
- 配置支付功能：配置微信支付或支付宝
- 生产部署：查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**详细文档**: [RUN_GUIDE.md](./RUN_GUIDE.md)
