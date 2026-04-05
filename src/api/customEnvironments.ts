import { apiClient, getItems } from './client';
import type { CustomEnvironment } from '../types';

export const customEnvironmentsApi = {
  create: async (data: {
    name: string;
    source_code: string;
    description?: string;
    entry_point: string;
  }): Promise<CustomEnvironment> => {
    const res = await apiClient.post<CustomEnvironment>('/custom-environments', data);
    return res.data;
  },
  list: async (): Promise<CustomEnvironment[]> => {
    const res = await apiClient.get('/custom-environments');
    return getItems<CustomEnvironment>(res.data);
  },
  get: async (id: number): Promise<CustomEnvironment> => {
    const res = await apiClient.get<CustomEnvironment>(`/custom-environments/${id}`);
    return res.data;
  },
  validate: async (id: number): Promise<CustomEnvironment> => {
    const res = await apiClient.post<CustomEnvironment>(`/custom-environments/${id}/validate`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/custom-environments/${id}`);
  },
};
