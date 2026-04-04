import { apiClient, getItems } from './client';
import type { DatasetResponse, DatasetPreview, DatasetStatistics } from '../types';

export const datasetsApi = {
  upload: async (formData: FormData): Promise<DatasetResponse> => {
    const res = await apiClient.post<DatasetResponse>('/datasets/upload', formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return res.data;
  },

  list: async (page = 1, pageSize = 100): Promise<DatasetResponse[]> => {
    const res = await apiClient.get('/datasets/', {
      params: { page, page_size: pageSize },
    });
    return getItems<DatasetResponse>(res.data);
  },

  get: async (id: number): Promise<DatasetResponse> => {
    const res = await apiClient.get<DatasetResponse>(`/datasets/${id}`);
    return res.data;
  },

  preview: async (id: number, limit?: number): Promise<DatasetPreview> => {
    const res = await apiClient.get<DatasetPreview>(`/datasets/${id}/preview`, {
      params: limit ? { limit } : undefined,
    });
    return res.data;
  },

  statistics: async (id: number): Promise<DatasetStatistics[]> => {
    const res = await apiClient.get<DatasetStatistics[]>(`/datasets/${id}/statistics`);
    return Array.isArray(res.data) ? res.data : [];
  },

  deleteDataset: async (id: number): Promise<void> => {
    await apiClient.delete(`/datasets/${id}`);
  },
};
