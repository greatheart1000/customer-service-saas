/**
 * 对话管理 API（管理端）
 */
import { request } from './api';

export interface Conversation {
  id: string;
  title: string;
  bot_id: string;
  user_id: string;
  organization_id: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  coze_message_id?: string;
  created_at: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface MessageListResponse {
  items: Message[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * 获取所有对话列表（管理端）
 */
export async function getAllConversations(params?: {
  page?: number;
  page_size?: number;
  bot_id?: string;
  user_id?: string;
}): Promise<ConversationListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.bot_id) queryParams.append('bot_id', params.bot_id);
  if (params?.user_id) queryParams.append('user_id', params.user_id);

  const url = `/conversations/admin/all${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<ConversationListResponse>(url);
}

/**
 * 获取对话详情
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  return request<Conversation>(`/conversations/${conversationId}`);
}

/**
 * 获取对话的消息列表
 */
export async function getConversationMessages(
  conversationId: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<MessageListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const url = `/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<MessageListResponse>(url);
}

/**
 * 删除对话
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  return request<void>(`/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

/**
 * 获取用户对话列表（用户端）
 */
export async function getUserConversations(params?: {
  page?: number;
  page_size?: number;
  bot_id?: string;
}): Promise<ConversationListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.bot_id) queryParams.append('bot_id', params.bot_id);

  const url = `/conversations${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<ConversationListResponse>(url);
}
