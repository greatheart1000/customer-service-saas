/**
 * 管理端 - 机器人管理页面
 */
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit,
  Delete,
  SmartToy,
  CheckCircle,
  Block,
} from '@mui/icons-material';

interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  organization: string;
  conversations: number;
}

const mockBots: Bot[] = [
  {
    id: '1',
    name: '客服助手',
    description: '处理常见客户咨询',
    status: 'active',
    organization: 'ABC 公司',
    conversations: 1234,
  },
  {
    id: '2',
    name: '技术支持机器人',
    description: '协助解决技术问题',
    status: 'active',
    organization: 'XYZ 科技',
    conversations: 856,
  },
  {
    id: '3',
    name: '销售顾问',
    description: '产品咨询和销售引导',
    status: 'inactive',
    organization: 'ABC 公司',
    conversations: 456,
  },
];

const AdminBotsPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          机器人管理
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          管理系统中的所有 AI 机器人
        </Typography>
      </Box>

      {/* 操作栏 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
          机器人列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
            },
          }}
        >
          创建机器人
        </Button>
      </Paper>

      {/* Bots Grid */}
      <Grid container spacing={3}>
        {mockBots.map((bot) => (
          <Grid item xs={12} sm={6} md={4} key={bot.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  borderColor: '#f093fb',
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: bot.status === 'active'
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : '#f3f4f6',
                      color: bot.status === 'active' ? 'white' : '#6b7280',
                      boxShadow: bot.status === 'active'
                        ? '0 4px 12px rgba(240, 147, 251, 0.3)'
                        : 'none',
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#1a1a2e' }}>
                      {bot.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        icon={bot.status === 'active' ? <CheckCircle sx={{ ml: 0.5 }} /> : <Block sx={{ ml: 0.5 }} />}
                        label={bot.status === 'active' ? '运行中' : '已停用'}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: bot.status === 'active' ? '#d1fae5' : '#f3f4f6',
                          color: bot.status === 'active' ? '#065f46' : '#6b7280',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        label={bot.organization}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: '#e5e7eb',
                          color: '#6b7280',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.5 }}>
                  {bot.description}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                  {bot.conversations.toLocaleString()} 次对话
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', gap: 0.5, px: 2, pb: 2 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      color: '#f093fb',
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: '#fee2e2',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Bot Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a2e' }}>创建新机器人</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="机器人名称"
              fullWidth
              placeholder="例如：客服助手"
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
            <TextField
              label="描述"
              fullWidth
              multiline
              rows={3}
              placeholder="机器人的主要功能..."
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
            <TextField
              label="Coze Bot ID"
              fullWidth
              placeholder="从 Coze 平台获取"
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
            <TextField
              label="欢迎消息"
              fullWidth
              multiline
              rows={2}
              placeholder="用户首次对话时的欢迎语..."
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
              },
            }}
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBotsPage;
