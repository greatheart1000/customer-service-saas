/**
 * 用户相关 API
 */
import { request } from './api';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  is_org_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return request('/auth/me');
}

/**
 * 更新用户信息
 */
export async function updateUser(data: {
  username?: string;
  phone?: string;
  avatar_url?: string;
}): Promise<UserProfile> {
  return request('/auth/me', {
    method: 'PUT',
    data: data,
  });
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}
