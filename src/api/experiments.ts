import { apiClient, getItems } from './client';
import type { Experiment, ExperimentCreate } from '../types';

export const experimentsApi = {
  list: async (page = 1, pageSize = 100): Promise<Experiment[]> => {
    const res = await apiClient.get('/experiments', { params: { page, page_size: pageSize } });
    return getItems<Experiment>(res.data);
  },

  get: async (id: number): Promise<Experiment> => {
    const res = await apiClient.get<Experiment>(`/experiments/${id}`);
    return res.data;
  },

  create: async (data: ExperimentCreate): Promise<Experiment> => {
    const res = await apiClient.post<Experiment>('/experiments', data);
    return res.data;
  },

  update: async (id: number, data: Partial<ExperimentCreate>): Promise<Experiment> => {
    const res = await apiClient.patch<Experiment>(`/experiments/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`);
  },

  episodes: async (experimentId: number): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>(`/experiments/${experimentId}/episodes`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
