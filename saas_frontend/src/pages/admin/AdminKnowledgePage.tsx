/**
 * 管理端 - 知识库管理页面（使用真实API）
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete,
  LibraryBooks,
  Description,
  Article,
  Upload,
  Visibility,
  Edit,
} from '@mui/icons-material';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  getDocuments,
  createDocument,
  uploadDocument,
  deleteDocument as deleteDocumentAPI,
  type KnowledgeBase,
  type KnowledgeBaseCreate,
  type Document,
} from '../../services/knowledge';

const AdminKnowledgePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [viewDocumentDialogOpen, setViewDocumentDialogOpen] = useState(false);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // 知识库列表
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbError, setKbError] = useState<string | null>(null);

  // 文档列表
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docLoading, setDocLoading] = useState(false);

  // 表单状态
  const [kbForm, setKbForm] = useState<KnowledgeBaseCreate>({
    name: '',
    description: '',
  });

  const [docForm, setDocForm] = useState({
    title: '',
    content: '',
  });

  // 加载知识库列表
  const loadKnowledgeBases = async () => {
    setKbLoading(true);
    setKbError(null);
    try {
      const response = await getKnowledgeBases({ page: 1, page_size: 100 });
      setKnowledgeBases(response.items);
    } catch (error: any) {
      setKbError(error.message || '加载知识库列表失败');
    } finally {
      setKbLoading(false);
    }
  };

  // 加载文档列表
  const loadDocuments = async (kbId: string) => {
    setDocLoading(true);
    try {
      const response = await getDocuments(kbId, { page: 1, page_size: 100 });
      setDocuments(response.items);
    } catch (error: any) {
      console.error('加载文档列表失败:', error);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  // 创建知识库
  const handleCreateKB = async () => {
    try {
      await createKnowledgeBase(kbForm);
      setCreateDialogOpen(false);
      setKbForm({ name: '', description: '' });
      loadKnowledgeBases();
    } catch (error: any) {
      alert(error.message || '创建失败');
    }
  };

  // 删除知识库
  const handleDeleteKB = async (kbId: string) => {
    if (!confirm('确定要删除这个知识库吗？所有文档也将被删除。')) return;

    try {
      await deleteKnowledgeBase(kbId);
      loadKnowledgeBases();
      if (selectedKB?.id === kbId) {
        setSelectedKB(null);
        setDocuments([]);
      }
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  // 创建文档
  const handleCreateDocument = async () => {
    if (!selectedKB) return;

    try {
      await createDocument(selectedKB.id, docForm);
      setDocumentDialogOpen(false);
      setDocForm({ title: '', content: '' });
      loadDocuments(selectedKB.id);
      loadKnowledgeBases(); // 更新文档计数
    } catch (error: any) {
      alert(error.message || '创建失败');
    }
  };

  // 上传文档
  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedKB || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    try {
      await uploadDocument(selectedKB.id, file);
      loadDocuments(selectedKB.id);
      loadKnowledgeBases(); // 更新文档计数
    } catch (error: any) {
      alert(error.message || '上传失败');
    }

    // 重置input
    event.target.value = '';
  };

  // 删除文档
  const handleDeleteDocument = async (docId: string) => {
    if (!selectedKB) return;

    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      await deleteDocumentAPI(selectedKB.id, docId);
      loadDocuments(selectedKB.id);
      loadKnowledgeBases(); // 更新文档计数
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  // 查看文档
  const handleViewDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setViewDocumentDialogOpen(true);
  };

  // 编辑文档
  const handleEditDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setDocForm({
      title: doc.title,
      content: doc.content || '',
    });
    setDocumentDialogOpen(true);
  };

  // 保存编辑的文档
  const handleSaveDocument = async () => {
    if (!selectedKB || !selectedDoc) return;

    try {
      // 先删除旧文档
      await deleteDocumentAPI(selectedKB.id, selectedDoc.id);
      // 创建新文档
      await createDocument(selectedKB.id, docForm);
      setDocumentDialogOpen(false);
      setSelectedDoc(null);
      setDocForm({ title: '', content: '' });
      loadDocuments(selectedKB.id);
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
          知识库管理
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          管理组织的知识库和文档
        </Typography>
      </Box>

      {/* 操作栏 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
          知识库列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
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
          创建知识库
        </Button>
      </Paper>

      {kbError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setKbError(null)}>
          {kbError}
        </Alert>
      )}

      {/* 知识库列表 */}
      {tabValue === 0 && (
        <>
          {kbLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#f093fb' }} />
            </Box>
          ) : knowledgeBases.length === 0 ? (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                borderRadius: 4,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
              }}
            >
              <LibraryBooks sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                还没有知识库
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
                创建第一个知识库开始管理您的文档
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
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
                创建知识库
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {knowledgeBases.map((kb) => (
                <Grid item xs={12} md={6} lg={4} key={kb.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 4,
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                        borderColor: '#f093fb',
                      },
                      border: selectedKB?.id === kb.id ? 2 : 1,
                      borderColor: selectedKB?.id === kb.id ? '#f093fb' : '#e5e7eb',
                    }}
                    onClick={() => {
                      setSelectedKB(kb);
                      loadDocuments(kb.id);
                      setTabValue(1);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            mr: 2,
                            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                          }}
                        >
                          <LibraryBooks />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" noWrap sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                            {kb.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {kb.document_count} 个文档
                          </Typography>
                        </Box>
                      </Box>
                      {kb.description && (
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.5 }}>
                          {kb.description}
                        </Typography>
                      )}
                      <Chip
                        label={kb.is_active ? '活跃' : '停用'}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: kb.is_active ? '#d1fae5' : '#f3f4f6',
                          color: kb.is_active ? '#065f46' : '#6b7280',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<Article />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKB(kb);
                          loadDocuments(kb.id);
                          setTabValue(1);
                        }}
                        sx={{
                          color: '#6b7280',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#f093fb',
                          },
                        }}
                      >
                        查看文档
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKB(kb.id);
                        }}
                        sx={{
                          color: '#ef4444',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#fee2e2',
                          },
                        }}
                        startIcon={<Delete />}
                      >
                        删除
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* 文档管理 */}
      {tabValue === 1 && selectedKB && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {selectedKB.name} - 文档列表
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                共 {documents.length} 个文档
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                component="label"
                sx={{
                  borderRadius: 3,
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#f093fb',
                    backgroundColor: '#f3f4f6',
                    color: '#f093fb',
                  },
                }}
              >
                上传文件
                <input
                  type="file"
                  hidden
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleUploadDocument}
                />
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDocumentDialogOpen(true)}
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
                添加文档
              </Button>
            </Box>
          </Box>

          {docLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#f093fb' }} />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                还没有文档
              </Typography>
            </Box>
          ) : (
            <List>
              {documents.map((doc, index) => (
                <ListItem
                  key={doc.id}
                  divider
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid #f3f4f6',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Description sx={{ color: '#6b7280' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {doc.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={doc.status}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            backgroundColor:
                              doc.status === 'completed'
                                ? '#d1fae5'
                                : doc.status === 'processing'
                                ? '#dbeafe'
                                : doc.status === 'failed'
                                ? '#fee2e2'
                                : '#f3f4f6',
                            color:
                              doc.status === 'completed'
                                ? '#065f46'
                                : doc.status === 'processing'
                                ? '#1e40af'
                                : doc.status === 'failed'
                                ? '#991b1b'
                                : '#6b7280',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                        {doc.file_type && (
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {doc.file_type.toUpperCase()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleViewDocument(doc)}
                      sx={{
                        color: '#6b7280',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                          color: '#3b82f6',
                        },
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleEditDocument(doc)}
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
                      edge="end"
                      size="small"
                      onClick={() => handleDeleteDocument(doc.id)}
                      sx={{
                        color: '#ef4444',
                        '&:hover': {
                          backgroundColor: '#fee2e2',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* 创建知识库对话框 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a2e' }}>创建知识库</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="知识库名称"
            fullWidth
            value={kbForm.name}
            onChange={(e) => setKbForm({ ...kbForm, name: e.target.value })}
            sx={{
              mb: 2,
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
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={3}
            value={kbForm.description}
            onChange={(e) => setKbForm({ ...kbForm, description: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleCreateKB}
            variant="contained"
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
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加/编辑文档对话框 */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => {
          setDocumentDialogOpen(false);
          setSelectedDoc(null);
          setDocForm({ title: '', content: '' });
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a2e' }}>
          {selectedDoc ? '编辑文档' : '添加文档'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文档标题"
            fullWidth
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            sx={{
              mb: 2,
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
          <TextField
            margin="dense"
            label="文档内容"
            fullWidth
            multiline
            rows={6}
            value={docForm.content}
            onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setDocumentDialogOpen(false);
              setSelectedDoc(null);
              setDocForm({ title: '', content: '' });
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
            onClick={selectedDoc ? handleSaveDocument : handleCreateDocument}
            variant="contained"
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
            {selectedDoc ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 查看文档对话框 */}
      <Dialog
        open={viewDocumentDialogOpen}
        onClose={() => setViewDocumentDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedDoc?.title}</DialogTitle>
        <DialogContent>
          {selectedDoc?.content ? (
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#f9fafb',
                borderRadius: 3,
                border: '1px solid #e5e7eb',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6 }}>
                {selectedDoc.content}
              </Typography>
            </Paper>
          ) : (
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              此文档没有文本内容（可能是上传的文件）
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
              文档ID: {selectedDoc?.id}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
              状态: {selectedDoc?.status}
            </Typography>
            {selectedDoc?.file_type && (
              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                文件类型: {selectedDoc.file_type}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setViewDocumentDialogOpen(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            关闭
          </Button>
          <Button
            onClick={() => {
              setViewDocumentDialogOpen(false);
              handleEditDocument(selectedDoc!);
            }}
            variant="contained"
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
            编辑
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminKnowledgePage;
