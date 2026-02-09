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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            知识库管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理组织的知识库和文档
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ bgcolor: '#f093fb' }}
        >
          创建知识库
        </Button>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="知识库列表" />
          <Tab label="文档管理" disabled={!selectedKB} />
        </Tabs>
      </Paper>

      {kbError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setKbError(null)}>
          {kbError}
        </Alert>
      )}

      {tabValue === 0 && (
        <>
          {kbLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : knowledgeBases.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
              <LibraryBooks sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                还没有知识库
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                创建第一个知识库开始管理您的文档
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ bgcolor: '#f093fb' }}
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
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                      border: selectedKB?.id === kb.id ? 2 : 0,
                      borderColor: '#f093fb',
                    }}
                    onClick={() => {
                      setSelectedKB(kb);
                      loadDocuments(kb.id);
                      setTabValue(1);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#f093fb', mr: 2 }}>
                          <LibraryBooks />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" noWrap>
                            {kb.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {kb.document_count} 个文档
                          </Typography>
                        </Box>
                      </Box>
                      {kb.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {kb.description}
                        </Typography>
                      )}
                      <Chip
                        label={kb.is_active ? '活跃' : '停用'}
                        color={kb.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Article />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKB(kb);
                          loadDocuments(kb.id);
                          setTabValue(1);
                        }}
                      >
                        查看文档
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKB(kb.id);
                        }}
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

      {tabValue === 1 && selectedKB && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6">
                {selectedKB.name} - 文档列表
              </Typography>
              <Typography variant="body2" color="text.secondary">
                共 {documents.length} 个文档
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                component="label"
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
                sx={{ bgcolor: '#f093fb' }}
              >
                添加文档
              </Button>
            </Box>
          </Box>

          {docLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                还没有文档
              </Typography>
            </Box>
          ) : (
            <List>
              {documents.map((doc) => (
                <ListItem key={doc.id} divider>
                  <ListItemIcon>
                    <Description color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={doc.status}
                          size="small"
                          color={
                            doc.status === 'completed'
                              ? 'success'
                              : doc.status === 'processing'
                              ? 'info'
                              : doc.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                        />
                        {doc.file_type && (
                          <Typography variant="caption" color="text.secondary">
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
                      color="primary"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleEditDocument(doc)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDocument(doc.id)}
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建知识库</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="知识库名称"
            fullWidth
            value={kbForm.name}
            onChange={(e) => setKbForm({ ...kbForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={3}
            value={kbForm.description}
            onChange={(e) => setKbForm({ ...kbForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateKB} variant="contained" sx={{ bgcolor: '#f093fb' }}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加/编辑文档对话框 */}
      <Dialog open={documentDialogOpen} onClose={() => {
        setDocumentDialogOpen(false);
        setSelectedDoc(null);
        setDocForm({ title: '', content: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDoc ? '编辑文档' : '添加文档'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文档标题"
            fullWidth
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="文档内容"
            fullWidth
            multiline
            rows={6}
            value={docForm.content}
            onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDocumentDialogOpen(false);
            setSelectedDoc(null);
            setDocForm({ title: '', content: '' });
          }}>取消</Button>
          <Button
            onClick={selectedDoc ? handleSaveDocument : handleCreateDocument}
            variant="contained"
            sx={{ bgcolor: '#f093fb' }}
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
      >
        <DialogTitle>{selectedDoc?.title}</DialogTitle>
        <DialogContent>
          {selectedDoc?.content ? (
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedDoc.content}
              </Typography>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              此文档没有文本内容（可能是上传的文件）
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              文档ID: {selectedDoc?.id}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              状态: {selectedDoc?.status}
            </Typography>
            {selectedDoc?.file_type && (
              <>
                <br />
                <Typography variant="caption" color="text.secondary">
                  文件类型: {selectedDoc.file_type}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDocumentDialogOpen(false)}>关闭</Button>
          <Button
            onClick={() => {
              setViewDocumentDialogOpen(false);
              handleEditDocument(selectedDoc!);
            }}
            variant="contained"
            sx={{ bgcolor: '#f093fb' }}
          >
            编辑
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminKnowledgePage;
