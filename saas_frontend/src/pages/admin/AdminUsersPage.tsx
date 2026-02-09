/**
 * 管理端 - 用户管理页面（使用真实API）
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
  Pagination,
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            用户管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理系统中的所有用户
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="搜索用户邮箱或用户名..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ bgcolor: '#f093fb' }}>
            搜索
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无用户
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? '没有找到匹配的用户' : '系统中还没有用户'}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用户</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>组织</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>注册时间</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar_url}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user.username || '未设置'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.organization ? (
                        <Chip label={user.organization.name} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.is_admin && (
                          <Chip
                            icon={<Security fontSize="small" />}
                            label="平台管理员"
                            size="small"
                            color="secondary"
                          />
                        )}
                        {user.is_org_admin && !user.is_admin && (
                          <Chip
                            icon={<Security fontSize="small" />}
                            label="组织管理员"
                            size="small"
                            color="info"
                          />
                        )}
                        {!user.is_admin && !user.is_org_admin && (
                          <Chip label="普通用户" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.is_active ? <CheckCircle fontSize="small" /> : <Block fontSize="small" />}
                        label={user.is_active ? '活跃' : '禁用'}
                        size="small"
                        color={user.is_active ? 'success' : 'default'}
                        sx={{ fontWeight: 500 }}
                        onClick={() => handleToggleStatus(user)}
                        style={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 分页 */}
      {total > pageSize && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* 编辑用户对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="用户名"
            fullWidth
            value={editForm.username || ''}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>账户状态</Typography>
              <Chip
                label={editForm.is_active ? '活跃' : '禁用'}
                color={editForm.is_active ? 'success' : 'default'}
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>平台管理员</Typography>
              <Chip
                label={editForm.is_admin ? '是' : '否'}
                color={editForm.is_admin ? 'secondary' : 'default'}
                onClick={() => setEditForm({ ...editForm, is_admin: !editForm.is_admin })}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>组织管理员</Typography>
              <Chip
                label={editForm.is_org_admin ? '是' : '否'}
                color={editForm.is_org_admin ? 'info' : 'default'}
                onClick={() => setEditForm({ ...editForm, is_org_admin: !editForm.is_org_admin })}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#f093fb' }}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
