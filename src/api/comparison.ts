import { apiClient } from './client';

export const comparisonApi = {
  compare: async (experimentIds: number[]): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>('/comparison/', {
      experiment_ids: experimentIds,
    });
    return res.data;
  },
  diff: async (expIdA: number, expIdB: number): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>(
      `/comparison/diff/${expIdA}/${expIdB}`
    );
    return res.data;
  },
  lineage: async (experimentId: number): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>(`/comparison/lineage/${experimentId}`);
    return res.data;
  },
  setTags: async (experimentId: number, tags: string[]): Promise<Record<string, unknown>> => {
    const res = await apiClient.patch<Record<string, unknown>>(
      `/comparison/experiments/${experimentId}/tags`,
      tags
    );
    return res.data;
  },
  exportExperiment: async (experimentId: number, format: string): Promise<Blob> => {
    const res = await apiClient.get(`/comparison/experiments/${experimentId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return res.data as Blob;
  },
};
