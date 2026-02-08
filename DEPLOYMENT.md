# 智能客服 SaaS 平台 - 完整部署指南

## 📋 目录

1. [系统要求](#系统要求)
2. [快速开始](#快速开始)
3. [手动部署](#手动部署)
4. [Docker 部署](#docker-部署)
5. [生产环境配置](#生产环境配置)
6. [常见问题](#常见问题)

---

## 系统要求

### 开发环境
- Python 3.8+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+（可选）
- 2GB RAM
- 10GB 磁盘空间

### 生产环境
- 4GB RAM（推荐 8GB）
- 20GB 磁盘空间
- Ubuntu 20.04+ 或 CentOS 8+
- Nginx
- SSL 证书

---

## 快速开始

### 使用 Docker Compose（推荐）

这是最快的部署方式，适合快速测试和开发。

```bash
# 1. 进入项目目录
cd customer_service

# 2. 复制环境变量文件
cp saas_backend/.env.example saas_backend/.env

# 3. 编辑环境变量（可选）
nano saas_backend/.env

# 4. 启动所有服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f

# 6. 停止服务
docker-compose down
```

访问：
- 前端：http://localhost
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

## 手动部署

### 1. 安装依赖

#### Ubuntu/Debian

```bash
# 安装 Python
sudo apt-get update
sudo apt-get install python3.10 python3.10-venv python3-pip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 安装 Redis
sudo apt-get install redis-server

# 安装 Nginx
sudo apt-get install nginx
```

#### CentOS/RHEL

```bash
# 安装 Python
sudo yum install python3 python3-pip

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 PostgreSQL
sudo yum install postgresql postgresql-server

# 安装 Redis
sudo yum install redis

# 安装 Nginx
sudo yum install nginx
```

### 2. 配置数据库

```bash
# 创建数据库
sudo -u postgres psql

CREATE DATABASE saas_customer_service;
CREATE USER saas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saas_customer_service TO saas_user;
\q
```

### 3. 部署后端

```bash
cd saas_backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
nano .env

# 初始化数据库
python -c "from app.db.session import init_db; init_db()"

# 启动服务
python -m app.main
```

### 4. 部署前端

```bash
cd saas_frontend

# 安装依赖
npm install

# 配置环境变量
echo "VITE_API_BASE_URL=http://your-domain.com/api" > .env.local

# 构建生产版本
npm run build

# 使用 Nginx 部署
sudo mkdir -p /var/www/saas-frontend
sudo cp -r dist/* /var/www/saas-frontend/
```

### 5. 配置 Nginx

创建 `/etc/nginx/sites-available/saas-platform`：

```nginx
# 后端 API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 前端
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/saas-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/saas-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Docker 部署

### 1. 构建镜像

```bash
# 构建后端镜像
cd saas_backend
docker build -t saas-backend:latest .

# 构建前端镜像
cd ../saas_frontend
docker build -t saas-frontend:latest .
```

### 2. 运行容器

```bash
# 后端
docker run -d \
  --name saas-backend \
  -p 8000:8000 \
  --env-file .env \
  saas-backend:latest

# 前端
docker run -d \
  --name saas-frontend \
  -p 80:80 \
  saas-frontend:latest
```

### 3. 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

---

## 生产环境配置

### 1. 环境变量

编辑 `saas_backend/.env`：

```bash
# 应用配置
APP_NAME=智能客服 SaaS 平台
DEBUG=False
SECRET_KEY=your-long-random-secret-key-here

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/saas_customer_service

# Redis
REDIS_URL=redis://localhost:6379/0

# Coze API
COZE_API_TOKEN=your_coze_api_token
COZE_API_BASE=https://api.coze.cn
COZE_BOT_ID=your_bot_id

# 微信支付
WECHAT_PAY_APP_ID=your_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_API_KEY=your_api_key

# 支付宝
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key

# CORS
CORS_ORIGINS=["https://your-domain.com"]
```

### 2. SSL 证书（HTTPS）

使用 Let's Encrypt：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 配置防火墙

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4. 配置系统服务

创建 systemd 服务文件 `/etc/systemd/system/saas-backend.service`：

```ini
[Unit]
Description=SAAS Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/saas-backend
Environment="PATH=/var/www/saas-backend/venv/bin"
ExecStart=/var/www/saas-backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable saas-backend
sudo systemctl start saas-backend
sudo systemctl status saas-backend
```

---

## 常见问题

### 1. 数据库连接失败

**问题**：`could not connect to server`

**解决方案**：
- 检查 PostgreSQL 是否运行：`sudo systemctl status postgresql`
- 检查数据库配置：`nano saas_backend/.env`
- 检查防火墙设置

### 2. 前端无法访问后端 API

**问题**：CORS 错误或 502 Bad Gateway

**解决方案**：
- 检查 `CORS_ORIGINS` 配置
- 确保 Nginx 配置正确
- 检查后端服务是否运行

### 3. Docker 容器无法启动

**问题**：容器启动失败

**解决方案**：
```bash
# 查看日志
docker-compose logs backend

# 重新构建
docker-compose build --no-cache

# 清理并重启
docker-compose down -v
docker-compose up -d
```

### 4. 支付回调失败

**问题**：支付回调无法访问

**解决方案**：
- 确保使用 HTTPS（微信支付要求）
- 检查回调 URL 配置
- 确保防火墙允许外部访问
- 查看服务器日志

### 5. 性能优化

**数据库优化**：
```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_usage_org_date ON usage_records(organization_id, date);
```

**Redis 缓存**：
```python
# 在代码中添加缓存
from functools import lru_cache

@lru_cache(maxsize=128)
def get_subscription_plans():
    return fetch_plans_from_db()
```

---

## 监控和维护

### 查看日志

```bash
# 后端日志
docker-compose logs -f backend

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u saas-backend -f
```

### 数据备份

```bash
# 数据库备份
docker exec saas_postgres pg_dump -U postgres saas_customer_service > backup.sql

# 恢复数据库
docker exec -i saas_postgres psql -U postgres saas_customer_service < backup.sql
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 支持

如有问题，请：
1. 查看文档：`SAAS_ARCHITECTURE.md`
2. 查看日志：`docker-compose logs`
3. 提交 Issue

---

**部署完成后，建议：**
1. 修改默认密码和密钥
2. 启用 HTTPS
3. 配置定期备份
4. 设置监控告警
5. 优化数据库性能
