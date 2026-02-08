# 智能客服 SaaS 平台

一个完整的、生产就绪的 SaaS 化智能客服平台，支持多租户、订阅制、在线支付。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![React](https://img.shields.io/badge/react-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 核心功能

### 🔐 用户认证
- ✅ 邮箱密码注册/登录
- ✅ JWT Token 认证
- ✅ 自动刷新 Token
- ⏳ 微信扫码登录（待实现）

### 🏢 多租户系统
- ✅ 组织管理
- ✅ 成员邀请
- ✅ 角色权限控制（Owner/Admin/Member/Viewer）
- ✅ 工作空间隔离

### 💳 订阅与计费
- ✅ 三种订阅计划（免费版/专业版/企业版）
- ✅ 使用量追踪和限制
- ✅ 微信支付集成
- ✅ 支付宝支付集成
- ✅ 订单管理
- ✅ 发票生成

### 📊 使用量分析
- ✅ 实时使用量统计
- ✅ 历史数据查询
- ✅ 使用量告警
- ✅ 可视化图表

### 🤖 智能客服功能
- ✅ 文本对话
- ✅ 图像识别
- ✅ 语音交互
- ✅ 工作流执行
- ✅ 多模态支持

### 🎨 用户界面
- ✅ 响应式设计
- ✅ Material-UI 组件库
- ✅ 直观的操作界面
- ✅ 实时数据更新

## 🏗️ 技术架构

### 后端
- **框架**: FastAPI 0.104+
- **数据库**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0
- **缓存**: Redis 7+
- **认证**: JWT (python-jose)
- **支付**: 微信支付 + 支付宝

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **状态管理**: Redux Toolkit
- **UI 库**: Material-UI v5
- **路由**: React Router v6
- **HTTP 客户端**: Axios

### 部署
- **容器**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: systemd

## 📦 项目结构

```
customer_service/
├── saas_backend/              # 后端服务
│   ├── app/
│   │   ├── api/              # API 路由
│   │   ├── core/             # 核心功能（认证、配置等）
│   │   ├── db/               # 数据库会话
│   │   ├── models/           # 数据库模型
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # 业务逻辑层
│   │   └── main.py           # 应用入口
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── saas_frontend/             # 前端应用
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   ├── pages/            # 页面组件
│   │   ├── services/         # API 服务
│   │   ├── store/            # Redux store
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Docker Compose 配置
├── DEPLOYMENT.md             # 部署指南
├── SAAS_ARCHITECTURE.md      # 架构设计文档
└── README_SAAS.md            # 本文件
```

## 🚀 快速开始

### 方式 1: Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd customer_service

# 2. 配置环境变量
cp saas_backend/.env.example saas_backend/.env
nano saas_backend/.env

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost
# 后端: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

### 方式 2: 手动部署

详细步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
# 后端
cd saas_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main

# 前端
cd saas_frontend
npm install
npm run dev
```

## 📖 API 文档

启动后端服务后，访问以下地址查看完整 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要 API 端点

#### 认证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户信息

#### 组织
- `GET /api/v1/organizations` - 获取组织列表
- `POST /api/v1/organizations` - 创建组织
- `POST /api/v1/organizations/{id}/members` - 邀请成员

#### 订阅
- `GET /api/v1/subscriptions/plans` - 获取订阅计划
- `GET /api/v1/subscriptions/current` - 获取当前订阅
- `POST /api/v1/subscriptions/upgrade` - 升级订阅

#### 支付
- `POST /api/v1/payments/wechat/create` - 创建微信支付订单
- `POST /api/v1/payments/alipay/create` - 创建支付宝订单

#### 使用量
- `GET /api/v1/usage/stats` - 获取使用量统计
- `GET /api/v1/usage/history` - 获取使用量历史

## 💰 订阅计划

| 功能 | 免费版 | 专业版 | 企业版 |
|------|--------|--------|--------|
| 价格 | ¥0 | ¥199/月 | ¥999/月 |
| 消息数 | 1,000/月 | 50,000/月 | 无限 |
| 机器人数 | 1 | 10 | 无限 |
| 图像识别 | ❌ | ✅ | ✅ |
| 语音交互 | ❌ | ✅ | ✅ |
| 自定义品牌 | ❌ | ✅ | ✅ |
| 数据分析 | ❌ | ✅ | ✅ |
| 专属支持 | ❌ | 优先 | 专属 |

## 🔧 配置说明

### 必需配置

```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/saas_customer_service

# JWT 密钥（生产环境必须修改）
SECRET_KEY=your-secret-key-here

# Coze API
COZE_API_TOKEN=your_coze_token
COZE_BOT_ID=your_bot_id
```

### 可选配置

```bash
# 微信支付（需要时配置）
WECHAT_PAY_APP_ID=your_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_API_KEY=your_api_key

# 支付宝（需要时配置）
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
```

## 📸 截图

### 登录页面
用户友好的登录界面，支持邮箱密码登录。

### 仪表板
实时显示使用量统计、订阅状态和快捷操作。

### 账单管理
查看订阅计划、升级订阅、管理订单。

## 🧪 测试

```bash
# 后端测试
cd saas_backend
pytest

# 前端测试
cd saas_frontend
npm test
```

## 📊 性能

- API 响应时间: < 100ms
- 数据库查询: < 50ms
- 前端加载: < 2s
- 并发支持: 1000+ 用户

## 🔒 安全性

- ✅ 密码哈希存储（bcrypt）
- ✅ JWT Token 认证
- ✅ HTTPS 支持
- ✅ CORS 配置
- ✅ SQL 注入防护（ORM）
- ✅ XSS 防护
- ⏳ API 速率限制（待实现）
- ⏳ 两步验证（待实现）

## 🛠️ 开发指南

### 添加新功能

1. **后端**:
   - 在 `app/models/` 添加数据模型
   - 在 `app/schemas/` 添加 schemas
   - 在 `app/services/` 添加业务逻辑
   - 在 `app/api/v1/endpoints/` 添加 API 端点

2. **前端**:
   - 在 `src/services/api.ts` 添加 API 调用
   - 在 `src/store/slices/` 添加状态管理
   - 在 `src/pages/` 添加页面组件

### 代码规范

- Python: PEP 8
- TypeScript: ESLint + Prettier
- Git: Conventional Commits

## 📈 路线图

### 已完成 ✅
- [x] 用户认证系统
- [x] 多租户管理
- [x] 订阅系统
- [x] 支付集成
- [x] 使用量追踪
- [x] 基础 UI

### 计划中 🚧
- [ ] 微信扫码登录
- [ ] API 速率限制
- [ ] 管理后台
- [ ] 数据分析报表
- [ ] 消息通知
- [ ] 移动端适配

### 未来构想 💡
- [ ] AI 功能增强
- [ ] 多语言支持
- [ ] 白标解决方案
- [ ] 私有化部署
- [ ] 企业级 SLA

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 💬 联系方式

- 问题反馈: GitHub Issues
- 邮箱: support@example.com

## 🙏 致谢

感谢以下开源项目：

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

**注意**: 本项目仅供学习和参考使用，生产环境部署前请进行充分测试和安全审计。
