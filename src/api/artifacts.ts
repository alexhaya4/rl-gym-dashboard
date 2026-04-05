import { apiClient, getItems } from './client';
import type { Artifact } from '../types';

export const artifactsApi = {
  create: async (data: { name: string; type: string; uri: string; description?: string; experiment_id?: number }): Promise<Artifact> => {
    const res = await apiClient.post<Artifact>('/artifacts/', data);
    return res.data;
  },
  list: async (experimentId?: number): Promise<Artifact[]> => {
    const res = await apiClient.get('/artifacts/', {
      params: experimentId ? { experiment_id: experimentId } : undefined,
    });
    return getItems<Artifact>(res.data);
  },
  get: async (id: number): Promise<Artifact> => {
    const res = await apiClient.get<Artifact>(`/artifacts/${id}`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/artifacts/${id}`);
  },
  lineage: async (id: number, data: { parent_experiment_id: number; child_experiment_id: number; relationship_type: string; description?: string }): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>(`/artifacts/${id}/lineage`, data);
    return res.data;
  },
};
