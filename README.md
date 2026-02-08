# 智能客服系统 - 多功能版

支持图像识别、语音交互、工作流、对话管理、机器人管理和音频处理的全方位客户服务平台。

## 在WSL中运行 (Windows Subsystem for Linux)

该系统完全支持在WSL环境中运行。有关详细的设置说明，请参阅 [WSL_SETUP.md](WSL_SETUP.md) 文件。

## 功能特性

1. **图像识别服务**
   - 图片内容描述
   - 图片文字提取
   - 自定义问题询问

2. **语音交互服务**
   - 实时语音输入
   - 语音合成输出
   - 流式对话体验
   - 语音转文本转录
   - 一对一音频聊天

3. **文本聊天服务**
   - 传统文本对话模式
   - 流式聊天
   - 非流式聊天
   - 本地插件支持

4. **工作流服务**
   - 流式工作流运行
   - 非流式工作流运行
   - 异步工作流运行
   - 工作流聊天
   - 工作流版本管理

5. **对话管理服务**
   - 对话创建和检索
   - 消息管理
   - 对话列表
   - 对话清理

6. **机器人管理服务**
   - 机器人创建和更新
   - 机器人发布和取消发布
   - 机器人测试
   - 机器人列表

7. **音频HTTP服务**
   - 文本转语音
   - 声音管理
   - 批量音频生成

## 环境要求

- Python 3.8+
- Coze API Token
- Coze Bot ID
- Coze Workspace ID (用于数据集和机器人功能)
- 麦克风和扬声器（用于语音功能）

## 安装依赖

```bash
pip install -r requirements.txt
```

## 环境变量配置

在运行系统前，需要设置以下环境变量：

```bash
export COZE_API_TOKEN="your_coze_api_token"
export COZE_BOT_ID="your_bot_id"
export COZE_WORKSPACE_ID="your_workspace_id"
# 可选，API基础URL，默认为 https://api.coze.cn
export COZE_API_BASE="https://api.coze.com"
```

或者创建一个 `.env` 文件在 `customer_service` 目录中：

```bash
# 复制示例文件并修改
 cp .env.example .env
 
# 然后编辑 .env 文件填入你的实际值
 nano .env
```

示例 `.env` 文件内容：

```bash
# .env file
COZE_API_TOKEN=your_coze_api_token
COZE_BOT_ID=your_bot_id
COZE_WORKSPACE_ID=your_workspace_id
COZE_API_BASE=https://api.coze.com
```

## 运行系统

### 方法1：直接运行

```bash
python -m customer_service.main
```

### 方法2：使用提供的脚本 (WSL/Linux)

```bash
# 运行控制台界面
./run_console.sh

# 运行前端界面
./run_frontend.sh
```

### 方法3：在WSL中运行

```bash
# 在WSL中导航到项目目录
cd /mnt/d/project/coze-py/customer_service

# 运行主应用
python3 main.py

# 或者运行前端 (在另一个终端)
cd frontend
npm run dev
```

## 使用说明

1. **图像识别服务**
   - 选择菜单中的图像识别服务
   - 输入图片文件路径
   - 选择相应的功能（描述、文字提取或自定义问题）

2. **语音交互服务**
   - 选择菜单中的语音交互服务
   - 按提示开始和结束录音
   - 系统会自动播放回复

3. **文本聊天服务**
   - 选择菜单中的文本聊天服务
   - 直接输入文本进行对话
   - 输入 'quit' 或 'exit' 返回主菜单

4. **工作流服务**
   - 选择菜单中的工作流服务
   - 根据需要选择不同的工作流操作

5. **对话管理服务**
   - 选择菜单中的对话管理服务
   - 进行对话的创建、查看、修改等操作

6. **机器人管理服务**
   - 选择菜单中的机器人管理服务
   - 进行机器人的创建、更新、发布等操作

7. **音频HTTP服务**
   - 选择菜单中的音频HTTP服务
   - 进行文本转语音等相关操作

## 注意事项

- 使用语音功能需要安装 PyAudio，可能需要额外的系统依赖
- 确保网络连接正常以访问 Coze API
- 图片格式支持常见的 JPG/PNG 等格式