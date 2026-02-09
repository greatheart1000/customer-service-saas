/**
 * 管理端 - 用户管理页面
 * 优化后的UI设计
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Security,
} from '@mui/icons-material';
import {
  getUsers,
  deleteUser as deleteUserAPI,
  updateUser,
  type AdminUser,
  type UserUpdateByAdmin,
} from '../../services/adminUsers';

const AdminUsersPage: React.FC = () => {
  // 用户列表状态
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // 分页状态
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState('');

  // 对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<UserUpdateByAdmin>({});

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({
        page,
        page_size: pageSize,
        search: searchQuery || undefined,
      });
      setUsers(response.items);
      setTotal(response.total);
    } catch (error: any) {
      setError(error.message || '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  // 搜索处理
  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  // 删除用户
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`确定要删除用户 ${userEmail} 吗？此操作无法撤销。`)) return;

    try {
      await deleteUserAPI(userId);
      loadUsers();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  // 编辑用户
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      is_active: user.is_active,
      is_admin: user.is_admin,
      is_org_admin: user.is_org_admin,
    });
    setEditDialogOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, editForm);
      setEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  // 切换用户状态
  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          用户管理
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          管理系统中的所有用户和权限
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜索栏 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="搜索用户邮箱或用户名..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f9fafb',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
              },
            }}
          >
            搜索
          </Button>
        </Box>
      </Paper>

      {/* 用户表格 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#f093fb' }} />
        </Box>
      ) : users.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            暂无用户
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            {searchQuery ? '没有找到匹配的用户' : '系统中还没有用户'}
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    用户
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    邮箱
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    组织
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    角色
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    状态
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    注册时间
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                      '&:hover': {
                        backgroundColor: '#f3f4f6 !important',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar_url}
                          sx={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                          }}
                        >
                          {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                          {user.username || '未设置'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.email}</TableCell>
                    <TableCell>
                      {user.organization ? (
                        <Chip
                          label={user.organization.name}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 2, borderColor: '#e5e7eb', color: '#6b7280' }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.is_admin && (
                          <Chip
                            icon={<Security fontSize="small" sx={{ ml: 0.5 }} />}
                            label="平台管理员"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                        {user.is_org_admin && !user.is_admin && (
                          <Chip
                            icon={<Security fontSize="small" sx={{ ml: 0.5 }} />}
                            label="组织管理员"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                        {!user.is_admin && !user.is_org_admin && (
                          <Chip
                            label="普通用户"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.is_active ? <CheckCircle fontSize="small" sx={{ ml: 0.5 }} /> : <Block fontSize="small" sx={{ ml: 0.5 }} />}
                        label={user.is_active ? '活跃' : '禁用'}
                        size="small"
                        onClick={() => handleToggleStatus(user)}
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          backgroundColor: user.is_active ? '#d1fae5' : '#fee2e2',
                          color: user.is_active ? '#065f46' : '#991b1b',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          '&:hover': {
                            backgroundColor: user.is_active ? '#a7f3d0' : '#fecaca',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{
                            color: '#6b7280',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                              color: '#f093fb',
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              backgroundColor: '#fee2e2',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 编辑用户对话框 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
          setEditForm({});
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a2e' }}>编辑用户</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="用户名"
            fullWidth
            value={editForm.username || ''}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f9fafb',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#374151', fontWeight: 500 }}>账户状态</Typography>
              <Chip
                label={editForm.is_active ? '活跃' : '禁用'}
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: editForm.is_active ? '#d1fae5' : '#fee2e2',
                  color: editForm.is_active ? '#065f46' : '#991b1b',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: editForm.is_active ? '#a7f3d0' : '#fecaca',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#374151', fontWeight: 500 }}>平台管理员</Typography>
              <Chip
                label={editForm.is_admin ? '是' : '否'}
                onClick={() => setEditForm({ ...editForm, is_admin: !editForm.is_admin })}
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: editForm.is_admin ? '#dbeafe' : '#f3f4f6',
                  color: editForm.is_admin ? '#1e40af' : '#6b7280',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: editForm.is_admin ? '#bfdbfe' : '#e5e7eb',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#374151', fontWeight: 500 }}>组织管理员</Typography>
              <Chip
                label={editForm.is_org_admin ? '是' : '否'}
                onClick={() => setEditForm({ ...editForm, is_org_admin: !editForm.is_org_admin })}
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: editForm.is_org_admin ? '#dbeafe' : '#f3f4f6',
                  color: editForm.is_org_admin ? '#1e40af' : '#6b7280',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: editForm.is_org_admin ? '#bfdbfe' : '#e5e7eb',
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
              setEditForm({});
            }}
            sx={{
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
              },
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
