/**
 * 历史记录页面 - 用户端
 */
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItemText,
  ListItemButton,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: '关于产品功能的咨询',
    updatedAt: '2024-01-15 14:30',
    messageCount: 12,
  },
  {
    id: '2',
    title: '价格方案询问',
    updatedAt: '2024-01-14 10:15',
    messageCount: 8,
  },
  {
    id: '3',
    title: '技术支持请求',
    updatedAt: '2024-01-13 16:45',
    messageCount: 24,
  },
];

const HistoryPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          历史对话
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="搜索对话..."
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3 }}>
        <List>
          {mockConversations.map((conv, index) => (
            <React.Fragment key={conv.id}>
              <ListItemButton
                sx={{
                  py: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <HistoryIcon sx={{ color: 'primary.main' }} />
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {conv.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {conv.updatedAt}
                      </Typography>
                      <Chip
                        label={`${conv.messageCount} 条消息`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <IconButton edge="end" color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
              {index < mockConversations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default HistoryPage;
