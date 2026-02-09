/**
 * 客服工作台 - 用户列表页面
 */
import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const AgentUsersPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          用户列表
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          查看和管理所有用户
        </Typography>
      </Box>

      <Paper
        sx={{
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          p: 8,
          textAlign: 'center',
        }}
      >
        <PeopleIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
          用户列表功能
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          即将推出...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AgentUsersPage;
