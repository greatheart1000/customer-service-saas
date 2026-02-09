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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            机器人管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理系统中的所有 AI 机器人
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ bgcolor: '#f093fb' }}
        >
          创建机器人
        </Button>
      </Box>

      {/* Bots Grid */}
      <Grid container spacing={3}>
        {mockBots.map((bot) => (
          <Grid item xs={12} sm={6} md={4} key={bot.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: bot.status === 'active' ? '#4facfe' : 'text.disabled',
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {bot.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        icon={bot.status === 'active' ? <CheckCircle /> : <Block />}
                        label={bot.status === 'active' ? '运行中' : '已停用'}
                        size="small"
                        color={bot.status === 'active' ? 'success' : 'default'}
                      />
                      <Chip label={bot.organization} size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {bot.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {bot.conversations.toLocaleString()} 次对话
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                <IconButton size="small">
                  <Edit />
                </IconButton>
                <IconButton size="small" color="error">
                  <Delete />
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
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>创建新机器人</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="机器人名称"
              fullWidth
              placeholder="例如：客服助手"
            />
            <TextField
              label="描述"
              fullWidth
              multiline
              rows={3}
              placeholder="机器人的主要功能..."
            />
            <TextField
              label="Coze Bot ID"
              fullWidth
              placeholder="从 Coze 平台获取"
            />
            <TextField
              label="欢迎消息"
              fullWidth
              multiline
              rows={2}
              placeholder="用户首次对话时的欢迎语..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button variant="contained" sx={{ bgcolor: '#f093fb' }}>
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBotsPage;
