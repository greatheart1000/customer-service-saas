/**
 * 客服工作台 - 历史记录页面
 */
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

const AgentHistoryPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          历史记录
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          查看所有已处理的对话记录
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
        <HistoryIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
          历史记录功能
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          即将推出...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AgentHistoryPage;
