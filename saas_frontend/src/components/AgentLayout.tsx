/**
 * 客服工作台布局
 * 用于客服人员的工作界面
 */
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Inbox,
  History,
  People,
  Assessment,
  Settings,
  ChevronLeft,
  SmartToy,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: '收件箱', icon: <Inbox />, path: '/agent/inbox' },
    { text: '历史记录', icon: <History />, path: '/agent/history' },
    { text: '用户列表', icon: <People />, path: '/agent/users' },
    { text: '机器人管理', icon: <SmartToy />, path: '/agent/bots' },
    { text: '数据统计', icon: <Assessment />, path: '/agent/stats' },
    { text: '设置', icon: <Settings />, path: '/agent/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1a1a2e',
        }}
      >
        <SmartToy sx={{ fontSize: 32, color: '#f093fb', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
          客服工作台
        </Typography>
      </Box>
      <Divider />
      <List sx={{ bgcolor: '#1a1a2e', height: 'calc(100vh - 65px)' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  bgcolor: isActive ? 'rgba(240, 147, 251, 0.1)' : 'transparent',
                  color: isActive ? '#f093fb' : 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(240, 147, 251, 0.1)',
                    color: '#f093fb',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 顶部栏 */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'white',
          color: '#1a1a2e',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          height: 64,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || '客服工作台'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              onClick={handleProfileMenuOpen}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                cursor: 'pointer',
              }}
            >
              A
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 导航抽屉 */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* 移动端抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* 桌面端抽屉 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: '#1a1a2e',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* 主内容区 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
          bgcolor: '#f5f7fa',
          mt: 8,
        }}
      >
        {children}
      </Box>

      {/* 用户菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>个人资料</MenuItem>
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>设置</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          sx={{ color: '#ef4444' }}
        >
          退出登录
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AgentLayout;
