/**
 * 用户端布局组件
 * 专注于聊天体验
 */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const menuItems = [
  { text: '聊天', icon: <ChatIcon />, path: '/chat' },
  { text: '历史记录', icon: <HistoryIcon />, path: '/history' },
  { text: '个人中心', icon: <PersonIcon />, path: '/profile' },
  { text: '设置', icon: <SettingsIcon />, path: '/settings' },
];

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    handleClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 12px rgba(102, 126, 234, 0.15)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <ChatIcon sx={{ color: 'white', fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  智能客服
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {menuItems.map((item) => (
              <Box
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive(item.path)
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive(item.path) ? 600 : 500,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {item.icon}
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* User Menu */}
          <Box>
            <Tooltip title="账户">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleMenu}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Avatar sx={{ width: 36, height: 36 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                个人中心
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                设置
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                退出登录
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Fade in timeout={400}>
          <Box sx={{ height: '100%' }}>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default CustomerLayout;
