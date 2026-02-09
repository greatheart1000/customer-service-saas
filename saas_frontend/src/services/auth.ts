/**
 * 认证服务 - 处理登录、注册、角色管理
 */
const API_BASE = '/api/v1';

export interface User {
  id: string;
  email: string;
  username?: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  is_org_admin: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authService = {
  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '登录失败');
    }

    const data: AuthResponse = await response.json();

    // 保存 tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    // 获取并保存用户信息（包含角色）
    const user = await this.getCurrentUser();
    this.saveUserToStorage(user);

    return data;
  },

  /**
   * 用户注册
   */
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '注册失败');
    }

    return response.json();
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未登录');
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return response.json();
  },

  /**
   * 保存用户信息到 localStorage
   */
  saveUserToStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('is_admin', user.is_admin.toString());
    localStorage.setItem('is_org_admin', user.is_org_admin.toString());
    localStorage.setItem('user_role', this.getUserRole(user));
  },

  /**
   * 从 localStorage 获取用户信息
   */
  getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * 获取用户角色字符串
   */
  getUserRole(user?: User): string {
    const userData = user || this.getUserFromStorage();
    if (!userData) return 'guest';

    if (userData.is_admin) return 'admin';
    if (userData.is_org_admin) return 'org_admin';
    return 'user';
  },

  /**
   * 检查是否是平台管理员
   */
  isAdmin(): boolean {
    return localStorage.getItem('is_admin') === 'true';
  },

  /**
   * 检查是否是组织管理员
   */
  isOrgAdmin(): boolean {
    return localStorage.getItem('is_org_admin') === 'true';
  },

  /**
   * 检查是否可以访问管理端
   */
  canAccessAdmin(): boolean {
    return this.isAdmin() || this.isOrgAdmin();
  },

  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('is_org_admin');
    localStorage.removeItem('user_role');
  },

  /**
   * 获取 token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};

export default authService;
