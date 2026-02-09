#!/bin/bash
# 安装Git Hooks脚本

echo "🔧 安装Git Hooks..."

# 复制post-commit hook
cp .git/hooks/post-commit .git/hooks/post-commit.sample 2>/dev/null || true
chmod +x .git/hooks/post-commit

echo "✅ Git Hooks 安装完成！"
echo ""
echo "📝 从现在起，每次提交都会自动："
echo "  1. 生成版本日志到 docs/CHANGELOG.md"
echo "  2. 记录提交信息和文件变更"
echo "  3. 显示下一步操作建议"
echo ""
echo "🚀 尝试提交一次代码看看效果！"
