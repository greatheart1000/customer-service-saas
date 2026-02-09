/**
 * API 客户端
 */
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token 过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  register: (data: { email: string; password: string; username?: string }) =>
    apiClient.post('/v1/auth/register', data),

  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/v1/auth/login', formData);
  },

  logout: () => apiClient.post('/v1/auth/logout'),

  getCurrentUser: () => apiClient.get('/v1/auth/me'),

  updateProfile: (data: any) => apiClient.put('/v1/auth/me', data),
};

export const organizationAPI = {
  list: () => apiClient.get('/v1/organizations'),

  create: (data: { name: string; logo_url?: string }) =>
    apiClient.post('/v1/organizations', data),

  get: (id: string) => apiClient.get(`/v1/organizations/${id}`),

  update: (id: string, data: any) => apiClient.put(`/v1/organizations/${id}`, data),

  inviteMember: (id: string, data: { email: string; role: string }) =>
    apiClient.post(`/v1/organizations/${id}/members`, data),

  removeMember: (id: string, userId: string) =>
    apiClient.delete(`/v1/organizations/${id}/members/${userId}`),
};

export const subscriptionAPI = {
  getPlans: () => apiClient.get('/v1/subscriptions/plans'),

  getCurrent: (organizationId: string) =>
    apiClient.get(`/v1/subscriptions/current?organization_id=${organizationId}`),

  upgrade: (organizationId: string, planType: string, billingCycle: string) =>
    apiClient.post('/v1/subscriptions/upgrade', {
      organization_id: organizationId,
      plan_type: planType,
      billing_cycle: billingCycle,
    }),

  cancel: (organizationId: string) =>
    apiClient.post('/v1/subscriptions/cancel', { organization_id: organizationId }),
};

export const paymentAPI = {
  createWechatPay: (data: any) =>
    apiClient.post('/v1/payments/wechat/create', data),

  createAlipay: (data: any) =>
    apiClient.post('/v1/payments/alipay/create', data),

  getOrder: (orderId: string) =>
    apiClient.get(`/v1/payments/orders/${orderId}`),
};

export const usageAPI = {
  getStats: (organizationId: string, startDate?: string, endDate?: string) =>
    apiClient.get('/v1/usage/stats', {
      params: { organization_id: organizationId, period_start: startDate, period_end: endDate },
    }),

  getHistory: (organizationId: string, days: number = 30) =>
    apiClient.get('/v1/usage/history', {
      params: { organization_id: organizationId, days },
    }),
};

/**
 * 通用请求方法 - 用于向后兼容
 */
export async function request<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: any;
  } = {}
): Promise<T> {
  const { method = 'GET', data, params } = options;

  const config: any = {
    method,
    url: endpoint,
  };

  if (data) {
    config.data = data;
  }

  if (params) {
    config.params = params;
  }

  const response = await apiClient.request(config);
  return response.data;
}

export default apiClient;
