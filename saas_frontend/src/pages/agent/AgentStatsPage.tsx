/**
 * 客服工作台 - 数据统计页面
 */
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp,
  Message,
  SupportAgent,
  Speed,
} from '@mui/icons-material';

const AgentStatsPage: React.FC = () => {
  const stats = [
    {
      title: '今日对话数',
      value: '24',
      icon: <Message />,
      color: '#f093fb',
    },
    {
      title: '平均响应时间',
      value: '2.3分钟',
      icon: <Speed />,
      color: '#10b981',
    },
    {
      title: '客户满意度',
      value: '4.8/5.0',
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
    {
      title: '处理中对话',
      value: '3',
      icon: <SupportAgent />,
      color: '#3b82f6',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          数据统计
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          查看个人绩效和工作数据
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <Box sx={{ color: stat.color, fontSize: 24 }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          mt: 3,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          p: 8,
          textAlign: 'center',
        }}
      >
        <AssessmentIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
          详细统计分析
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          即将推出...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AgentStatsPage;
