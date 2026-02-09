/**
 * 管理端仪表板页面
 */
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
} from '@mui/material';
import {
  PeopleOutline,
  SmartToy,
  ChatBubbleOutline,
  AttachMoney,
  TrendingUp,
  CorporateFare,
} from '@mui/icons-material';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const mockStats: StatCard[] = [
  {
    title: '总用户数',
    value: '1,234',
    change: '+12.5%',
    icon: <PeopleOutline />,
    color: '#667eea',
  },
  {
    title: '活跃用户',
    value: '856',
    change: '+8.3%',
    icon: <TrendingUp />,
    color: '#f093fb',
  },
  {
    title: '机器人数量',
    value: '45',
    change: '+5',
    icon: <SmartToy />,
    color: '#4facfe',
  },
  {
    title: '对话总数',
    value: '12,345',
    change: '+234',
    icon: <ChatBubbleOutline />,
    color: '#43e97b',
  },
  {
    title: '组织数量',
    value: '23',
    change: '+3',
    icon: <CorporateFare />,
    color: '#fa709a',
  },
  {
    title: '本月收入',
    value: '¥34,567',
    change: '+15.2%',
    icon: <AttachMoney />,
    color: '#feca57',
  },
];

const AdminDashboardPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          仪表板
        </Typography>
        <Typography variant="body2" color="text.secondary">
          欢迎回来，管理员！这是系统概览。
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockStats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.change.startsWith('+') ? 'success.main' : 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      {stat.change} 较上月
                    </Typography>
                  </Box>
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
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              用户增长趋势
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              图表占位符 - 需要集成图表库（如 Recharts）
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              最近活动
            </Typography>
            <Box
              sx={{
                height: 300,
                overflowY: 'auto',
              }}
            >
              {[
                '用户张三注册成功',
                '新机器人 "客服助手" 创建',
                '组织 ABC 公司升级订阅',
                '用户李四请求退款',
                '知识库文档更新',
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{activity}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {index + 1} 小时前
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage;
