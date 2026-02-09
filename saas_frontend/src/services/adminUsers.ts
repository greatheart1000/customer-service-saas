/**
 * 用户管理 API（管理端）
 */
import { request } from './api';

export interface AdminUser {
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
  organization?: {
    id: string;
    name: string;
  };
}

export interface UserUpdateByAdmin {
  username?: string;
  phone?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
  is_org_admin?: boolean;
}

export interface UserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * 获取用户列表
 */
export async function getUsers(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
}): Promise<UserListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
  if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
  if (params?.search) queryParams.append('search', params.search);

  const url = `/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
  return request<UserListResponse>(url);
}

/**
 * 获取用户详情
 */
export async function getUser(userId: string): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}`);
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, data: UserUpdateByAdmin): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<void> {
  return request<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}
