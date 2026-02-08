# 系统验证和测试指南

本文档说明如何验证智能客服 SaaS 平台的所有功能。

## 📋 前置条件

在开始验证之前，请确保：

1. **已安装所有依赖**
   ```bash
   cd saas_backend
   pip install -r requirements.txt
   ```

2. **数据库已配置**
   ```bash
   # 确保 PostgreSQL 正在运行
   sudo systemctl status postgresql

   # 创建数据库
   createdb saas_customer_service
   ```

3. **环境变量已配置**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接等
   ```

## 🚀 快速验证

### 自动化验证脚本

我们提供了一个自动化验证脚本，可以测试所有核心功能：

```bash
cd saas_backend
python verify_system.py
```

该脚本将验证：

✅ 数据库模型和表结构
✅ 用户注册功能
✅ 用户认证和 Token 生成
✅ 组织管理功能
✅ 订阅计划配置
✅ 使用量追踪功能
✅ 支付集成（模拟）
✅ API 端点（健康检查）

### 手动验证步骤

#### 1. 数据库验证

```bash
# 连接到数据库
psql -U postgres -d saas_customer_service

# 查看所有表
\dt

# 应该看到以下表：
# - users
# - organizations
# - organization_members
# - subscriptions
# - usage_records
# - orders
# - bots
# - conversations
# - api_keys

# 查看用户表
SELECT id, email, is_active, created_at FROM users LIMIT 5;

# 退出
\q
```

#### 2. 后端 API 验证

**启动后端服务**：
```bash
cd saas_backend
python -m app.main
```

**测试健康检查**：
```bash
curl http://localhost:8000/health
```

**测试 API 文档**：
在浏览器中访问：http://localhost:8000/docs

**测试用户注册**：
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "username": "testuser"
  }'
```

**测试用户登录**：
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=TestPassword123"
```

**测试获取当前用户**（需要替换 YOUR_TOKEN）：
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. 前端验证

**启动前端服务**：
```bash
cd saas_frontend
npm install
npm run dev
```

**验证功能**：
1. 访问 http://localhost:3000
2. 点击"立即注册"
3. 填写注册信息并提交
4. 使用注册的账户登录
5. 查看仪表板
6. 浏览账单页面
7. 查看设置页面

## 🧪 功能测试清单

### 认证系统
- [ ] 用户注册
- [ ] 用户登录
- [ ] Token 刷新
- [ ] 获取用户信息
- [ ] 修改密码
- [ ] 退出登录

### 组织管理
- [ ] 创建组织
- [ ] 查看组织列表
- [ ] 查看组织详情
- [ ] 邀请成员
- [ ] 移除成员
- [ ] 修改成员角色

### 订阅系统
- [ ] 查看订阅计划
- [ ] 查看当前订阅
- [ ] 升级订阅（创建支付订单）
- [ ] 取消订阅
- [ ] 订阅状态更新

### 支付系统
- [ ] 创建微信支付订单
- [ ] 创建支付宝支付订单
- [ ] 查询订单状态
- [ ] 处理支付回调（模拟）
- [ ] 订阅自动激活

### 使用量追踪
- [ ] 记录使用量
- [ ] 查看使用量统计
- [ ] 查看使用量历史
- [ ] 使用量限制检查
- [ ] 超限告警

### 机器人管理
- [ ] 创建机器人
- [ ] 查看机器人列表
- [ ] 更新机器人配置
- [ ] 删除机器人
- [ ] 对话历史记录

## 🔧 常见问题排查

### 数据库连接失败

**问题**: `could not connect to server`

**解决方案**:
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql

# 检查数据库是否存在
psql -U postgres -l | grep saas_customer_service

# 如果不存在，创建数据库
createdb saas_customer_service
```

### API 启动失败

**问题**: `ImportError` 或 `ModuleNotFoundError`

**解决方案**:
```bash
# 重新安装依赖
pip install -r requirements.txt

# 检查 Python 版本
python --version  # 应该是 3.8+
```

### 前端构建失败

**问题**: `npm install` 失败

**解决方案**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果还有问题，尝试使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 支付回调测试失败

**问题**: 支付回调 URL 无法访问

**解决方案**:
- 确保 API 服务正在运行
- 检查防火墙设置
- 使用内网穿透工具（如 ngrok）测试
- 检查回调 URL 配置

## 📊 性能测试

### 使用 Apache Bench 测试 API

```bash
# 安装
sudo apt-get install apache2-utils

# 测试登录接口
ab -n 1000 -c 10 -p login.json -T application/x-www-form-urlencoded \
   http://localhost:8000/api/v1/auth/login
```

### 数据库性能测试

```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- 查看表大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔐 安全性验证

### SQL 注入测试
```bash
# 尝试 SQL 注入
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=' OR '1'='1&password=x"
# 应该返回 401 错误
```

### XSS 测试
```bash
# 尝试 XSS
curl -X PUT http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "<script>alert(\"xss\")</script>"}'
# 应该被正确转义或拒绝
```

### 认证测试
```bash
# 测试未授权访问
curl http://localhost:8000/api/v1/auth/me
# 应该返回 401 错误
```

## 📝 测试报告模板

完成测试后，请填写以下报告：

```markdown
## 测试报告

**测试日期**: 2026-xx-xx
**测试人员**: xxx
**环境**: 开发/测试/生产

### 功能测试结果

| 模块 | 测试项 | 结果 | 备注 |
|------|--------|------|------|
| 认证系统 | 用户注册 | ✅/❌ | |
| 认证系统 | 用户登录 | ✅/❌ | |
| 组织管理 | 创建组织 | ✅/❌ | |
| 订阅系统 | 升级订阅 | ✅/❌ | |
| 支付系统 | 微信支付 | ✅/❌ | |
| 支付系统 | 支付宝 | ✅/❌ | |

### 性能测试结果

| 指标 | 目标 | 实际 | 结果 |
|------|------|------|------|
| API 响应时间 | < 100ms | xx ms | ✅/❌ |
| 数据库查询 | < 50ms | xx ms | ✅/❌ |
| 并发用户 | 1000+ | xxx | ✅/❌ |

### 发现的问题

1. 问题描述
   - 重现步骤
   - 预期结果
   - 实际结果

### 建议

- 改进建议 1
- 改进建议 2
```

## 🎯 下一步

测试通过后，您可以：

1. **部署到生产环境**
   - 参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

2. **配置真实支付**
   - 申请微信支付商户号
   - 申请支付宝商户号
   - 更新 `.env` 配置

3. **优化性能**
   - 配置 Redis 缓存
   - 优化数据库查询
   - 启用 CDN

4. **加强安全**
   - 启用 HTTPS
   - 配置防火墙
   - 设置速率限制

---

**如有问题，请参考**:
- [架构设计文档](./SAAS_ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT.md)
- [项目 README](./README_SAAS.md)
