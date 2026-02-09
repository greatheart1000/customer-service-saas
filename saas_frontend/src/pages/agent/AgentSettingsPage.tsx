/**
 * 客服工作台 - 设置页面
 */
import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const AgentSettingsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          设置
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          个人设置和偏好
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
        <SettingsIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
          设置功能
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          即将推出...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AgentSettingsPage;
