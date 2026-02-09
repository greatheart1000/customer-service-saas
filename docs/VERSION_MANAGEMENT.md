# 📋 Git分支与版本管理指南

## 当前状态分析

### 现有情况

```bash
$ git branch -a
* main
  remotes/origin/main
```

**问题**:
- ❌ 只有一个分支
- ❌ 没有版本标签
- ❌ 无法回退到历史版本
- ❌ 开发新功能风险高

---

## 🎯 推荐策略：GitHub Flow + Semantic Versioning

适合个人项目或小型团队的简化版本管理流程。

---

## 🌿 分支管理

### 1. 主分支 (main)

**用途**: 生产环境代码

**规则**:
- ✅ 始终保持可部署状态
- ✅ 只接受经过测试的代码
- ✅ 受到保护，不可直接推送

```bash
# 设置main分支为保护分支（在GitHub设置中）
Settings → Branches → Add rule
- Branch name pattern: main
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
```

### 2. 功能分支 (feature/*)

**用途**: 开发新功能

**命名规则**:
```
feature/功能名称
例如:
feature/tenant-api
feature/agent-dashboard
feature/realtime-chat
```

**工作流程**:
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 开发并提交
git add .
git commit -m "feat: 添加XXX功能"

# 3. 推送到远程
git push -u origin feature/your-feature-name

# 4. 创建Pull Request（在GitHub上操作）

# 5. 代码审查通过后合并到main

# 6. 删除功能分支
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 3. 修复分支 (fix/* 或 hotfix/*)

**用途**: 紧急问题修复

**命名规则**:
```
fix/问题描述
hotfix/严重问题
```

**工作流程**:
```bash
# 1. 创建修复分支
git checkout -b hotfix/critical-bug

# 2. 修复并测试
# ... 修复代码 ...

# 3. 合并到main
git checkout main
git merge --no-ff hotfix/critical-bug

# 4. 创建版本标签
git tag -a v1.0.1 -m "修复XXX问题"

# 5. 推送
git push origin main --tags
```

---

## 🏷️ 版本标签（Semantic Versioning）

### 版本号格式

```
v主版本号.次版本号.修订号 (vMAJOR.MINOR.PATCH)

例如:
v1.0.0 - 第一个稳定版本
v1.1.0 - 添加新功能（向后兼容）
v1.1.1 - Bug修复
v2.0.0 - 重大更新（不兼容旧版本）
```

### 何时升级版本号

| 变更类型 | 版本号示例 | 说明 |
|---------|-----------|------|
| 🔴 重大更新 | v1.0.0 → v2.0.0 | API变更、数据结构改变、不兼容旧版 |
| 🟢 新功能 | v1.0.0 → v1.1.0 | 添加新功能、向后兼容 |
| 🟡 Bug修复 | v1.1.0 → v1.1.1 | Bug修复、小改进 |

### 创建版本标签

**方式1: 使用脚本**（推荐）
```bash
./scripts/create_release.sh v1.0.0
```

**方式2: 手动创建**
```bash
# 1. 创建带注释的标签
git tag -a v1.0.0 -m "Release v1.0.0

## 主要功能
- 多租户架构实现
- 客服工作台界面
- 嵌入式聊天组件

## 技术栈
- 前端: React 18 + TypeScript
- 后端: FastAPI + Python
- 算法: RAG + LangChain
"

# 2. 推送标签到远程
git push origin v1.0.0

# 3. 查看所有标签
git tag -l

# 4. 查看标签详情
git show v1.0.0
```

---

## 📊 实际案例

### 案例1: 开发新功能

```bash
# 当前版本: v1.0.0

# 1. 创建功能分支
git checkout -b feature/websocket-chat

# 2. 开发WebSocket实时聊天功能
# ... 编码几天 ...

# 3. 提交代码
git add .
git commit -m "feat: 添加WebSocket实时聊天功能

- 实现双向通信
- 添加在线状态
- 支持消息已读回执
"

# 4. 推送并创建PR
git push -u origin feature/websocket-chat

# 5. 在GitHub上创建Pull Request到main分支

# 6. 代码审查、测试通过后合并

# 7. 更新版本号到v1.1.0并打标签
git checkout main
git pull
git tag -a v1.1.0 -m "Release v1.1.0: 添加WebSocket实时聊天"
git push origin v1.1.0
```

### 案例2: 紧急Bug修复

```bash
# 生产版本: v1.1.0

# 1. 发现严重Bug

# 2. 从main创建修复分支
git checkout -b hotfix/login-error

# 3. 快速修复
git commit -am "fix: 修复登录JWT过期问题"

# 4. 合并到main
git checkout main
git merge --no-ff hotfix/login-error

# 5. 创建修复版本
git tag -a v1.1.1 -m "Hotfix: 修复登录JWT过期问题"
git push origin main v1.1.1
```

### 案例3: 重大版本更新

```bash
# 当前版本: v1.1.0

# 1. 创建特性分支
git checkout -b feature/v2-upgrade

# 2. 进行重大改动（不兼容旧版）
# - 数据库结构变更
# - API接口重新设计
# - 依赖升级

# 3. 合并后创建v2.0.0
git checkout main
git merge --no-ff feature/v2-upgrade
git tag -a v2.0.0 -m "Release v2.0.0: 重大架构升级

- 迁移到微服务架构
- 全新的API设计
- 性能提升300%
"
git push origin main v2.0.0
```

---

## 🔄 版本回退

### 查看版本历史

```bash
# 查看所有标签
git tag -l

# 查看提交历史
git log --oneline --graph --all -20

# 查看特定版本详情
git show v1.0.0
```

### 回退到指定版本

**方式1: 创建新分支**（推荐，保留历史）
```bash
# 基于v1.0.0创建新分支
git checkout -b hotfix-from-v1.0.0 v1.0.0

# 修复问题
git commit -am "hotfix: ..."

# 合并回main
git checkout main
git merge hotfix-from-v1.0.0
```

**方式2: 强制回退**（危险，会丢失历史）
```bash
# 回退到v1.0.0
git reset --hard v1.0.0

# 强制推送（⚠️ 谨慎使用）
git push --force origin main
```

**方式3: Revert**（推荐，创建反向提交）
```bash
# 回退到v1.0.0，但保留历史
git revert v1.1.0

# 推送
git push origin main
```

---

## 📦 GitHub Releases

### 在GitHub上创建Release

**方式1: 使用标签自动创建**

推送标签后，GitHub会自动识别并创建Release草稿：
```bash
git push origin v1.0.0
```

然后访问：
```
https://github.com/greatheart1000/customer-service-saas/releases
```

填写Release Notes并发布。

**方式2: 手动创建**

1. 访问仓库页面
2. 点击 "Releases" → "Create a new release"
3. 选择标签或新建标签
4. 填写Release Notes
5. 上传附件（如编译好的文件）
6. 点击 "Publish release"

### Release Notes 模板

```markdown
## 🎉 v1.0.0 - 首个正式版本

### ✨ 新功能
- ✅ 多租户SaaS架构
- ✅ 管理员界面（用户、机器人、对话、知识库管理）
- ✅ 客服工作台（收件箱、聊天、用户信息）
- ✅ 终端用户嵌入式聊天
- ✅ RAG知识库检索

### 🔧 技术栈
- 前端: React 18 + TypeScript + Material-UI
- 后端: FastAPI + Python + MySQL
- 算法: RAG + LangChain + ChromaDB

### 📚 文档
- [快速开始](docs/QUICK_START.md)
- [部署指南](docs/DEPLOYMENT.md)
- [API文档](http://localhost:8000/docs)

### 🚀 快速开始
\`\`\`bash
# 克隆仓库
git clone https://github.com/greatheart1000/customer-service-saas.git
cd customer-service-saas

# 启动后端
cd saas_backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 启动前端
cd ../saas_frontend
npm install
npm run dev
\`\`\`

### 🐛 已知问题
- WebSocket实时通信待实现
- 文件上传功能待开发

### 🙏 致谢
感谢所有贡献者！
```

---

## 🛡️ 最佳实践

### 1. 分支保护

在GitHub设置中保护main分支：
```
Settings → Branches → Add rule
- Branch name: main
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing settings
```

### 2. 提交信息规范

使用约定式提交：
```bash
feat: 添加新功能
fix: 修复Bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具变动
```

### 3. 版本检查清单

发布前检查：
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本号正确
- [ ] 没有TODO或FIXME
- [ ] 代码已审查

---

## 📋 当前项目版本建议

基于当前提交历史：

```bash
* 3e0d183 - feat: 实现多租户架构和客服工作台  ← 当前HEAD
* 2179bc5 - feat: 完成智能客服SaaS系统核心功能
* 23730a3 - feat: Initial commit
```

### 建议的版本标签

```bash
# 为第一个初始提交打标签
git tag -a v0.1.0 23730a3 -m "Initial commit: 项目初始化"

# 为核心功能完成打标签
git tag -a v0.5.0 2179bc5 -m "Beta: 核心功能完成"

# 为当前版本打标签
git tag -a v1.0.0 3e0d183 -m "Release v1.0.0: 首个正式版本"
```

执行：
```bash
./scripts/create_release.sh v1.0.0
```

---

## 🔗 有用的Git命令

```bash
# 查看分支图
git log --oneline --graph --all --decorate

# 查看版本标签
git tag -l -n9  # 显示标签和注释

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0

# 同步远程标签
git fetch --tags

# 比较两个版本
git diff v1.0.0 v1.1.0

# 查看某次提交的文件
git ls-tree -r --name-only v1.0.0

# 导出版本代码
git archive v1.0.0 --format=zip > release-v1.0.0.zip
```

---

**最后更新**: 2026-02-10
**当前版本**: main (准备创建v1.0.0标签)
