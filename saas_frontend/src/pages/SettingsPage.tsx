/**
 * 设置页面
 */
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material';

const SettingsPage: React.FC = () => {
  const handleSave = () => {
    // 保存设置
    alert('设置已保存');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>

      {/* 账户设置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          账户设置
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="用户名"
            defaultValue="user123"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="邮箱"
            type="email"
            defaultValue="user@example.com"
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleSave}>
            保存更改
          </Button>
        </Box>
      </Paper>

      {/* 密码修改 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          修改密码
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="当前密码"
            type="password"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="新密码"
            type="password"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="确认新密码"
            type="password"
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleSave}>
            更新密码
          </Button>
        </Box>
      </Paper>

      {/* API 密钥 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          API 密钥
        </Typography>

        <Typography color="textSecondary" sx={{ mb: 2 }}>
          使用 API 密钥可以在您的应用中集成智能客服功能。
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="API 密钥"
            value="sk_xxxxxxxxxxxxxxxx"
            disabled
          />

          <Button variant="outlined">
            复制
          </Button>

          <Button variant="contained">
            重新生成
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
