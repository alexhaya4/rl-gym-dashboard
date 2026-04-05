import { apiClient } from './client';

export const rbacApi = {
  myPermissions: async (orgId?: number): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/rbac/my-permissions', {
      params: orgId ? { organization_id: orgId } : undefined,
    });
    return res.data;
  },
  check: async (permission: string): Promise<{ allowed: boolean }> => {
    const res = await apiClient.post<{ allowed: boolean }>('/rbac/check', { permission });
    return res.data;
  },
  assign: async (data: {
    user_id: number;
    role: string;
    organization_id?: number;
  }): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>('/rbac/assign', data);
    return res.data;
  },
  roles: async (): Promise<{ roles: string[] }> => {
    const res = await apiClient.get<{ roles: string[] }>('/rbac/roles');
    return res.data;
  },
};
