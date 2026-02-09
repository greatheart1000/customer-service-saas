# 📂 项目重组说明

## 🎯 重组目标

将智能客服系统按照**前端、后端、算法**三层架构重新组织，使项目结构更清晰、更易于维护和扩展。

---

## 📊 重组前后的目录对比

### 重组前

```
customer_service/
├── saas_frontend/          # 前端
├── saas_backend/           # 后端（包含算法）
├── RAG-main/              # 算法（独立目录）
├── *.md                   # 文档散落在根目录
├── *.py/*.sh              # 脚本散落在根目录
└── product/               # 设计参考
```

**问题**:
- ❌ 后端和算法混在一起
- ❌ 文档和脚本分散
- ❌ 缺少专门的算法目录
- ❌ 目录命名不统一

### 重组后

```
customer_service/
├── frontend/ (saas_frontend/)     # 前端系统
├── backend/ (saas_backend/)       # 后端系统
├── algorithm/                     # 算法系统
│   └── rag/ (RAG-main/)          # RAG算法
├── docs/                          # 文档中心
├── scripts/                       # 脚本工具
├── product/                       # 设计参考
└── README.md                      # 项目说明
```

**改进**:
- ✅ 前端、后端、算法完全分离
- ✅ 文档集中在docs目录
- ✅ 脚本集中在scripts目录
- ✅ 目录命名更统一

---

## 📁 各目录职责

### 1. frontend/ - 前端系统

**原名称**: `saas_frontend/`

**内容**:
- React 18 + TypeScript
- Material-UI组件库
- 管理员界面、客服工作台、终端用户聊天

**访问**:
```bash
cd frontend/        # 或 cd saas_frontend/
npm run dev
```

**说明**: 保留 `saas_frontend/` 作为兼容性符号链接

---

### 2. backend/ - 后端系统

**原名称**: `saas_backend/`

**内容**:
- FastAPI框架
- RESTful API
- JWT认证
- 多租户数据隔离

**访问**:
```bash
cd backend/         # 或 cd saas_backend/
uvicorn app.main:app --reload
```

**说明**: 保留 `saas_backend/` 作为兼容性符号链接

---

### 3. algorithm/ - 算法系统

**新增目录**

**内容**:
- RAG检索增强生成
- 向量嵌入和搜索
- AI对话处理

**子目录**:
- `rag/` - RAG系统（原 `RAG-main/`）

**访问**:
```bash
cd algorithm/rag/
python main.py
```

---

### 4. docs/ - 文档中心

**新增目录（从根目录移动所有.md文件）**

**内容**:
- 架构设计文档
- 实现总结文档
- API使用指南
- 部署指南

**主要文档**:
- `MULTI_TENANT_ARCHITECTURE.md` - 多租户架构
- `AGENT_DASHBOARD_SUMMARY.md` - 客服工作台
- `DESIGN_SYSTEM.md` - 设计系统
- `QUICK_START.md` - 快速开始

**访问**:
```bash
cd docs/
ls *.md
```

---

### 5. scripts/ - 脚本工具

**新增目录（从backend/移动所有.py和.sh文件）**

**内容**:
- 测试脚本
- 数据初始化脚本
- 数据库迁移脚本
- 管理工具脚本

**主要脚本**:
- `generate_complete_test_data.py` - 生成测试数据
- `test_tenant_api.py` - 租户API测试
- `init_db.py` - 初始化数据库

**访问**:
```bash
cd scripts/
python generate_complete_test_data.py
```

---

### 6. product/ - 设计参考

**保留原位置**

**内容**: UI/UX设计参考图

---

## 🔄 兼容性处理

### 符号链接

为了保持向后兼容，创建了符号链接：

```bash
saas_frontend -> frontend/
saas_backend -> backend/
```

这样旧的路径仍然可以工作：

```bash
# 仍然可以使用旧路径
cd saas_frontend/
cd saas_backend/
```

### 脚本路径更新

所有移动的脚本已更新其导入路径，确保可以正常工作。

---

## 📋 文件移动清单

### 文档移动 (根目录 → docs/)

- ✅ MULTI_TENANT_ARCHITECTURE.md
- ✅ MULTI_TENANT_IMPLEMENTATION_SUMMARY.md
- ✅ AGENT_DASHBOARD_SUMMARY.md
- ✅ UI_OPTIMIZATION_SUMMARY.md
- ✅ DESIGN_SYSTEM.md
- ✅ QUICK_START.md
- ✅ DEPLOYMENT.md
- ✅ FRONTEND_DEBUG_GUIDE.md
- ✅ IMPLEMENTATION_SUMMARY.md
- ✅ PROJECT_FINAL_SUMMARY.md
- ✅ TEST_REPORT.md
- ✅ README.md (主README保留在根目录)

### 脚本移动 (backend/ → scripts/)

- ✅ generate_complete_test_data.py
- ✅ test_apis.py
- ✅ test_tenant_api.py
- ✅ init_db.py
- ✅ migrate_db.py
- ✅ create_admin.py
- ✅ reset_admin.py
- ✅ update_admin.py
- ✅ code_verification.py
- ✅ verify_system.py
- ✅ generate_test_data.py
- ✅ start.sh

### 算法移动 (根目录 → algorithm/)

- ✅ RAG-main/ → algorithm/rag/

---

## 🚀 新的开发工作流

### 1. 前端开发

```bash
cd frontend/
npm run dev
# 访问 http://localhost:3000
```

### 2. 后端开发

```bash
cd backend/
source .venv/bin/activate
uvicorn app.main:app --reload
# 访问 http://localhost:8000
```

### 3. 算法开发

```bash
cd algorithm/rag/
python main.py
```

### 4. 运行测试

```bash
# 后端测试
cd backend/
pytest

# 租户API测试
cd ../scripts/
python test_tenant_api.py

# 生成测试数据
python generate_complete_test_data.py
```

---

## 📖 文档导航

所有文档现在集中在 `docs/` 目录：

- **架构文档**: `docs/MULTI_TENANT_ARCHITECTURE.md`
- **实现总结**: `docs/MULTI_TENANT_IMPLEMENTATION_SUMMARY.md`
- **客服工作台**: `docs/AGENT_DASHBOARD_SUMMARY.md`
- **设计系统**: `docs/DESIGN_SYSTEM.md`
- **快速开始**: `docs/QUICK_START.md`
- **部署指南**: `docs/DEPLOYMENT.md`

---

## ⚠️ 注意事项

### 1. Git忽略

以下目录不会被提交到Git：
- `frontend/node_modules/`
- `backend/.venv/`
- `backend/venv/`
- `frontend/dist/`
- `__pycache__/`

### 2. 配置文件更新

如果项目中有引用旧路径的配置文件，需要更新：

```bash
# 更新配置文件中的路径
# 例如: .env, config.yaml, etc.
```

### 3. CI/CD管道

如果使用CI/CD，需要更新管道配置：

```yaml
# 更新工作目录
- frontend/
- backend/
- algorithm/
```

---

## ✅ 重组验证

### 检查目录结构

```bash
cd customer_service/
ls -la
```

应该看到：
```
frontend/ -> saas_frontend
backend/ -> saas_backend
algorithm/
docs/
scripts/
product/
README.md
```

### 测试功能

```bash
# 1. 测试前端
cd frontend/
npm run dev

# 2. 测试后端
cd ../backend/
uvicorn app.main:app --reload

# 3. 测试脚本
cd ../scripts/
python generate_complete_test_data.py
```

---

## 🎉 重组完成

项目现在具有更清晰的三层架构：

```
┌─────────────────────────────────────┐
│         frontend/ (前端)             │
│    React + TypeScript + MUI         │
└──────────────┬──────────────────────┘
               │ API
┌──────────────▼──────────────────────┐
│         backend/ (后端)              │
│       FastAPI + SQLAlchemy          │
└──────────────┬──────────────────────┘
               │ AI
┌──────────────▼──────────────────────┐
│       algorithm/ (算法)              │
│      RAG + LangChain + AI           │
└─────────────────────────────────────┘
```

**优点**:
- ✅ 职责清晰，易于维护
- ✅ 团队协作更高效
- ✅ 代码组织更合理
- ✅ 扩展性更强

---

**重组时间**: 2026-02-10
**版本**: v1.1.0 (重组版本)
