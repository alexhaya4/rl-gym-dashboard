import { apiClient } from './client';
import type { BenchmarkRunRequest, BenchmarkRunResponse } from '../types';

export const benchmarksApi = {
  run: async (data: BenchmarkRunRequest): Promise<BenchmarkRunResponse> => {
    const res = await apiClient.post<BenchmarkRunResponse>('/benchmarks/run', data);
    return res.data;
  },

  environments: async (): Promise<string[]> => {
    const res = await apiClient.get<{ environments: string[] }>('/benchmarks/environments');
    return res.data.environments;
  },

  algorithms: async (): Promise<{ name: string; description: string }[]> => {
    const res = await apiClient.get<{ algorithms: { name: string; description: string }[] }>('/benchmarks/algorithms');
    return res.data.algorithms;
  },
};
