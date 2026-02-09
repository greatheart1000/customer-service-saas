#!/bin/bash
# 自动化版本管理脚本
# 每次提交后运行此脚本来记录版本历史

set -e

# 配置
CHANGELOG_FILE="docs/CHANGELOG.md"
VERSION_FILE="VERSION"
GIT_REPO=$(git remote get-url origin)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           📝 自动版本记录系统${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. 获取当前版本信息
CURRENT_VERSION=$(cat $VERSION_FILE 2>/dev/null || echo "v0.1.0")
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")
CURRENT_AUTHOR=$(git log -1 --pretty=format:'%an')

echo -e "${GREEN}✓ 当前版本:${NC} $CURRENT_VERSION"
echo -e "${GREEN}✓ 当前提交:${NC} $CURRENT_COMMIT"
echo -e "${GREEN}✓ 提交时间:${NC} $CURRENT_DATE"
echo -e "${GREEN}✓ 提交作者:${NC} $CURRENT_AUTHOR"
echo ""

# 2. 获取最新提交信息
LATEST_COMMIT_MSG=$(git log -1 --pretty=format:'%s')
LATEST_COMMIT_BODY=$(git log -1 --pretty=format:'%b')

echo -e "${YELLOW}📋 最新提交信息:${NC}"
echo "  标题: $LATEST_COMMIT_MSG"
if [ -n "$LATEST_COMMIT_BODY" ]; then
    echo "  详情: $LATEST_COMMIT_BODY"
fi
echo ""

# 3. 获取文件变更统计
ADDED_FILES=$(git diff --shortstat HEAD~1 HEAD | grep -o '[0-9]* insertion' || echo "0")
DELETED_FILES=$(git diff --shortstat HEAD~1 HEAD | grep -o '[0-9]* deletion' || echo "0")
CHANGED_FILES=$(git diff --name-status HEAD~1 HEAD | wc -l)

echo -e "${YELLOW}📊 文件变更统计:${NC}"
echo "  变更文件: $CHANGED_FILES 个"
echo "  新增行数: $ADDED_FILES"
echo "  删除行数: $DELETED_FILES"
echo ""

# 4. 列出变更的文件
echo -e "${YELLOW}📁 变更文件列表:${NC}"
git diff --name-status HEAD~1 HEAD | head -20 | while read status file; do
    case $status in
        A) echo -e "  ${GREEN}新增${NC}    $file" ;;
        M) echo -e "  ${BLUE}修改${NC}    $file" ;;
        D) echo -e "  ${RED}删除${NC}    $file" ;;
        R) echo -e "  ${YELLOW}重命名${NC}  $file" ;;
        *) echo -e "  ${NC}其他${NC}    $file" ;;
    esac
done
echo ""

# 5. 自动生成版本日志条目
LOG_ENTRY="## [$CURRENT_VERSION] - $CURRENT_DATE
**提交**: \`$CURRENT_COMMIT\`
**作者**: $CURRENT_AUTHOR

### 📝 提交信息
$LATEST_COMMIT_MSG

$(if [ -n "$LATEST_COMMIT_BODY" ]; then
    echo "### 📄 详细说明"
    echo "$LATEST_COMMIT_BODY"
    echo ""
fi)

### 📊 变更统计
- 变更文件: $CHANGED_FILES 个
- 新增代码: $ADDED_FILES 行
- 删除代码: $DELETED_FILES 行

### 📁 变更文件
\`\`\`
$(git diff --name-status HEAD~1 HEAD | head -20)
\`\`\`

---

"

# 6. 更新CHANGELOG.md
echo -e "${BLUE}📝 更新 CHANGELOG.md...${NC}"

# 创建文件头（如果不存在）
if [ ! -f "$CHANGELOG_FILE" ]; then
    cat > "$CHANGELOG_FILE" << 'EOF'
# 📜 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

EOF
fi

# 将新日志添加到文件开头
{
    cat "$CHANGELOG_FILE"
} > /tmp/changelog_temp
{
    echo "$LOG_ENTRY"
    cat /tmp/changelog_temp
} > "$CHANGELOG_FILE"

echo -e "${GREEN}✓ CHANGELOG.md 已更新${NC}"
echo ""

# 7. 提交CHANGELOG
echo -e "${YELLOW}💡 提示: 运行以下命令提交CHANGELOG:${NC}"
echo ""
echo -e "  ${BLUE}git add $CHANGELOG_FILE${NC}"
echo -e "  ${BLUE}git commit -m 'docs: 更新CHANGELOG - $LATEST_COMMIT_MSG'${NC}"
echo -e "  ${BLUE}git push origin main${NC}"
echo ""

# 8. 显示下一步建议
if [[ "$LATEST_COMMIT_MSG" == feat:* ]]; then
    echo -e "${YELLOW}💡 检测到新功能提交，建议创建新版本标签:${NC}"
    echo ""
    # 提取版本号并自动递增
    IFS='.' read -r major minor patch <<< "${CURRENT_VERSION#v}"
    if [ "$patch" == "0" ]; then
        NEW_VERSION="v$major.$(echo $minor + 1 | bc).0"
    else
        NEW_VERSION="v$major.$minor.$(echo $patch + 1 | bc)"
    fi
    echo -e "  ${BLUE}git tag -a '$NEW_VERSION' -m 'Release $NEW_VERSION: $LATEST_COMMIT_MSG'${NC}"
    echo -e "  ${BLUE}git push origin '$NEW_VERSION'${NC}"
    echo ""
    echo -e "  或使用自动脚本:"
    echo -e "  ${BLUE}./scripts/create_release.sh $NEW_VERSION${NC}"
    echo ""
elif [[ "$LATEST_COMMIT_MSG" == fix:* ]]; then
    echo -e "${YELLOW}💡 检测到Bug修复提交，建议创建修订版本:${NC}"
    echo ""
    IFS='.' read -r major minor patch <<< "${CURRENT_VERSION#v}"
    NEW_VERSION="v$major.$minor.$(echo $patch + 1 | bc)"
    echo -e "  ${BLUE}git tag -a '$NEW_VERSION' -m 'Hotfix: $LATEST_COMMIT_MSG'${NC}"
    echo ""
fi

# 9. 保存当前版本信息
echo "$CURRENT_VERSION" > $VERSION_FILE
echo -e "${GREEN}✓ 版本信息已保存${NC}"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              ✅ 版本记录完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
