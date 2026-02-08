# 智能客服 SaaS 平台 - 完整架构设计

## 📋 产品概述

将现有的智能客服系统升级为完整的 SaaS 平台，提供多租户、订阅制、在线支付的智能客服服务。

## 🎯 核心功能模块

### 1. 用户认证系统 (User Authentication)

#### 1.1 注册/登录
- **邮箱密码注册/登录**
  - 用户注册（邮箱 + 密码）
  - 邮箱验证
  - 密码找回（重置链接）
  - JWT Token 认证
  - Refresh Token 机制

- **微信扫码登录**
  - 生成二维码
  - 轮询检查扫码状态
  - 微信 OAuth2.0 授权
  - 自动绑定已有账号

- **手机号登录**
  - 短信验证码登录
  - 手机号绑定

#### 1.2 用户管理
- 个人资料管理
- 密码修改
- 头像上传
- 安全设置（两步验证）

### 2. 多租户系统 (Multi-tenancy)

#### 2.1 组织管理
- **组织架构**
  - 创建组织/团队
  - 邀请成员
  - 角色权限管理（Owner, Admin, Member, Viewer）
  - 组织设置

- **工作空间**
  - 多工作空间支持
  - 工作空间隔离
  - 资源配额管理

#### 2.2 权限控制 (RBAC)
- 基于角色的访问控制
- 细粒度权限设置
- API 权限管理

### 3. 订阅与计费系统 (Subscription & Billing)

#### 3.1 订阅计划
```
免费版 (Free)
- 1000 条消息/月
- 1 个机器人
- 基础客服功能
- 社区支持

专业版 (Pro) - ¥199/月
- 50,000 条消息/月
- 10 个机器人
- 图像识别 + 语音交互
- 优先支持
- 自定义品牌

企业版 (Enterprise) - ¥999/月
- 无限消息
- 无限机器人
- 全部功能
- 专属支持
- SLA 保证
- 私有化部署选项
```

#### 3.2 使用量追踪
- 消息计数（按对话轮次）
- API 调用统计
- 存储使用量
- 实时使用监控
- 使用量告警

#### 3.3 计费周期
- 月付/年付（年付 8 折）
- 按量计费选项
- 资源包购买
- 发票生成

### 4. 支付集成 (Payment Integration)

#### 4.1 微信支付
- **扫码支付**（PC 端）
- **H5 支付**（移动端）
- **JSAPI 支付**（微信内置）
- **自动续费**（订阅扣费）
- **退款处理**

#### 4.2 支付宝支付
- **扫码支付**（PC 端）
- **手机网站支付**（移动端）
- **电脑网站支付**
- **周期扣款**（订阅）
- **退款处理**

#### 4.3 订单管理
- 订单创建
- 支付状态同步
- 订单查询
- 退款管理
- 发票开具

### 5. 数据库设计 (Database Schema)

#### 5.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    username VARCHAR(100),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    wechat_openid VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 组织表
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    owner_id UUID REFERENCES users(id),
    plan_type VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 组织成员表
CREATE TABLE organization_members (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 订阅表
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, canceled, expired, past_due
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 使用量记录表
CREATE TABLE usage_records (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    resource_type VARCHAR(50), -- message, api_call, storage
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE
);

-- 订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    order_no VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50), -- wechat, alipay
    payment_no VARCHAR(100),
    plan_type VARCHAR(50),
    billing_cycle VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 机器人配置表
CREATE TABLE bots (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    bot_id VARCHAR(100) NOT NULL, -- Coze bot ID
    avatar_url VARCHAR(500),
    welcome_message TEXT,
    settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 对话历史表
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    bot_id UUID REFERENCES bots(id),
    user_id UUID REFERENCES users(id),
    conversation_id VARCHAR(100), -- Coze conversation ID
    title VARCHAR(500),
    message_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API 密钥表
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    scopes TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_usage_org_date ON usage_records(organization_id, date);
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_bots_org ON bots(organization_id);
CREATE INDEX idx_conversations_org ON conversations(organization_id);
```

### 6. API 设计 (RESTful API)

#### 6.1 认证相关
```
POST   /api/v1/auth/register           # 用户注册
POST   /api/v1/auth/login              # 用户登录
POST   /api/v1/auth/logout             # 用户登出
POST   /api/v1/auth/refresh            # 刷新 Token
POST   /api/v1/auth/forgot-password    # 忘记密码
POST   /api/v1/auth/reset-password     # 重置密码
GET    /api/v1/auth/wechat/qr-code     # 获取微信登录二维码
GET    /api/v1/auth/wechat/check       # 检查微信登录状态
```

#### 6.2 用户相关
```
GET    /api/v1/users/me                # 获取当前用户信息
PUT    /api/v1/users/me                # 更新用户信息
PUT    /api/v1/users/me/password       # 修改密码
POST   /api/v1/users/me/avatar         # 上传头像
```

#### 6.3 组织相关
```
GET    /api/v1/organizations           # 获取组织列表
POST   /api/v1/organizations           # 创建组织
GET    /api/v1/organizations/{id}      # 获取组织详情
PUT    /api/v1/organizations/{id}      # 更新组织
DELETE /api/v1/organizations/{id}      # 删除组织
GET    /api/v1/organizations/{id}/members  # 获取成员列表
POST   /api/v1/organizations/{id}/members  # 邀请成员
DELETE /api/v1/organizations/{id}/members/{user_id}  # 移除成员
PUT    /api/v1/organizations/{id}/members/{user_id}/role  # 修改成员角色
```

#### 6.4 订阅相关
```
GET    /api/v1/subscriptions/current   # 获取当前订阅
POST   /api/v1/subscriptions/upgrade   # 升级订阅
POST   /api/v1/subscriptions/cancel    # 取消订阅
GET    /api/v1/usage                   # 获取使用量统计
GET    /api/v1/usage/history           # 获取使用量历史
```

#### 6.5 支付相关
```
POST   /api/v1/payments/wechat/create  # 创建微信支付订单
POST   /api/v1/payments/alipay/create  # 创建支付宝支付订单
POST   /api/v1/payments/callback/wechat # 微信支付回调
POST   /api/v1/payments/callback/alipay # 支付宝支付回调
GET    /api/v1/payments/orders/{id}    # 查询订单状态
POST   /api/v1/payments/orders/{id}/refund # 申请退款
GET    /api/v1/payments/invoices       # 获取发票列表
```

#### 6.6 机器人相关
```
GET    /api/v1/bots                    # 获取机器人列表
POST   /api/v1/bots                    # 创建机器人
GET    /api/v1/bots/{id}               # 获取机器人详情
PUT    /api/v1/bots/{id}               # 更新机器人
DELETE /api/v1/bots/{id}               # 删除机器人
```

#### 6.7 对话相关
```
POST   /api/v1/chat                    # 发送消息（流式/非流式）
GET    /api/v1/conversations           # 获取对话列表
GET    /api/v1/conversations/{id}      # 获取对话详情
DELETE /api/v1/conversations/{id}      # 删除对话
```

#### 6.8 API 密钥
```
GET    /api/v1/api-keys                # 获取 API 密钥列表
POST   /api/v1/api-keys                # 创建 API 密钥
DELETE /api/v1/api-keys/{id}           # 删除 API 密钥
```

### 7. 前端界面 (Frontend)

#### 7.1 用户门户
```
/                    # 首页（落地页）
/login               # 登录页
/register            # 注册页
/dashboard           # 主控制台
/bots                # 机器人管理
/chat                # 聊天界面
/settings            # 设置页面
/billing             # 账单管理
/usage               # 使用量统计
/members             # 成员管理
```

#### 7.2 管理后台
```
/admin               # 管理后台首页
/admin/users         # 用户管理
/admin/organizations # 组织管理
/admin/subscriptions # 订阅管理
/admin/orders        # 订单管理
/admin/analytics     # 数据分析
/admin/settings      # 系统设置
```

### 8. 技术栈

#### 后端
- **框架**: FastAPI 0.104+
- **数据库**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0
- **迁移**: Alembic
- **缓存**: Redis
- **认证**: JWT (python-jose)
- **密码**: bcrypt
- **支付**:
  - 微信支付: wechatpy
  - 支付宝: alipay-sdk-python
- **任务队列**: Celery + Redis
- **WebSocket**: FastAPI WebSocket
- **验证**: Pydantic v2

#### 前端
- **框架**: React 18
- **状态管理**: Redux Toolkit
- **UI 组件**: Material-UI v5
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **表单**: React Hook Form + Zod
- **图表**: Recharts / Chart.js
- **支付**:
  - 微信支付: 微信 H5 支付 SDK
  - 支付宝: 支付宝网页支付 SDK

#### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **CI/CD**: GitHub Actions

### 9. 安全性

#### 9.1 认证安全
- JWT Token 有效期管理
- Refresh Token 轮换
- 密码强度要求
- 登录失败限制
- 两步验证（可选）

#### 9.2 API 安全
- API 速率限制（按用户/组织）
- API Key 认证
- CORS 配置
- SQL 注入防护（ORM）
- XSS 防护

#### 9.3 数据安全
- 敏感数据加密存储
- HTTPS 强制
- 数据备份
- 访问日志审计

### 10. 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                        用户                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Nginx (反向代理)                       │
│  - SSL 终止                                              │
│  - 静态文件服务                                          │
│  - 负载均衡                                              │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│   前端 (React)    │      │  后端 (FastAPI)   │
│   - 用户门户      │      │  - API 服务       │
│   - 管理后台      │      │  - WebSocket      │
└──────────────────┘      └─────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │  PostgreSQL  │ │  Redis   │ │  Celery      │
            │  - 主数据库   │ │  - 缓存   │ │  - 异步任务   │
            │  - 用户数据   │ │  - 会话   │ │  - 定时任务   │
            └──────────────┘ └──────────┘ └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ 支付网关      │
                            │ - 微信支付    │
                            │ - 支付宝      │
                            └──────────────┘
```

## 🚀 实施计划

### 阶段 1: 基础架构（Week 1-2）
- [ ] 数据库设计与迁移
- [ ] 用户认证系统
- [ ] JWT Token 实现
- [ ] 基础 API 框架

### 阶段 2: 核心功能（Week 3-4）
- [ ] 多租户系统
- [ ] 组织管理
- [ ] 权限控制
- [ ] 机器人管理

### 阶段 3: 计费系统（Week 5-6）
- [ ] 订阅计划
- [ ] 使用量追踪
- [ ] 微信支付集成
- [ ] 支付宝支付集成

### 阶段 4: 前端开发（Week 7-8）
- [ ] 用户门户 UI
- [ ] 管理后台 UI
- [ ] 支付流程 UI
- [ ] 数据可视化

### 阶段 5: 测试与优化（Week 9-10）
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 安全审计

### 阶段 6: 部署上线（Week 11-12）
- [ ] Docker 容器化
- [ ] CI/CD 配置
- [ ] 监控配置
- [ ] 生产环境部署

## 📊 成本估算

### 开发成本
- 后端开发: 2 人 × 12 周 = 24 人周
- 前端开发: 1 人 × 8 周 = 8 人周
- 测试: 1 人 × 4 周 = 4 人周
- 总计: 36 人周

### 运营成本（月）
- 服务器: ¥2,000
- 数据库: ¥1,000
- CDN: ¥500
- 监控: ¥300
- 支付手续费: 0.6% 流水
- 总计: ¥3,800+ /月

## 💰 收入预测

### 保守估计
- 免费用户: 1,000
- 付费转化率: 3%
- 付费用户: 30
- 专业版（¥199/月）: 25 人 × ¥199 = ¥4,975
- 企业版（¥999/月）: 5 人 × ¥999 = ¥4,995
- 月收入: ¥9,970
- 年收入: ¥119,640

### 乐观估计
- 免费用户: 10,000
- 付费转化率: 5%
- 付费用户: 500
- 专业版: 400 人 × ¥199 = ¥79,600
- 企业版: 100 人 × ¥999 = ¥99,900
- 月收入: ¥179,500
- 年收入: ¥2,154,000

## 🔧 下一步行动

1. ✅ 创建完整的数据库迁移脚本
2. ✅ 实现用户认证 API
3. ✅ 集成微信支付和支付宝
4. ✅ 开发前端用户界面
5. ✅ 部署测试环境
6. ✅ 进行端到端测试

---

**文档版本**: 1.0
**最后更新**: 2026-01-29
**状态**: 待实施
