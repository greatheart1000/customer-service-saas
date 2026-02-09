/**
 * 客服工作台 - 收件箱页面
 * 包含：对话列表、聊天窗口、用户信息面板
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import {
  getConversations,
  getConversationMessages,
  sendMessageStream,
  type Conversation,
  type Message,
} from '../../services/conversations';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const AgentInboxPage: React.FC = () => {
  // 对话列表状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // 消息状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 标签页状态
  const [tabValue, setTabValue] = useState(0);

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载对话列表
  useEffect(() => {
    loadConversations();
  }, []);

  // 加载消息
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await getConversations({
        page: 1,
        page_size: 50,
      });
      setConversations(response.items);
    } catch (error: any) {
      console.error('加载对话列表失败:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const response = await getConversationMessages(conversationId, {
        page: 1,
        page_size: 100,
      });
      setMessages(response.items);
    } catch (error: any) {
      console.error('加载消息失败:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isSending || !selectedConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: selectedConversation.id,
      user_id: 'current_agent',
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsSending(true);

    try {
      // 这里应该调用实际的客服回复API
      // 目前暂时模拟
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          conversation_id: selectedConversation.id,
          user_id: 'system',
          role: 'assistant',
          content: '客服回复功能开发中...',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsSending(false);
      }, 1000);
    } catch (error: any) {
      console.error('发送消息失败:', error);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 过滤对话
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化时间
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      {/* 左侧：对话列表 */}
      <Paper
        sx={{
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* 搜索框 */}
        <Box sx={{ p: 2, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
              },
            }}
          />

          {/* 标签页 */}
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mt: 2, minHeight: 36 }}
          >
            <Tab label="全部" sx={{ minHeight: 36, fontSize: '0.875rem' }} />
            <Tab
              label={
                <Badge badgeContent={conversations.length} color="primary">
                  进行中
                </Badge>
              }
              sx={{ minHeight: 36, fontSize: '0.875rem' }}
            />
            <Tab label="待处理" sx={{ minHeight: 36, fontSize: '0.875rem' }} />
          </Tabs>
        </Box>

        {/* 对话列表 */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {conversationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#f093fb' }} />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                暂无对话
              </Typography>
            </Box>
          ) : (
            filteredConversations.map((conversation) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  button
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #f3f4f6',
                    '&.Mui-selected': {
                      bgcolor: '#fdf2f8',
                      '&:hover': {
                        bgcolor: '#fce7f3',
                      },
                    },
                    '&:hover': {
                      bgcolor: '#f9fafb',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: '#1a1a2e' }}
                        >
                          {conversation.title}
                        </Typography>
                        {conversation.message_count > 0 && (
                          <Chip
                            label={conversation.message_count}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.7rem',
                              bgcolor: '#f093fb',
                              color: 'white',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {formatTime(conversation.updated_at)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* 中间：聊天窗口 */}
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {!selectedConversation ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f9fafb',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <SmartToyIcon
                sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                选择一个对话开始聊天
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                从左侧列表中选择一个对话
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* 对话头部 */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {selectedConversation.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OnlineIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  在线
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* 消息列表 */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#f9fafb' }}>
              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#f093fb' }} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    暂无消息
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-start' : 'flex-end',
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
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: message.role === 'user' ? 'white' : '#f093fb',
                            color: message.role === 'user' ? '#1a1a2e' : 'white',
                            borderRadius: 2,
                            border:
                              message.role === 'user'
                                ? '1px solid #e5e7eb'
                                : 'none',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {message.content}
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
                  {isSending && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <CircularProgress size={32} sx={{ color: '#f093fb' }} />
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </Box>

            {/* 输入框 */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small">
                  <AttachFileIcon sx={{ color: '#6b7280' }} />
                </IconButton>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="输入回复..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                  disabled={!input.trim() || isSending}
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
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
            </Box>
          </>
        )}
      </Paper>

      {/* 右侧：用户信息面板 */}
      <Paper
        sx={{
          width: 300,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {selectedConversation ? (
          <Box>
            {/* 用户头像 */}
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  border: '3px solid white',
                  bgcolor: 'white',
                  color: '#f093fb',
                }}
              >
                <PersonIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 600, mt: 2 }}
              >
                {selectedConversation.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                <OnlineIcon sx={{ fontSize: 16, color: 'white' }} />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  在线
                </Typography>
              </Box>
            </Box>

            {/* 用户信息 */}
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 2 }}
              >
                用户信息
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  用户ID
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a2e', fontFamily: 'monospace' }}>
                  {selectedConversation.user_id.slice(0, 20)}...
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  对话ID
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a2e', fontFamily: 'monospace' }}>
                  {selectedConversation.id.slice(0, 20)}...
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 2 }}
              >
                对话统计
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  消息数
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#f093fb' }}
                >
                  {selectedConversation.message_count}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  创建时间
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a2e' }}>
                  {formatTime(selectedConversation.created_at)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  最后更新
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a2e' }}>
                  {formatTime(selectedConversation.updated_at)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f9fafb',
            }}
          >
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              选择对话查看详情
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgentInboxPage;
