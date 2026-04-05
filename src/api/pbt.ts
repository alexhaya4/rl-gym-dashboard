import { apiClient, getItems } from './client';
import type { PBTExperiment, PBTMember } from '../types';

export const pbtApi = {
  create: async (data: { environment_id: string; algorithm: string; n_population: number; total_timesteps: number }): Promise<PBTExperiment> => {
    const res = await apiClient.post<PBTExperiment>('/pbt/', data);
    return res.data;
  },
  list: async (): Promise<PBTExperiment[]> => {
    const res = await apiClient.get('/pbt/');
    return getItems<PBTExperiment>(res.data);
  },
  get: async (id: number): Promise<PBTExperiment> => {
    const res = await apiClient.get<PBTExperiment>(`/pbt/${id}`);
    return res.data;
  },
  members: async (id: number): Promise<PBTMember[]> => {
    const res = await apiClient.get<PBTMember[]>(`/pbt/${id}/members`);
    return Array.isArray(res.data) ? res.data : [];
  },
  best: async (id: number): Promise<PBTMember> => {
    const res = await apiClient.get<PBTMember>(`/pbt/${id}/best`);
    return res.data;
  },
};
