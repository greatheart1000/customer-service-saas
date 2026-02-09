# 🎯 智能客服SaaS系统

## 项目结构

本系统采用**三层架构**，前端、后端、算法完全分离：

```
customer_service/
├── frontend/          # 🎨 前端 (React + TypeScript)
├── backend/           # ⚙️ 后端 (FastAPI + Python)
├── algorithm/         # 🤖 算法 (RAG + AI Models)
├── docs/             # 📚 文档
├── scripts/          # 🔧 脚本工具
├── product/          # 📐 设计参考
└── README.md         # 本文件
```

---

## 📁 目录说明

### 🎨 frontend/ - 前端系统

**技术栈**:
- React 18 + TypeScript
- Material-UI v5
- React Router v6
- Redux Toolkit
- Vite

**主要功能**:
- 管理员界面（SaaS管理后台）
- 客服工作台（Agent Dashboard）
- 终端用户聊天窗口
- 租户嵌入式聊天组件

**访问地址**:
- 开发环境: `http://localhost:3000`
- 生产环境: `https://yourdomain.com`

**启动命令**:
```bash
cd frontend
npm install
npm run dev
```

---

### ⚙️ backend/ - 后端系统

**技术栈**:
- FastAPI (Python 3.8+)
- SQLAlchemy ORM
- MySQL数据库
- JWT认证
- WebSocket（实时通信）

**主要功能**:
- 用户认证和授权
- 多租户数据隔离
- RESTful API
- 机器人管理
- 对话管理
- 知识库管理
- 组织管理

**API文档**:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**启动命令**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 🤖 algorithm/ - 算法系统

**技术栈**:
- Python 3.8+
- LangChain
- OpenAI/Coze API
- ChromaDB向量数据库
- HuggingFace Transformers

**主要功能**:
- RAG（检索增强生成）
- 向量嵌入和相似度搜索
- 知识库文档处理
- AI对话流处理
- 情感分析（待实现）

**子模块**:
- `rag/` - RAG检索增强生成系统

**启动命令**:
```bash
cd algorithm/rag
pip install -r requirements.txt
python main.py
```

---

### 📚 docs/ - 文档

**技术文档**:
- `MULTI_TENANT_ARCHITECTURE.md` - 多租户架构文档
- `MULTI_TENANT_IMPLEMENTATION_SUMMARY.md` - 多租户实现总结
- `AGENT_DASHBOARD_SUMMARY.md` - 客服工作台总结
- `UI_OPTIMIZATION_SUMMARY.md` - UI优化总结
- `DESIGN_SYSTEM.md` - 设计系统规范
- `QUICK_START.md` - 快速开始指南
- `DEPLOYMENT.md` - 部署指南

---

### 🔧 scripts/ - 脚本工具

**测试脚本**:
- `test_apis.py` - API接口测试
- `test_tenant_api.py` - 租户API测试

**数据脚本**:
- `generate_complete_test_data.py` - 生成测试数据
- `init_db.py` - 初始化数据库
- `migrate_db.py` - 数据库迁移

**管理脚本**:
- `create_admin.py` - 创建管理员
- `reset_admin.py` - 重置管理员密码
- `start.sh` - 启动脚本

---

## 🚀 快速开始

### 1. 环境准备

**要求**:
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE customer_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 运行迁移
cd backend
alembic upgrade head

# 生成测试数据
cd ../scripts
python generate_complete_test_data.py
```

### 3. 启动后端

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 5. 访问系统

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **客服工作台**: http://localhost:3000/agent/inbox

**测试账号**:
- 管理员: admin@test.com / Admin123
- 用户1: user1@test.com / User123456

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────┐
│                   前端层 (React)                    │
│  管理员界面  │  客服工作台  │  终端用户聊天          │
├─────────────────────────────────────────────────────┤
│                  API网关层 (FastAPI)                 │
│  认证中间件  │  租户中间件  │  限流中间件            │
├─────────────────────────────────────────────────────┤
│                   业务逻辑层                         │
│  用户管理  │  对话管理  │  知识库  │  机器人管理      │
├─────────────────────────────────────────────────────┤
│                  算法层 (Python)                    │
│  RAG检索  │  向量嵌入  │  AI对话生成                 │
├─────────────────────────────────────────────────────┤
│                   数据层 (MySQL)                    │
│  用户数据  │  对话数据  │  知识库  │  向量数据        │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 多租户架构

本系统支持**多租户SaaS模式**：

### 访问方式

1. **管理员界面**: `/admin/*` - 平台管理员
2. **客服工作台**: `/agent/*` - 租户客服人员
3. **终端用户聊天**: `/tenant/:uuid/chat` - C端用户

### 数据隔离

- 所有业务数据按 `organization_id` 隔离
- JWT Token + 后端强制过滤
- 防止跨租户数据泄露

详细文档: [docs/MULTI_TENANT_ARCHITECTURE.md](docs/MULTI_TENANT_ARCHITECTURE.md)

---

## 📊 主要功能

### ✅ 已实现

- [x] 用户认证和授权（JWT）
- [x] 多租户数据隔离
- [x] 管理员界面（用户、机器人、对话、知识库管理）
- [x] 客服工作台（收件箱、聊天窗口、用户信息）
- [x] 终端用户嵌入式聊天
- [x] RAG知识库检索
- [x] AI流式对话
- [x] 基于UUID的租户访问

### 🚧 开发中

- [ ] WebSocket实时通信
- [ ] 快速回复模板
- [ ] 文件上传
- [ ] 客服绩效统计
- [ ] 工单系统
- [ ] AI辅助回复建议

### 🔮 计划中

- [ ] 自定义子域名
- [ ] 品牌定制（logo、颜色）
- [ ] 多语言支持
- [ ] 移动端APP
- [ ] 语音通话
- [ ] 视频客服

---

## 📖 API文档

### 租户API（公开）

```bash
# 获取租户信息
GET /api/v1/tenant/{tenant_uuid}/info

# 获取租户机器人
GET /api/v1/tenant/{tenant_uuid}/bots

# 获取租户知识库
GET /api/v1/tenant/{tenant_uuid}/knowledge-bases
```

### 客服API（需要认证）

```bash
# 获取对话列表
GET /api/v1/conversations

# 获取对话消息
GET /api/v1/conversations/{id}/messages

# 发送消息
POST /api/v1/chat/stream
```

### 管理API（需要管理员权限）

```bash
# 用户管理
GET /api/v1/admin/users

# 机器人管理
GET /api/v1/admin/bots

# 知识库管理
GET /api/v1/admin/knowledge

# 对话管理
GET /api/v1/conversations/admin/all
```

详细文档: http://localhost:8000/docs

---

## 🧪 测试

### 运行所有测试

```bash
# 后端测试
cd backend
pytest

# 租户API测试
cd ../scripts
python test_tenant_api.py
```

### 生成测试数据

```bash
cd scripts
python generate_complete_test_data.py
```

---

## 📝 开发规范

### 代码风格

- **前端**: ESLint + Prettier
- **后端**: Black + Flake8 + mypy

### Git提交

```bash
# 功能开发
git checkout -b feature/your-feature
git commit -m "feat: add your feature"

# Bug修复
git checkout -b fix/your-bug
git commit -m "fix: fix your bug"

# 文档更新
git commit -m "docs: update documentation"
```

---

## 🚀 部署

### Docker部署（推荐）

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 手动部署

详细步骤: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📞 技术支持

- 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 技术文档: [docs/](docs/)
- API文档: http://localhost:8000/docs

---

## 📄 许可证

MIT License

---

## 👥 贡献者

- Claude Code - AI辅助开发
- 用户 - 需求定义和产品设计

---

**最后更新**: 2026-02-10
**版本**: v1.0.0
**状态**: ✅ 生产就绪
