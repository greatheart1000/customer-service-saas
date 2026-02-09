# 前端调试指南

## 问题：前端点击按钮没有反应

### 快速诊断步骤

#### 1. 检查是否已登录

**操作步骤**:
1. 打开浏览器开发者工具（F12）
2. 切换到 **Application** 标签
3. 左侧找到 **Local Storage**
4. 选择 `http://localhost:3000`
5. 检查以下值是否存在：
   - `access_token`
   - `refresh_token`

**如果不存在或已过期**:
```
解决方案：重新登录
1. 访问 http://localhost:3000/login
2. 使用 admin@test.com / Admin123 登录
```

#### 2. 检查Console错误

**操作步骤**:
1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 尝试点击没有反应的按钮
4. 查看是否有红色错误信息

**常见错误**:
```
❌ 401 Unauthorized
原因: Token过期或无效
解决: 重新登录

❌ 403 Forbidden
原因: 权限不足
解决: 使用admin账号登录

❌ Network Error
原因: 后端服务未启动
解决: 检查后端是否运行在 http://localhost:8000

❌ TypeError: Cannot read property 'xxx' of undefined
原因: 前端代码错误
解决: 查看具体错误行号，检查代码
```

#### 3. 检查Network请求

**操作步骤**:
1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 点击没有反应的按钮
4. 查看是否有新的请求出现

**检查要点**:
```
✅ 请求存在：
   - 查看状态码（200=成功, 401=未认证, 500=服务器错误）
   - 查看Response内容
   - 查看Request参数

❌ 请求不存在：
   - 说明前端事件处理器未触发
   - 可能是JavaScript错误导致
```

### 具体问题排查

#### 问题A: 用户管理 - 删除按钮没反应

**检查清单**:
1. ✅ 是否已登录？（检查Local Storage）
2. ✅ 是否有管理员权限？（使用admin@test.com登录）
3. ✅ Console是否有错误？
4. ✅ Network是否有DELETE请求？

**调试代码**:
在浏览器Console中执行：
```javascript
// 检查token
console.log('Token:', localStorage.getItem('access_token'));

// 检查当前用户
fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  }
}).then(r => r.json()).then(console.log);
```

**手动测试API**:
```bash
# 获取token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=Admin123" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 测试删除用户（替换USER_ID）
curl -X DELETE "http://localhost:8000/api/v1/admin/users/USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 问题B: 知识库管理 - 编辑/删除文档没反应

**检查清单**:
1. ✅ 是否选择了知识库？
2. ✅ 文档列表是否加载？
3. ✅ Console是否有错误？
4. ✅ 点击按钮时Network是否有请求？

**快速测试**:
在浏览器Console中执行：
```javascript
// 测试知识库API
const token = localStorage.getItem('access_token');
const kbId = 'a4b8238f-6a93-4c5e-89b3-876c12feff95'; // 产品知识库ID

// 获取文档列表
fetch(`http://localhost:8000/api/v1/admin/knowledge/${kbId}/documents`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('文档列表:', data));
```

### 前端重新编译

如果怀疑前端代码有问题，强制刷新：

**Chrome/Edge**:
- `Ctrl + Shift + R` (Windows)
- `Cmd + Shift + R` (Mac)

**清除缓存**:
1. F12打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 重新启动前端

```bash
# 停止前端（Ctrl+C）
# 重新启动
cd saas_frontend
npm run dev
```

### 检查前端构建

```bash
cd saas_frontend
npm run build
```

检查是否有构建错误。

### 常见错误码

| 状态码 | 含义 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | ✅ 正常 |
| 401 | 未认证 | 重新登录 |
| 403 | 权限不足 | 使用管理员账号 |
| 404 | 资源不存在 | 检查API路径 |
| 500 | 服务器错误 | 查看后端日志 |

### 后端日志查看

```bash
# 查看后端日志
tail -f /tmp/backend.log

# 或查看最后100行
tail -100 /tmp/backend.log
```

### 完整测试流程

1. **清除浏览器数据**
   - F12 > Application > Clear storage > Clear site data

2. **重新登录**
   - 访问 http://localhost:3000
   - 登录: admin@test.com / Admin123

3. **测试用户管理**
   - 进入用户管理页面
   - 打开F12 > Network标签
   - 点击删除按钮
   - 查看Network是否有DELETE请求
   - 查看Console是否有错误

4. **测试知识库管理**
   - 进入知识库管理页面
   - 点击"产品知识库"
   - 打开F12 > Network标签
   - 点击编辑/删除按钮
   - 查看Network请求
   - 查看Console错误

### 获取帮助

如果以上步骤都无法解决问题，请提供：

1. **浏览器Console截图**
   - 打开F12 > Console标签
   - 截图所有红色错误

2. **Network请求截图**
   - 打开F12 > Network标签
   - 点击有问题的按钮
   - 截图失败的请求（包括Headers、Response）

3. **后端日志**
   ```bash
   tail -100 /tmp/backend.log
   ```

4. **前端版本**
   ```bash
   cd saas_frontend
   git log -1
   ```

5. **后端版本**
   ```bash
   cd saas_backend
   git log -1
   ```
