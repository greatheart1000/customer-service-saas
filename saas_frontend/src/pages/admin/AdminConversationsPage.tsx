/**
 * 管理端 - 对话管理页面（使用真实API）
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility,
  Delete,
  ChatBubbleOutline,
  SmartToy,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import {
  getAllConversations,
  getConversationMessages,
  deleteConversation as deleteConversationAPI,
  type Conversation,
  type Message,
} from '../../services/conversations';

const AdminConversationsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // 对话列表
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 消息列表
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState('');

  // 加载对话列表
  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllConversations({
        page: 1,
        page_size: 100,
      });
      setConversations(response.items);
    } catch (error: any) {
      setError(error.message || '加载对话列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载消息列表
  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
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

  useEffect(() => {
    loadConversations();
  }, []);

  // 查看对话详情
  const handleViewConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setViewDialogOpen(true);
    await loadMessages(conversation.id);
  };

  // 删除对话
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('确定要删除这个对话吗？此操作无法撤销。')) return;

    try {
      await deleteConversationAPI(conversationId);
      loadConversations();
      if (selectedConversation?.id === conversationId) {
        setViewDialogOpen(false);
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  // 过滤对话
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          对话管理
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          查看和管理所有用户对话记录
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && (
        <>
          {/* 搜索栏 */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <TextField
              fullWidth
              placeholder="搜索对话标题或用户ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#f9fafb',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                  },
                },
              }}
            />
          </Paper>

          {/* 对话列表 */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#f093fb' }} />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                borderRadius: 4,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                暂无对话记录
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                {searchQuery ? '没有找到匹配的对话' : '还没有用户开始对话'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 4, border: '1px solid #e5e7eb' }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      对话标题
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      用户ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      消息数
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      创建时间
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      最后更新
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                      操作
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredConversations.map((conv, index) => (
                    <TableRow
                      key={conv.id}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        '&:hover': {
                          backgroundColor: '#f3f4f6 !important',
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SmartToy fontSize="small" sx={{ color: '#f093fb' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                            {conv.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" sx={{ color: '#9ca3af' }} />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
                            {conv.user_id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={conv.message_count}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" sx={{ color: '#9ca3af', fontSize: 14 }} />
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {formatDate(conv.created_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {formatDate(conv.updated_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewConversation(conv)}
                            sx={{
                              color: '#6b7280',
                              '&:hover': {
                                backgroundColor: '#f3f4f6',
                                color: '#3b82f6',
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteConversation(conv.id)}
                            sx={{
                              color: '#ef4444',
                              '&:hover': {
                                backgroundColor: '#fee2e2',
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
            统计分析功能
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            对话统计、活跃用户分析等功能即将推出
          </Typography>
        </Paper>
      )}

      {/* 查看对话详情对话框 */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
            {selectedConversation?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            对话ID: {selectedConversation?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f3f4f6' }}>
          {messagesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#f093fb' }} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                暂无消息记录
              </Typography>
            </Box>
          ) : (
            <List>
              {messages.map((msg, index) => (
                <React.Fragment key={msg.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: msg.role === 'user'
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          boxShadow: msg.role === 'user'
                            ? '0 4px 12px rgba(240, 147, 251, 0.3)'
                            : '0 4px 12px rgba(79, 172, 254, 0.3)',
                        }}
                      >
                        {msg.role === 'user' ? <Person /> : <SmartToy />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                            {msg.role === 'user' ? '用户' : 'AI助手'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {formatDate(msg.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: msg.role === 'user' ? '#fdf2f8' : '#eff6ff',
                            borderRadius: 2,
                            display: 'block',
                            color: '#374151',
                            lineHeight: 1.6,
                          }}
                        >
                          {msg.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminConversationsPage;
