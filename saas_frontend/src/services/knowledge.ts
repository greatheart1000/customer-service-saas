/**
 * 知识库管理 API
 */
import { request } from './api';

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  document_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseCreate {
  name: string;
  description?: string;
}

export interface KnowledgeBaseUpdate {
  name?: string;
  description?: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  knowledge_base_id: string;
  uploaded_by: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreate {
  title: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  knowledge_base_id: string;
}

export interface KnowledgeBaseListResponse {
  items: KnowledgeBase[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * 获取知识库列表
 */
export async function getKnowledgeBases(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}): Promise<KnowledgeBaseListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

  const url = `/admin/knowledge${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<KnowledgeBaseListResponse>(url);
}

/**
 * 创建知识库
 */
export async function createKnowledgeBase(data: KnowledgeBaseCreate): Promise<KnowledgeBase> {
  return request<KnowledgeBase>('/admin/knowledge', {
    method: 'POST',
    data,
  });
}

/**
 * 获取知识库详情
 */
export async function getKnowledgeBase(kbId: string): Promise<KnowledgeBase> {
  return request<KnowledgeBase>(`/admin/knowledge/${kbId}`);
}

/**
 * 更新知识库
 */
export async function updateKnowledgeBase(
  kbId: string,
  data: KnowledgeBaseUpdate
): Promise<KnowledgeBase> {
  return request<KnowledgeBase>(`/admin/knowledge/${kbId}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除知识库
 */
export async function deleteKnowledgeBase(kbId: string): Promise<void> {
  return request<void>(`/admin/knowledge/${kbId}`, {
    method: 'DELETE',
  });
}

/**
 * 获取知识库的文档列表
 */
export async function getDocuments(
  kbId: string,
  params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }
): Promise<DocumentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.status) queryParams.append('status', params.status);

  const url = `/admin/knowledge/${kbId}/documents${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<DocumentListResponse>(url);
}

/**
 * 创建文档
 */
export async function createDocument(kbId: string, data: Omit<DocumentCreate, 'knowledge_base_id'>): Promise<Document> {
  return request<Document>(`/admin/knowledge/${kbId}/documents`, {
    method: 'POST',
    data: {
      ...data,
      knowledge_base_id: kbId,
    },
  });
}

/**
 * 上传文档文件
 */
export async function uploadDocument(kbId: string, file: File): Promise<Document> {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/v1/admin/knowledge/${kbId}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '上传失败' }));
    throw new Error(error.detail || '上传失败');
  }

  return response.json();
}

/**
 * 获取文档详情
 */
export async function getDocument(kbId: string, docId: string): Promise<Document> {
  return request<Document>(`/admin/knowledge/${kbId}/documents/${docId}`);
}

/**
 * 删除文档
 */
export async function deleteDocument(kbId: string, docId: string): Promise<void> {
  return request<void>(`/admin/knowledge/${kbId}/documents/${docId}`, {
    method: 'DELETE',
  });
}
