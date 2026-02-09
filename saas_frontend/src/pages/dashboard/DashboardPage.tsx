/**
 * 仪表板页面 - 现代化设计
 * 带有动画卡片和交互效果
 */
import React, { useEffect, useState } from 'react';
import {
  LinearProgress,
  Chip,
  IconButton,
  Avatar,
  Skeleton,
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Fade,
  Card,
  CardContent,
  Grow,
} from '@mui/material';
import {
  Message as MessageIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  AddCircle as AddCircleIcon,
  Description as DescriptionIcon,
  Key as KeyIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

interface UsageStats {
  messages_used: number;
  messages_limit: number;
  messages_percentage: number;
  api_calls_used: number;
  api_calls_limit: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  is_over_limit: boolean;
}

const AnimatedCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  gradient?: string;
}> = ({ children, delay = 0, gradient }) => {
  return (
    <Grow in timeout={600 + delay}>
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': gradient
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: gradient,
              }
            : {},
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {children}
      </Card>
    </Grow>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}> = ({ title, value, subtitle, icon, color, gradient, progress, trend, delay = 0 }) => {
  return (
    <AnimatedCard delay={delay} gradient={gradient}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px -4px ${color}40`,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { color: 'white', fontSize: 28 } })}
          </Box>
          {trend && (
            <Chip
              icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={trend === 'up' ? '+12.5%' : '-5.2%'}
              size="small"
              sx={{
                backgroundColor: trend === 'up' ? 'success.light' : 'error.light',
                color: trend === 'up' ? 'success.dark' : 'error.dark',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  fontSize: 16,
                },
              }}
            />
          )}
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: '2.25rem',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
          {subtitle}
        </Typography>

        {progress !== undefined && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: gradient,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                right: 0,
                top: -20,
                fontWeight: 600,
                color,
              }}
            >
              {progress.toFixed(0)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </AnimatedCard>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  onClick?: () => void;
  delay?: number;
}> = ({ title, icon, color, gradient, onClick, delay = 0 }) => {
  return (
    <Grow in timeout={800 + delay}>
      <Paper
        onClick={onClick}
        sx={{
          p: 3,
          cursor: 'pointer',
          borderRadius: 4,
          border: '2px solid transparent',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)) border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: gradient,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            border: '2px solid transparent',
            background: `linear-gradient(white, white) padding-box, ${gradient} border-box`,
            boxShadow: `0 20px 40px -12px ${color}30`,
            '&::before': {
              opacity: 0.05,
            },
            '& .action-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              color,
            },
            '& .action-arrow': {
              transform: 'translateX(4px)',
              opacity: 1,
            },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            className="action-icon"
            sx={{
              mb: 2,
              transition: 'all 0.3s ease',
              color: 'text.secondary',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 40 } })}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {title}
            </Typography>
            <ArrowForwardIcon
              className="action-arrow"
              sx={{
                transition: 'all 0.3s ease',
                opacity: 0.3,
                color: 'text.secondary',
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Grow>
  );
};

const DashboardPage: React.FC = () => {
  // const theme = useTheme();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 模拟数据
      setTimeout(() => {
        setStats({
          messages_used: 450,
          messages_limit: 1000,
          messages_percentage: 45,
          api_calls_used: 2347,
          api_calls_limit: 10000,
          storage_used_mb: 15,
          storage_limit_mb: 100,
          is_over_limit: false,
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    { title: '创建机器人', icon: <AddCircleIcon />, color: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '查看文档', icon: <DescriptionIcon />, color: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: '获取 API Key', icon: <KeyIcon />, color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: '联系支持', icon: <SupportIcon />, color: '#43e97b', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Page Header */}
      <Fade in timeout={400}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            仪表板
          </Typography>
          <Typography variant="body1" color="text.secondary">
            欢迎使用智能客服 SaaS 平台，查看您的使用情况和快捷操作
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
          ) : (
            <StatCard
              title="消息使用量"
              value={`${stats?.messages_used || 0}`}
              subtitle={`/ ${stats?.messages_limit || 0} 条消息`}
              icon={<MessageIcon />}
              color="#667eea"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              progress={stats?.messages_percentage}
              trend="up"
              delay={100}
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
          ) : (
            <StatCard
              title="API 调用"
              value={`${stats?.api_calls_used || 0}`}
              subtitle="本月累计调用"
              icon={<ApiIcon />}
              color="#4facfe"
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              trend="up"
              delay={200}
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
          ) : (
            <StatCard
              title="存储使用"
              value={`${stats?.storage_used_mb || 0} MB`}
              subtitle={`/ ${stats?.storage_limit_mb || 0} MB 可用`}
              icon={<StorageIcon />}
              color="#43e97b"
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              trend="neutral"
              delay={300}
            />
          )}
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Fade in timeout={700}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <SpeedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              快捷操作
            </Typography>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <QuickActionCard
              title={action.title}
              icon={action.icon}
              color={action.color}
              gradient={action.gradient}
              delay={index * 100}
              onClick={() => console.log(`Clicked: ${action.title}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Additional Info Section */}
      <Grow in timeout={1200}>
        <Paper
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px dashed rgba(102, 126, 234, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <TrendingUpIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                提示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                您的使用量即将达到限制，建议升级到高级套餐以获取更多资源。
              </Typography>
            </Box>
            <IconButton
              sx={{
                ml: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Paper>
      </Grow>
    </Container>
  );
};

export default DashboardPage;
