# 📝 自动化版本记录系统使用说明

## ✅ 系统已配置完成

您的项目现在拥有**完整的自动化版本记录系统**！每次提交都会自动记录版本历史。

---

## 🎯 工作原理

```
提交代码
  ↓
Git Hook 自动触发
  ↓
运行 auto-changelog.sh
  ↓
生成 docs/CHANGELOG.md
  ↓
显示版本信息和建议
```

---

## 🚀 使用方法

### 方式1: 自动触发（推荐）✨

**每次提交代码后，Git Hook会自动运行版本记录脚本：**

```bash
# 1. 修改代码
vim some_file.py

# 2. 提交代码
git add .
git commit -m "feat: 添加新功能"

# ✅ Git Hook自动执行，显示版本记录：
# ✓ 当前版本: v1.0.0
# ✓ 当前提交: abc1234
# ✓ 文件变更统计...
# 💡 建议下一步操作...
```

### 方式2: 手动运行

如果需要手动生成版本日志：

```bash
# 运行自动化脚本
bash scripts/auto-changelog.sh

# 或使用快捷方式
./scripts/auto-changelog.sh  # 如果已设置为可执行
```

---

## 📋 生成的信息

每次提交会自动记录：

1. **提交信息**
   - 提交标题和详情
   - 提交哈希
   - 提交时间
   - 提交作者

2. **变更统计**
   - 变更文件数量
   - 新增代码行数
   - 删除代码行数

3. **文件列表**
   - 新增文件（绿色）
   - 修改文件（蓝色）
   - 删除文件（红色）

4. **智能建议**
   - 新功能提交 → 建议递增次版本号
   - Bug修复 → 建议递增修订号
   - 显示具体命令

---

## 📂 文件说明

### VERSION
存储当前版本号：
```
v1.0.0
```

### docs/CHANGELOG.md
自动生成的版本日志，格式：
```markdown
## [v1.0.0] - 2026-02-10 12:00:00

**提交**: abc1234
**作者**: Your Name

### 📝 提交信息
feat: 添加新功能

### 📊 变更统计
- 变更文件: 3 个
- 新增代码: 150 行
- 删除代码: 20 行

### 📁 变更文件
A    new_file.py
M    modified_file.py
```

---

## 🔧 配置文件

### .git/hooks/post-commit
Git提交后Hook，自动运行版本记录脚本。

### scripts/auto-changelog.sh
核心脚本，负责：
- 读取Git提交信息
- 统计文件变更
- 生成CHANGELOG.md
- 显示版本建议

### scripts/create_release.sh
发布脚本，用于：
- 创建版本标签
- 推送到GitHub
- 生成Release Notes

---

## 📖 使用示例

### 示例1: 日常开发

```bash
# 1. 修改代码
vim saas_backend/app/api/v1/endpoints/tenant.py

# 2. 提交（Git Hook自动执行）
git add .
git commit -m "feat: 添加租户API端点"

# 输出：
# ✓ 当前版本: v1.0.0
# ✓ 当前提交: abc1234
# 💡 检测到新功能提交，建议创建新版本标签
#   git tag -a 'v1.1.0' -m '...'
```

### 示例2: Bug修复

```bash
# 1. 修复Bug
vim saas_frontend/src/App.tsx

# 2. 提交
git add .
git commit -m "fix: 修复路由配置错误"

# 输出：
# 💡 检测到Bug修复提交，建议创建修订版本
#   git tag -a 'v1.0.1' -m '...'
```

### 示例3: 创建正式版本

```bash
# 1. 开发完成后，创建版本标签
./scripts/create_release.sh v1.1.0

# 2. 推送标签
git push origin v1.1.0

# 3. 在GitHub上创建Release
# 访问: https://github.com/greatheart1000/customer-service-saas/releases
```

---

## 🎨 输出示例

### 提交新功能

```bash
$ git commit -m "feat: 添加WebSocket实时通信"

╔═══════════════════════════════════════════════════════════════╗
║           📝 自动版本记录系统                                  ║
╚═══════════════════════════════════════════════════════════════╝

✓ 当前版本: v1.0.0
✓ 当前提交: def5678
✓ 提交时间: 2026-02-10 14:30:00
✓ 提交作者: greatheart1000

📋 最新提交信息:
  标题: feat: 添加WebSocket实时通信

📊 文件变更统计:
  变更文件: 5 个
  新增行数: 342 insertion
  删除行数: 15 deletion

📁 变更文件列表:
  新增    saas_backend/app/api/v1/endpoints/websocket.py
  修改    saas_backend/app/main.py
  ...

📝 更新 CHANGELOG.md...
✓ CHANGELOG.md 已更新

💡 检测到新功能提交，建议创建新版本标签:
  git tag -a 'v1.1.0' -m 'Release v1.1.0: 添加WebSocket实时通信'
  git push origin 'v1.1.0'

  或使用自动脚本:
  ./scripts/create_release.sh v1.1.0

═══════════════════════════════════════════════════════════════
              ✅ 版本记录完成！
═══════════════════════════════════════════════════════════════
```

---

## 🔍 查看版本历史

### 查看所有版本标签

```bash
git tag -l
```

输出：
```
v0.1.0
v0.2.0
v0.9.0
v1.0.0
v1.1.0
```

### 查看CHANGELOG

```bash
cat docs/CHANGELOG.md
```

### 对比两个版本

```bash
git diff v1.0.0 v1.1.0
```

---

## ⚙️ 高级配置

### 修改版本号

编辑 `VERSION` 文件：

```bash
echo "v1.1.0" > VERSION
git add VERSION
git commit -m "chore: 更新版本号到v1.1.0"
```

### 自定义CHANGELOG格式

编辑 `scripts/auto-changelog.sh`，修改 `LOG_ENTRY` 部分。

### 禁用自动Hook

如果不想每次提交都自动运行：

```bash
# 临时禁用
git commit --no-verify -m "your message"

# 永久禁用
rm .git/hooks/post-commit
```

### 重新启用Hook

```bash
bash scripts/setup-git-hooks.sh
```

---

## 🐛 常见问题

### Q: Hook没有自动运行？

**A**: 检查Hook权限：
```bash
ls -la .git/hooks/post-commit
# 应该显示 -rwxrwxrwx
```

如果权限不对：
```bash
chmod +x .git/hooks/post-commit
```

### Q: CHANGELOG格式不对？

**A**: 删除并重新生成：
```bash
rm docs/CHANGELOG.md
git commit --allow-empty -m "chore: 触发CHANGELOG重新生成"
```

### Q: 如何回退版本？

**A**: 使用Git标签：
```bash
# 查看历史版本
git tag -l

# 回退到指定版本
git checkout v1.0.0
```

---

## 📊 最佳实践

### 1. 提交信息规范

使用约定式提交格式：
```bash
feat: 添加新功能
fix: 修复Bug
docs: 更新文档
style: 代码格式
refactor: 重构
test: 添加测试
chore: 构建/工具
```

### 2. 定期创建版本标签

- 每完成一个大功能 → 创建 v1.x.0
- 每修复一个Bug → 创建 v1.x.y
- 重大更新 → 创建 v2.0.0

### 3. 保持CHANGELOG整洁

- 定期精简旧版本记录
- 合并相似的条目
- 保持格式统一

---

## 🎉 总结

现在您的项目拥有：

✅ **自动版本记录** - 每次提交自动生成日志
✅ **完整版本历史** - 所有版本都保留
✅ **智能建议** - 自动提示下一步操作
✅ **Git集成** - 无需手动操作
✅ **灵活控制** - 可以禁用或自定义

**下次提交代码时，系统会自动为您记录版本历史！** 🚀

---

**配置时间**: 2026-02-10
**当前版本**: v1.0.0
**文档版本**: v1.0
