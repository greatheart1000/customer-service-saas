# 🏢 多租户架构实现文档

## 概述

本文档描述了智能客服SaaS系统的多租户架构实现，包括后端API隔离、前端访问方式、数据隔离策略等关键设计。

**更新时间**: 2026-02-10
**版本**: v1.0.0

---

## 📋 目录

1. [架构概览](#架构概览)
2. [后端实现](#后端实现)
3. [前端实现](#前端实现)
4. [API端点](#api端点)
5. [数据隔离策略](#数据隔离策略)
6. [安全措施](#安全措施)
7. [使用示例](#使用示例)

---

## 架构概览

### 设计原则

本系统采用 **Shared Database, Shared Schema + Tenant ID** 模式，实现多租户数据隔离：

```
┌─────────────────────────────────────────────────────┐
│              应用层 (FastAPI + React)               │
├─────────────────────────────────────────────────────┤
│  管理员界面      │  客服工作台    │  终端用户聊天    │
│  /admin/*       │  /agent/*     │  /tenant/:uuid/*  │
├─────────────────────────────────────────────────────┤
│           租户中间件 (Tenant Middleware)             │
│  - JWT Token 提取租户ID                             │
│  - UUID 路径解析                                    │
│  - 自动注入租户过滤条件                              │
├─────────────────────────────────────────────────────┤
│              数据库层 (MySQL)                       │
│  所有业务表包含 organization_id 字段                 │
│  强制索引: idx_organization_id                      │
└─────────────────────────────────────────────────────┘
```

### 三种访问方式

| 界面类型 | 访问方式 | 认证方式 | 数据范围 |
|---------|---------|---------|---------|
| **管理员界面** | `/admin/*` | JWT (平台管理员) | 全平台数据 |
| **客服工作台** | `/agent/*` | JWT (组织成员) | 当前组织数据 |
| **终端用户聊天** | `/tenant/:uuid/chat` | 无需认证 | 指定租户数据 |

---

## 后端实现

### 1. 数据库模型

所有业务模型都包含 `organization_id` 字段：

```python
# app/models/bot.py
class Bot(Base):
    __tablename__ = "bots"

    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    # ... 其他字段

# app/models/conversation.py
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    # ... 其他字段

# app/models/knowledge_base.py
class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    # ... 其他字段
```

### 2. 租户依赖注入

**文件**: `app/api/v1/endpoints/deps.py`

```python
async def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Organization:
    """
    获取当前用户的租户（组织）
    - 从用户信息中获取所属组织
    - 用于客服/运营人员登录后的租户隔离
    """
    from app.models.organization_member import OrganizationMember

    membership = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="User does not belong to any organization")

    organization = db.query(Organization).filter(
        Organization.id == membership.organization_id
    ).first()

    if not organization or not organization.is_active:
        raise HTTPException(status_code=403, detail="Organization not found or inactive")

    return organization


async def get_tenant_from_uuid(
    tenant_uuid: str,
    db: Session = Depends(get_db)
) -> Organization:
    """
    通过 UUID 获取租户（组织）
    - 用于终端用户通过域名+UUID访问时
    - 从路径参数中解析租户UUID
    """
    organization = db.query(Organization).filter(
        Organization.id == tenant_uuid
    ).first()

    if not organization or not organization.is_active:
        raise HTTPException(status_code=404, detail="Tenant not found or inactive")

    return organization
```

### 3. 租户API端点

**文件**: `app/api/v1/endpoints/tenant.py`

```python
@router.get("/{tenant_uuid}/info", response_model=TenantInfoResponse)
def get_tenant_info(
    tenant_uuid: str,
    db: Session = Depends(get_db)
):
    """
    获取租户公开信息（用于终端用户）
    - 返回租户基本信息
    - 返回可用的机器人列表
    - 用于加载聊天窗口时的初始化
    """
    tenant = db.query(Organization).filter(
        Organization.id == tenant_uuid,
        Organization.is_active == True
    ).first()

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found or inactive")

    bots = db.query(Bot).filter(
        Bot.organization_id == tenant_uuid,
        Bot.is_active == True
    ).all()

    return TenantInfoResponse(
        id=tenant.id,
        name=tenant.name,
        is_active=tenant.is_active,
        bots=[BotResponse(...) for bot in bots]
    )
```

---

## 前端实现

### 1. 租户服务

**文件**: `saas_frontend/src/services/tenant.ts`

```typescript
/**
 * 获取租户公开信息
 * @param tenantUuid 租户UUID
 */
export const getTenantInfo = async (tenantUuid: string): Promise<TenantInfo> => {
  const response = await api.get<TenantInfo>(`/tenant/${tenantUuid}/info`);
  return response.data;
};

/**
 * 从URL中提取租户UUID
 * 支持以下格式：
 * - /tenant/:uuid/chat
 * - ?tenant_id=:uuid
 */
export const extractTenantUuidFromUrl = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/\/(?:tenant|chat)\/([a-f0-9-]{36})/i);
  if (match && match[1]) {
    return match[1];
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('tenant_id');
};
```

### 2. 嵌入式聊天组件

**文件**: `saas_frontend/src/pages/embedded/TenantChatPage.tsx`

**特点**:
- 无需登录，通过租户UUID识别
- 轻量级设计，适合嵌入iframe
- 自动加载租户的机器人配置
- 支持自定义品牌颜色和logo
- 流式消息响应

**使用方式**:

```tsx
// 方式1: 直接访问
window.open('https://yourdomain.com/tenant/24056e7b-2ebd-4804-a539-b380b60b8e28/chat');

// 方式2: iframe嵌入
<iframe
  src="https://yourdomain.com/tenant/24056e7b-2ebd-4804-a539-b380b60b8e28/chat"
  width="400"
  height="600"
  frameborder="0"
></iframe>

// 方式3: 查询参数
window.open('https://yourdomain.com/tenant/chat?tenant_id=24056e7b-2ebd-4804-a539-b380b60b8e28');
```

### 3. 路由配置

**文件**: `saas_frontend/src/App.tsx`

```tsx
<Routes>
  {/* 公开路由 */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* 租户嵌入式聊天路由 (无需认证) */}
  <Route path="/tenant/:tenantUuid/chat" element={<TenantChatPage />} />

  {/* 用户端路由 (需要认证) */}
  <Route path="/" element={<PrivateRoute><CustomerLayout /></PrivateRoute>}>
    <Route path="chat" element={<ChatPage />} />
    {/* ... */}
  </Route>

  {/* 管理端路由 (需要管理员权限) */}
  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
    {/* ... */}
  </Route>
</Routes>
```

---

## API端点

### 公开端点（无需认证）

| 方法 | 端点 | 描述 |
|-----|------|------|
| GET | `/api/v1/tenant/{tenant_uuid}/info` | 获取租户信息和机器人列表 |
| GET | `/api/v1/tenant/{tenant_uuid}/bots` | 获取租户的所有机器人 |
| GET | `/api/v1/tenant/{tenant_uuid}/bots/{bot_id}` | 获取特定机器人详情 |
| GET | `/api/v1/tenant/{tenant_uuid}/knowledge-bases` | 获取租户的知识库列表 |

### 客服端点（需要JWT认证）

所有客服相关的API都通过 `get_current_tenant` 依赖自动注入租户过滤：

```python
@router.get("/conversations")
def get_conversations(
    current_tenant: Organization = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    # 自动只返回当前租户的对话
    conversations = db.query(Conversation).filter(
        Conversation.organization_id == current_tenant.id
    ).all()
    return conversations
```

### 管理端点（需要平台管理员权限）

```python
@router.get("/admin/users")
def get_all_users(
    current_admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    # 可以访问全平台数据
    users = db.query(User).all()
    return users
```

---

## 数据隔离策略

### 1. 数据库层隔离

**强制索引**:
```sql
CREATE INDEX idx_organization_id ON bots(organization_id);
CREATE INDEX idx_organization_id ON conversations(organization_id);
CREATE INDEX idx_organization_id ON knowledge_bases(organization_id);
```

**所有查询必须包含租户过滤**:
```python
# ✅ 正确
conversations = db.query(Conversation).filter(
    Conversation.organization_id == current_tenant.id
).all()

# ❌ 错误 - 缺少租户过滤
conversations = db.query(Conversation).all()
```

### 2. API层隔离

**后端不信任前端传的租户ID**:
```python
# ❌ 错误 - 允许前端传递租户ID
@router.get("/conversations")
def get_conversations(tenant_id: str):
    # 危险：前端可以伪造租户ID
    return db.query(Conversation).filter(
        Conversation.organization_id == tenant_id
    ).all()

# ✅ 正确 - 从Token中获取租户ID
@router.get("/conversations")
def get_conversations(current_tenant: Organization = Depends(get_current_tenant)):
    # 安全：租户ID从JWT Token中解析
    return db.query(Conversation).filter(
        Conversation.organization_id == current_tenant.id
    ).all()
```

### 3. 缓存隔离

Redis Key 包含租户ID：
```
# ✅ 正确
conversations:{tenant_id}:{user_id}
bot_config:{tenant_id}:{bot_id}

# ❌ 错误 - 可能跨租户污染
conversations:{user_id}
bot_config:{bot_id}
```

### 4. 文件隔离

存储路径按租户分隔：
```
/uploads/{tenant_id}/{bot_id}/avatar.jpg
/uploads/{tenant_id}/kb/{doc_id}.pdf
```

---

## 安全措施

### 1. JWT Token 结构

```json
{
  "sub": "user_id",
  "tenant_id": "organization_id",  // 用于客服端
  "role": "admin|org_admin|agent|member",
  "type": "access",
  "exp": 1234567890
}
```

### 2. 权限层级

| 角色 | 权限范围 | 可访问数据 |
|-----|---------|-----------|
| `is_admin=True` | 平台管理员 | 全平台所有租户数据 |
| `is_org_admin=True` | 组织管理员 | 当前组织所有数据 |
| 普通成员 | 客服/运营人员 | 当前组织分配的数据 |

### 3. 跨租户访问防护

**场景**: 用户尝试访问其他租户的数据

```python
# 用户A属于租户X，尝试访问租户Y的机器人
GET /api/v1/tenant/tenant-y-uuid/bots/bot-x-id

# 结果：404 Not Found
# 原因：bot-x-id 不属于 tenant-y-uuid
```

**测试**:
```bash
# 测试1: 不存在的租户
GET /api/v1/tenant/fake-uuid/info
# 预期: 404 Not Found

# 测试2: 跨租户访问
GET /api/v1/tenant/tenant-y/bots/bot-x
# 预期: 404 Not Found (bot-x属于tenant-x)
```

---

## 使用示例

### 示例1: 终端用户访问聊天

**场景**: 用户访问企业网站的客服聊天

```bash
# 1. 企业在网站嵌入iframe
<iframe src="https://kefu.yoursaas.com/tenant/24056e7b-2ebd-4804-a539-b380b60b8e28/chat"></iframe>

# 2. 用户打开网页，前端自动：
#    - 从URL提取UUID: 24056e7b-2ebd-4804-a539-b380b60b8e28
#    - 调用 GET /api/v1/tenant/24056e7b-2ebd-4804-a539-b380b60b8e28/info
#    - 加载租户的机器人和配置
#    - 显示聊天界面

# 3. 用户发送消息
POST /api/v1/chat/stream
{
  "bot_id": "bot-001",
  "content": "你好",
  "conversation_id": null  # 新对话
}

# 后端自动：
# - 验证bot-001属于租户24056e7b-2ebd-4804-a539-b380b60b8e28
# - 创建对话时自动注入organization_id
# - 返回流式响应
```

### 示例2: 客服人员登录

```bash
# 1. 客服登录
POST /api/v1/auth/login
{
  "username": "agent@company.com",
  "password": "password"
}

# 返回JWT Token（包含tenant_id）
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}

# 2. 访问客服工作台
GET /api/v1/conversations
Authorization: Bearer eyJhbGc...

# 后端自动：
# - 解码JWT Token
# - 提取tenant_id
# - 只返回该租户的对话
```

### 示例3: 管理员查看全平台数据

```bash
# 1. 平台管理员登录
POST /api/v1/auth/login
{
  "username": "admin@platform.com",
  "password": "admin_password"
}

# 2. 查看所有租户
GET /api/v1/admin/organizations
Authorization: Bearer eyJhbGc...

# 返回全平台所有组织
```

---

## 测试验证

运行多租户API测试：

```bash
cd saas_backend
python test_tenant_api.py
```

**测试覆盖**:
- ✅ 获取租户信息（无需认证）
- ✅ 获取租户机器人列表
- ✅ 获取租户知识库列表
- ✅ 不存在的租户返回404
- ✅ 跨租户访问被阻止

---

## 部署建议

### 初期（MVP阶段）

使用UUID路径模式：
```
https://yourdomain.com/tenant/{uuid}/chat
```

**优点**:
- 部署简单，无需DNS配置
- 适合快速验证产品

### 后期（规模化）

支持自定义子域名：
```
https://clientA.yourdomain.com/chat
https://clientB.yourdomain.com/chat
```

**优点**:
- 品牌感更强
- 支持白标（White-label）
- 更专业

**实现**:
1. 配置通配符DNS: `*.yourdomain.com`
2. Nginx反向代理根据子域名提取租户标识
3. 查询租户配置表获取实际organization_id

---

## 故障排查

### 问题1: 租户UUID无效

**错误**: `Tenant with UUID xxx not found`

**原因**:
1. UUID格式错误
2. 租户不存在
3. 租户已被禁用（is_active=False）

**解决**:
```bash
# 检查数据库
SELECT id, name, is_active FROM organizations WHERE id = 'xxx';

# 查看所有活跃租户
SELECT id, name FROM organizations WHERE is_active = True;
```

### 问题2: 跨租户数据泄露

**症状**: 客服A可以看到客服B的对话

**排查**:
1. 检查API是否使用 `get_current_tenant` 依赖
2. 检查数据库查询是否包含 `organization_id` 过滤
3. 检查JWT Token是否包含正确的 `tenant_id`

### 问题3: 前端无法提取租户UUID

**原因**: URL格式不匹配

**解决**:
```typescript
// 支持的格式：
// ✅ /tenant/uuid/chat
// ✅ /tenant/chat?tenant_id=uuid
// ❌ /chat/tenant/uuid
```

---

## 总结

本多租户架构实现了：

✅ **数据隔离**: 所有业务数据按租户严格隔离
✅ **安全访问**: JWT Token + 后端强制过滤
✅ **灵活访问**: 支持UUID路径、查询参数等多种访问方式
✅ **可扩展**: 从MVP到企业级平滑升级
✅ **易于集成**: 前端iframe嵌入，后端RESTful API

**下一步优化**:
- 支持自定义子域名
- 实现租户级别的品牌定制
- 添加租户配额和限流
- 实现跨租户数据迁移工具

---

**文档维护**: 本文档应随系统演进持续更新
**技术支持**: 如有问题请联系技术团队
