/**
 * 聊天相关 API
 */
import { request } from './api';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  bot_id: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  welcome_message?: string;
  is_active: boolean;
}

export interface ChatRequest {
  bot_id: string;
  message: string;
  conversation_id?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message_id: string;
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
}

/**
 * 获取可用的机器人列表
 */
export async function getBots(): Promise<Bot[]> {
  return request<{ items: Bot[]; total: number }>('/bots').then((data: { items: Bot[]; total: number }) => data.items);
}

/**
 * 获取对话历史列表
 */
export async function getConversations(params?: {
  page?: number;
  page_size?: number;
  bot_id?: string;
}): Promise<{ items: Conversation[]; total: number; has_more: boolean }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.bot_id) queryParams.append('bot_id', params.bot_id);

  const url = `/conversations${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request(url);
}

/**
 * 创建新对话
 */
export async function createConversation(data: {
  bot_id: string;
  title?: string;
}): Promise<Conversation> {
  return request('/conversations', {
    method: 'POST',
    data: data,
  });
}

/**
 * 获取对话详情
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  return request(`/conversations/${conversationId}`);
}

/**
 * 获取对话消息列表
 */
export async function getMessages(
  conversationId: string,
  params?: { page?: number; page_size?: number }
): Promise<{ items: Message[]; total: number; has_more: boolean }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const url = `/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request(url);
}

/**
 * 发送消息（非流式）
 */
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  return request('/chat/chat', {
    method: 'POST',
    data: data,
  });
}

/**
 * 发送消息（流式）
 */
export async function sendMessageStream(
  data: ChatRequest,
  onChunk: (chunk: StreamChunk) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<() => void> {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/v1/chat/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '发送失败' }));
    onError(error.detail || '发送失败');
    throw error;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onError('无法读取响应流');
    throw new Error('无法读取响应流');
  }

  let cancelled = false;

  async function read() {
    try {
      while (!cancelled) {
        const { done, value } = await reader!.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);

              if (parsed.type === 'done') {
                onComplete();
                return;
              }

              if (parsed.type === 'error') {
                onError(parsed.error || '发生错误');
                return;
              }
            } catch (e) {
              // 忽略解析错误
              console.warn('Failed to parse SSE chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      if (!cancelled) {
        onError('网络错误');
      }
    }
  }

  read();

  // 返回取消函数
  return () => {
    cancelled = true;
    reader.cancel();
  };
}

export interface StreamChunk {
  type: 'message' | 'error' | 'done';
  content?: string;
  message_id?: string;
  conversation_id?: string;
  error?: string;
}
