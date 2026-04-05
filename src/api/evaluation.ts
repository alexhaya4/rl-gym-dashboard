import { apiClient } from './client';

export const evaluationApi = {
  run: async (data: { experiment_id: number; n_episodes: number; deterministic?: boolean }): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>('/evaluation/run', data);
    return res.data;
  },
  episodes: async (experimentId: number): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>(`/evaluation/experiments/${experimentId}/episodes`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
