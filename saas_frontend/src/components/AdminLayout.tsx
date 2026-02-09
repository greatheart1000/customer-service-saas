/**
 * 管理端布局组件
 * 专注于系统管理功能
 */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MessageIcon from '@mui/icons-material/Message';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 280;

const menuItems = [
  { text: '仪表板', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: '用户管理', icon: <PeopleIcon />, path: '/admin/users' },
  { text: '机器人管理', icon: <SmartToyIcon />, path: '/admin/bots' },
  { text: '知识库管理', icon: <LibraryBooksIcon />, path: '/admin/knowledge' },
  { text: '对话管理', icon: <MessageIcon />, path: '/admin/conversations' },
  { text: '订阅管理', icon: <ReceiptIcon />, path: '/admin/subscriptions' },
  { text: '系统设置', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Area */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
              fontSize: '1.1rem',
            }}
          >
            管理控制台
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            ADMIN PANEL
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, px: 1, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          管理
        </Typography>
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mx: 1.5,
                  mb: 0.5,
                  py: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': isActive(item.path)
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        background: 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: '0 4px 4px 0',
                      }
                    : {},
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                    color: '#f093fb',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? '#f093fb' : 'text.secondary',
                    minWidth: 44,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: '0.9rem',
                  }}
                />
                {isActive(item.path) && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              mx: 1.5,
              py: 1.5,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 44 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="退出登录"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: '#1a1a2e' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                letterSpacing: '-0.02em',
                fontSize: '1.5rem',
              }}
            >
                智能客服管理平台
              </Typography>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="通知">
              <IconButton
                sx={{
                  color: '#6b7280',
                  width: 40,
                  height: 40,
                  '&:hover': { backgroundColor: '#f3f4f6' }
                }}
              >
                <Badge
                  badgeContent={5}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: '#ef4444',
                      fontWeight: 600,
                      fontSize: '10px',
                      height: 16,
                      minWidth: 16,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="账户">
              <IconButton
                onClick={handleMenu}
                sx={{
                  color: '#6b7280',
                  width: 40,
                  height: 40,
                  '&:hover': { backgroundColor: '#f3f4f6' }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  }}
                >
                  A
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
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                },
              }}
            >
              <MenuItem onClick={() => navigate('/admin/settings')} sx={{ fontSize: '0.9rem' }}>
                <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: '#6b7280' }} />
                系统设置
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444', fontSize: '0.9rem' }}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                退出登录
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
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
              width: drawerWidth,
              borderRadius: '0 24px 24px 0',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              backgroundColor: '#1a1a2e',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f5f7fa',
        }}
      >
        <Fade in timeout={600}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AdminLayout;
