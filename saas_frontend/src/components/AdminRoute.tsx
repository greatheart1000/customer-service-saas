/**
 * 管理员路由守卫 - 验证管理员权限
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  // 检查是否登录
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 检查是否有管理权限
  if (!authService.canAccessAdmin()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            权限不足
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            您没有访问管理端的权限。此功能仅限管理员使用。
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/chat')}
            sx={{
              bgcolor: '#667eea',
              '&:hover': {
                bgcolor: '#5568d3',
              },
            }}
          >
            返回聊天
          </Button>
        </Box>
      </Container>
    );
  }

  return <>{children || <Outlet />}</>;
};

export default AdminRoute;
