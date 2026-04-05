import { apiClient, getItems } from './client';
import type { OptimizationStudy } from '../types';

export const optimizationApi = {
  run: async (data: { environment_id: string; algorithm: string; n_trials: number; optimization_metric?: string }): Promise<OptimizationStudy> => {
    const res = await apiClient.post<OptimizationStudy>('/optimization/run', data);
    return res.data;
  },
  list: async (): Promise<OptimizationStudy[]> => {
    const res = await apiClient.get('/optimization/');
    return getItems<OptimizationStudy>(res.data);
  },
  get: async (studyId: number): Promise<OptimizationStudy> => {
    const res = await apiClient.get<OptimizationStudy>(`/optimization/${studyId}`);
    return res.data;
  },
  history: async (studyId: number): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>(`/optimization/${studyId}/history`);
    return Array.isArray(res.data) ? res.data : [];
  },
  spaces: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/optimization/algorithms/spaces');
    return res.data;
  },
};
