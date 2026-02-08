# 智能客服 SaaS 平台 - 后端

完整的 SaaS 化智能客服平台后端服务。

## 功能特性

✅ 用户认证系统（邮箱密码、JWT Token）
✅ 多租户组织管理
✅ 订阅计划（免费版、专业版、企业版）
✅ 使用量追踪和限制
✅ 微信支付集成
✅ 支付宝支付集成
✅ 完整的 RESTful API
✅ 数据库模型和迁移

## 快速开始

### 1. 环境准备

确保已安装：
- Python 3.8+
- PostgreSQL 14+
- Redis（可选）

### 2. 安装依赖

```bash
cd saas_backend
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的配置项。

### 4. 初始化数据库

```bash
# 创建数据库
createdb saas_customer_service

# 初始化数据库表
python -c "from app.db.session import init_db; init_db()"
```

### 5. 启动服务

```bash
python -m app.main
```

服务将在 http://localhost:8000 启动。

API 文档：http://localhost:8000/docs

## API 端点

### 认证相关
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `GET /api/v1/auth/me` - 获取当前用户信息

### 组织相关
- `GET /api/v1/organizations` - 获取组织列表
- `POST /api/v1/organizations` - 创建组织
- `GET /api/v1/organizations/{id}` - 获取组织详情
- `POST /api/v1/organizations/{id}/members` - 邀请成员

### 订阅相关
- `GET /api/v1/subscriptions/plans` - 获取订阅计划
- `GET /api/v1/subscriptions/current` - 获取当前订阅
- `POST /api/v1/subscriptions/upgrade` - 升级订阅
- `POST /api/v1/subscriptions/cancel` - 取消订阅

### 支付相关
- `POST /api/v1/payments/wechat/create` - 创建微信支付订单
- `POST /api/v1/payments/alipay/create` - 创建支付宝支付订单
- `GET /api/v1/payments/orders/{id}` - 查询订单状态

### 使用量相关
- `GET /api/v1/usage/stats` - 获取使用量统计
- `GET /api/v1/usage/history` - 获取使用量历史
- `POST /api/v1/usage/record` - 记录使用量

## 订阅计划

### 免费版
- 1000 条消息/月
- 1 个机器人
- 基础客服功能
- 社区支持

### 专业版 - ¥199/月
- 50,000 条消息/月
- 10 个机器人
- 图像识别 + 语音交互
- 优先支持
- 自定义品牌
- 数据分析

### 企业版 - ¥999/月
- 无限消息
- 无限机器人
- 全部功能
- 专属支持
- SLA 保证
- 私有化部署选项

## 数据库架构

主要数据表：
- `users` - 用户表
- `organizations` - 组织表
- `organization_members` - 组织成员表
- `subscriptions` - 订阅表
- `usage_records` - 使用量记录表
- `orders` - 订单表
- `bots` - 机器人配置表
- `conversations` - 对话历史表
- `api_keys` - API 密钥表

## 开发

### 运行测试

```bash
pytest
```

### 代码格式化

```bash
black app/
isort app/
```

### 类型检查

```bash
mypy app/
```

## 部署

### Docker 部署

```bash
docker build -t saas-backend .
docker run -p 8000:8000 --env-file .env saas-backend
```

### 生产环境配置

1. 设置 `DEBUG=False`
2. 使用强随机密钥作为 `SECRET_KEY`
3. 配置正确的数据库连接
4. 配置微信支付和支付宝参数
5. 设置正确的 CORS 源

## 许可证

MIT License
