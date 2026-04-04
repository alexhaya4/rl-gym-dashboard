import { apiClient } from './client';
import type { InferenceResponse, ModelCacheInfo } from '../types';

export const inferenceApi = {
  predict: async (
    environmentId: string,
    observation: number[],
    algorithm?: string,
    deterministic?: boolean,
  ): Promise<InferenceResponse> => {
    const res = await apiClient.post<InferenceResponse>(
      `/inference/${environmentId}/predict`,
      { observation, algorithm, deterministic },
    );
    return res.data;
  },

  getInfo: async (
    environmentId: string,
    algorithm?: string,
  ): Promise<Record<string, unknown>> => {
    const res = await apiClient.get(`/inference/${environmentId}/info`, {
      params: algorithm ? { algorithm } : undefined,
    });
    return res.data;
  },

  getCache: async (): Promise<ModelCacheInfo[]> => {
    const res = await apiClient.get<ModelCacheInfo[]>('/inference/cache');
    return Array.isArray(res.data) ? res.data : [];
  },

  clearCache: async (): Promise<void> => {
    await apiClient.delete('/inference/cache');
  },
};
