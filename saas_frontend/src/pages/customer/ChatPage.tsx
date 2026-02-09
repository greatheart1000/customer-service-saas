/**
 * 聊天页面 - 用户端核心功能（集成真实 API）
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Chip,
  Fade,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import { getBots, sendMessageStream, type Bot, type StreamChunk } from '../../services/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是智能客服助手，有什么可以帮助您的吗？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<(() => void) | null>(null);

  // 加载可用机器人
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const botList = await getBots();
      setBots(botList);
      if (botList.length > 0 && !selectedBot) {
        setSelectedBot(botList[0]);
      }
    } catch (err: any) {
      console.error('Failed to load bots:', err);
      setError('无法加载机器人列表');
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
      setError('请先选择一个机器人');
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
      // 调用流式聊天 API
      abortControllerRef.current = await sendMessageStream(
        {
          bot_id: selectedBot.id,
          message: userInput,
          conversation_id: conversationId,
          stream: true,
        },
        // onChunk - 处理每个数据块
        (chunk: StreamChunk) => {
          if (chunk.type === 'message' && chunk.content) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + chunk.content }
                  : msg
              )
            );
          }
          // 更新 conversation_id
          if (chunk.conversation_id && !conversationId) {
            setConversationId(chunk.conversation_id);
          }
        },
        // onError - 处理错误
        (errorMessage: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `抱歉，发生了错误：${errorMessage}`, isStreaming: false }
                : msg
            )
          );
          setError(errorMessage);
        },
        // onComplete - 完成
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: `抱歉，网络错误：${err.message}`, isStreaming: false }
            : msg
        )
      );
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 80px)', py: 2 }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <SmartToyIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedBot?.name || '智能客服助手'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                在线 | 平均响应时间 &lt; 1s
              </Typography>
            </Box>
            {/* Bot 选择器 */}
            {bots.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {bots.map((bot) => (
                  <Chip
                    key={bot.id}
                    label={bot.name}
                    onClick={() => setSelectedBot(bot)}
                    sx={{
                      bgcolor: selectedBot?.id === bot.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            <Chip
              label="在线"
              size="small"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.3)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Box>
        </Paper>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 3,
          }}
        >
          {messages.map((message) => (
            <Fade key={message.id} in timeout={300}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor:
                      message.role === 'user'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 3,
                    borderTopLeftRadius:
                      message.role === 'assistant' ? 0 : 24,
                    borderTopRightRadius: message.role === 'user' ? 0 : 24,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                    {message.isStreaming && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '16px',
                          marginLeft: '2px',
                          backgroundColor: 'currentColor',
                          animation: 'blink 1s infinite',
                        }}
                      />
                    )}
                  </Typography>
                </Paper>
                {message.role === 'user' && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
              </Box>
            </Fade>
          ))}
          {isLoading && messages[messages.length - 1]?.isStreaming !== true && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <IconButton color="primary">
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入消息... (Shift+Enter 换行)"
              variant="outlined"
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton color="primary">
              <MicIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatPage;
