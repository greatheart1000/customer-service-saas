/**
 * 租户相关API服务
 * 用于终端用户通过租户UUID访问聊天功能
 */

import api from './api';

// ============ 类型定义 ============

export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  welcome_message?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  is_active: boolean;
  bots: Bot[];
}

export interface KnowledgeBaseSummary {
  id: string;
  name: string;
  description?: string;
  document_count: number;
}

export interface KnowledgeBaseListResponse {
  total: number;
  items: KnowledgeBaseSummary[];
}

// ============ API函数 ============

/**
 * 获取租户公开信息
 * @param tenantUuid 租户UUID
 * @returns 租户信息（包含机器人列表）
 */
export const getTenantInfo = async (tenantUuid: string): Promise<TenantInfo> => {
  const response = await api.get<TenantInfo>(`/tenant/${tenantUuid}/info`);
  return response.data;
};

/**
 * 获取租户的所有机器人
 * @param tenantUuid 租户UUID
 * @returns 机器人列表
 */
export const getTenantBots = async (tenantUuid: string): Promise<Bot[]> => {
  const response = await api.get<Bot[]>(`/tenant/${tenantUuid}/bots`);
  return response.data;
};

/**
 * 获取租户的特定机器人详情
 * @param tenantUuid 租户UUID
 * @param botId 机器人ID
 * @returns 机器人详情
 */
export const getTenantBot = async (tenantUuid: string, botId: string): Promise<Bot> => {
  const response = await api.get<Bot>(`/tenant/${tenantUuid}/bots/${botId}`);
  return response.data;
};

/**
 * 获取租户的知识库列表
 * @param tenantUuid 租户UUID
 * @returns 知识库列表
 */
export const getTenantKnowledgeBases = async (
  tenantUuid: string
): Promise<KnowledgeBaseListResponse> => {
  const response = await api.get<KnowledgeBaseListResponse>(
    `/tenant/${tenantUuid}/knowledge-bases`
  );
  return response.data;
};

// ============ 工具函数 ============

/**
 * 从URL中提取租户UUID
 * 支持以下格式：
 * - /tenant/:uuid/chat
 * - /chat/:uuid
 * - ?tenant_id=:uuid
 */
export const extractTenantUuidFromUrl = (): string | null => {
  const path = window.location.pathname;

  // 匹配 /tenant/:uuid/... 或 /chat/:uuid
  const match = path.match(/\/(?:tenant|chat)\/([a-f0-9-]{36})/i);
  if (match && match[1]) {
    return match[1];
  }

  // 匹配查询参数 ?tenant_id=:uuid
  const params = new URLSearchParams(window.location.search);
  const tenantId = params.get('tenant_id');
  if (tenantId) {
    return tenantId;
  }

  return null;
};

/**
 * 验证租户UUID格式
 */
export const isValidTenantUuid = (uuid: string): boolean => {
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * 构建租户访问URL
 */
export const buildTenantUrl = (tenantUuid: string, path: string = ''): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/tenant/${tenantUuid}${path}`;
};
