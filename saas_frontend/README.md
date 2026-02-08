# 智能客服 SaaS 平台 - 前端

完整的 SaaS 化智能客服平台前端应用。

## 功能特性

✅ 用户认证（登录/注册）
✅ 仪表板和使用量统计
✅ 账单管理和订阅升级
✅ 设置页面
✅ 响应式设计（Material-UI）
✅ Redux Toolkit 状态管理
✅ TypeScript 类型安全

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 4. 构建生产版本

```bash
npm run build
```

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **UI 组件**: Material-UI v5
- **状态管理**: Redux Toolkit
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **构建工具**: Vite

## 项目结构

```
src/
├── components/       # 公共组件
│   └── Layout.tsx
├── pages/           # 页面组件
│   ├── auth/        # 认证页面
│   ├── dashboard/   # 仪表板
│   └── billing/     # 账单管理
├── services/        # API 服务
│   └── api.ts
├── store/           # Redux store
│   ├── slices/      # Redux slices
│   └── index.ts
├── App.tsx          # 应用根组件
├── main.tsx         # 应用入口
└── index.css        # 全局样式
```

## 主要功能

### 1. 用户认证
- 登录
- 注册
- Token 管理
- 自动刷新 Token

### 2. 仪表板
- 使用量统计
- 订阅状态
- 快捷操作

### 3. 账单管理
- 查看订阅计划
- 升级订阅
- 支付流程

### 4. 设置
- 账户信息
- 密码修改
- API 密钥管理

## 开发

### 代码规范

```bash
npm run lint
```

### 类型检查

```bash
tsc --noEmit
```

## 部署

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_API_BASE_URL | API 基础 URL | http://localhost:8000/api |

## 许可证

MIT License
