/**
 * 嵌入式聊天页面 - 基于租户UUID的终端用户聊天界面
 *
 * 使用方式：
 * 1. 通过URL访问: /tenant/:tenantUuid/chat
 * 2. 或嵌入iframe: <iframe src="https://yourdomain.com/tenant/:uuid/chat"></iframe>
 *
 * 特点：
 * - 无需登录，通过租户UUID识别
 * - 轻量级设计，适合嵌入
 * - 自动加载租户的机器人配置
 * - 支持自定义品牌颜色和logo
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Collapse,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import {
  getTenantInfo,
  getTenantBot,
  extractTenantUuidFromUrl,
  isValidTenantUuid,
  type Bot,
  type TenantInfo,
} from '../../services/tenant';
import { sendMessageStream, type StreamChunk } from '../../services/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const TenantChatPage: React.FC = () => {
  // 租户和机器人状态
  const [tenantUuid, setTenantUuid] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  // 聊天状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<(() => void) | null>(null);

  // 从URL提取租户UUID并加载租户信息
  useEffect(() => {
    const uuid = extractTenantUuidFromUrl();
    if (!uuid) {
      setTenantError('无法从URL中提取租户UUID');
      setIsLoadingTenant(false);
      return;
    }

    if (!isValidTenantUuid(uuid)) {
      setTenantError('无效的租户UUID格式');
      setIsLoadingTenant(false);
      return;
    }

    setTenantUuid(uuid);
    loadTenantInfo(uuid);
  }, []);

  // 加载租户信息
  const loadTenantInfo = async (uuid: string) => {
    try {
      setIsLoadingTenant(true);
      const info = await getTenantInfo(uuid);
      setTenantInfo(info);

      // 选择第一个活跃机器人
      if (info.bots && info.bots.length > 0) {
        const bot = info.bots[0];
        setSelectedBot(bot);

        // 显示欢迎消息
        if (bot.welcome_message) {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: bot.welcome_message,
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        setTenantError('该租户暂无可用机器人');
      }
    } catch (err: any) {
      console.error('Failed to load tenant info:', err);
      setTenantError(err.response?.data?.detail || '无法加载租户信息');
    } finally {
      setIsLoadingTenant(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!selectedBot) {
      setError('机器人未配置');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setError(null);
    setIsLoading(true);

    // 创建流式 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // 调用流式消息API
      await sendMessageStream(
        selectedBot.id,
        userInput,
        (chunk: StreamChunk) => {
          // 更新流式消息内容
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk.content }
                : msg
            )
          );
        },
        () => {
          // 流结束回调
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
        },
        (err: Error) => {
          // 错误回调
          console.error('Stream error:', err);
          setError(err.message);
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || '发送消息失败');
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 加载中状态
  if (isLoadingTenant) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f7fa',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#f093fb', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            正在加载聊天服务...
          </Typography>
        </Box>
      </Box>
    );
  }

  // 错误状态
  if (tenantError) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f7fa',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {tenantError}
        </Alert>
      </Box>
    );
  }

  // 嵌入式模式（最小化）
  if (isMinimized) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
        onClick={() => setIsMinimized(false)}
      >
        <SmartToyIcon sx={{ fontSize: 32, color: 'white' }} />
      </Paper>
    );
  }

  // 全屏聊天界面
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7fa',
      }}
    >
      {/* 顶部栏 */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {tenantInfo?.logo_url ? (
            <Avatar
              src={tenantInfo.logo_url}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              <SmartToyIcon />
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
              {tenantInfo?.name || '智能客服'}
            </Typography>
            {selectedBot && (
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {selectedBot.name}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 如果是iframe嵌入，可以显示最小化按钮 */}
          {window.self !== window.top && (
            <IconButton
              size="small"
              onClick={() => setIsMinimized(true)}
              sx={{ color: '#6b7280' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              开始对话...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    maxWidth: '70%',
                  }}
                >
                  {message.role === 'assistant' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      }}
                    >
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor:
                        message.role === 'user'
                          ? '#f093fb'
                          : 'white',
                      color: message.role === 'user' ? 'white' : '#1a1a2e',
                      borderRadius: 2,
                      border:
                        message.role === 'assistant'
                          ? '1px solid #e5e7eb'
                          : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {message.content}
                      {message.isStreaming && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 16,
                            bgcolor: '#f093fb',
                            marginLeft: 4,
                            animation: 'blink 1s infinite',
                          }}
                        >
                          &nbsp;
                        </span>
                      )}
                    </Typography>
                  </Paper>
                  {message.role === 'user' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#f093fb',
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <CircularProgress size={32} sx={{ color: '#f093fb' }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* 错误提示 */}
      <Collapse in={!!error}>
        <Box sx={{ px: 3, pb: 1 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      </Collapse>

      {/* 输入框 */}
      <Box sx={{ px: 3, pb: 3, bgcolor: 'white', borderTop: '1px solid #e5e7eb' }}>
        <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="输入您的问题..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f9fafb',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#ffffff',
                  },
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 3,
                px: 2,
                '&:hover': {
                  bgcolor: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                },
                '&:disabled': {
                  bgcolor: '#e5e7eb',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          {selectedBot && (
            <Typography variant="caption" sx={{ color: '#9ca3af', mt: 1, display: 'block' }}>
              由 {selectedBot.name} 提供支持
            </Typography>
          )}
        </Box>
      </Box>

      {/* 添加闪烁动画 */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};

export default TenantChatPage;
