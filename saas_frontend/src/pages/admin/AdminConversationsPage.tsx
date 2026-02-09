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
  Tabs,
  Tab,
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          对话管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          查看和管理所有用户对话记录
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="对话列表" />
          <Tab label="统计分析" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <>
          {/* 搜索栏 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="搜索对话标题或用户ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Box>

          {/* 对话列表 */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
              <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                暂无对话记录
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? '没有找到匹配的对话' : '还没有用户开始对话'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>对话标题</TableCell>
                    <TableCell>用户ID</TableCell>
                    <TableCell>消息数</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>最后更新</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredConversations.map((conv) => (
                    <TableRow key={conv.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SmartToy fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {conv.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {conv.user_id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={conv.message_count} size="small" color="info" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" color="action" sx={{ fontSize: 14 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(conv.created_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(conv.updated_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewConversation(conv)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteConversation(conv.id)}
                        >
                          <Delete />
                        </IconButton>
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
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            统计分析功能
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedConversation?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            对话ID: {selectedConversation?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {messagesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
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
                          bgcolor: msg.role === 'user' ? '#f093fb' : '#4facfe',
                        }}
                      >
                        {msg.role === 'user' ? <Person /> : <SmartToy />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" component="span">
                            {msg.role === 'user' ? '用户' : 'AI助手'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(msg.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: msg.role === 'user' ? 'grey.100' : 'primary.50',
                            borderRadius: 2,
                            display: 'block',
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
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminConversationsPage;
