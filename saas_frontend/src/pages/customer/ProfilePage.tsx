/**
 * 个人中心页面 - 用户端
 */
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ProfilePage: React.FC = () => {
  // TODO: 从后端 API 获取用户数据
  const user = {
    username: '测试用户',
    email: 'user@example.com',
    phone: '+86 138****8888',
    avatar: null,
  };

  const stats = [
    { label: '总对话数', value: '128', icon: <MessageIcon />, color: '#667eea' },
    { label: '使用天数', value: '45', icon: <TrendingUpIcon />, color: '#f093fb' },
    { label: '活跃机器人', value: '3', icon: <SmartToyIcon />, color: '#4facfe' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '2.5rem',
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {user.username}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{user.phone}</Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            编辑资料
          </Button>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Subscription Info */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          订阅信息
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              免费版
            </Typography>
            <Typography variant="body2" color="text.secondary">
              每天 100 条消息
            </Typography>
          </Box>
          <Button variant="outlined" color="primary">
            升级订阅
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
