import { apiClient, getItems } from './client';
import type { ModelVersionResponse } from '../types';

export const modelsApi = {
  listByExperiment: async (experimentId: number): Promise<ModelVersionResponse[]> => {
    const res = await apiClient.get(`/models/experiments/${experimentId}`);
    return getItems<ModelVersionResponse>(res.data);
  },

  get: async (versionId: number): Promise<ModelVersionResponse> => {
    const res = await apiClient.get<ModelVersionResponse>(`/models/${versionId}`);
    return res.data;
  },

  download: async (versionId: number): Promise<void> => {
    const res = await apiClient.get(`/models/${versionId}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-${versionId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },

  delete: async (versionId: number): Promise<void> => {
    await apiClient.delete(`/models/${versionId}`);
  },
};
