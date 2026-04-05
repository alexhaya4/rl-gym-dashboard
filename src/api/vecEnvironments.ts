import { apiClient } from './client';

export const vecEnvironmentsApi = {
  create: async (data: { environment_id: string; n_envs: number; use_subprocess?: boolean }): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>('/vec-environments/', data);
    return res.data;
  },
  list: async (): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>('/vec-environments/');
    return Array.isArray(res.data) ? res.data : [];
  },
  get: async (vecKey: string): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>(`/vec-environments/${vecKey}`);
    return res.data;
  },
  reset: async (vecKey: string): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>(`/vec-environments/${vecKey}/reset`);
    return res.data;
  },
  step: async (vecKey: string, actions: unknown[]): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>(`/vec-environments/${vecKey}/step`, { actions });
    return res.data;
  },
  delete: async (vecKey: string): Promise<void> => {
    await apiClient.delete(`/vec-environments/${vecKey}`);
  },
};
