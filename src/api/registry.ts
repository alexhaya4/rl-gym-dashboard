import { apiClient, getItems } from './client';
import type { RegistryEntry } from '../types';

export const registryApi = {
  register: async (data: { model_version_id: number; environment_id: string; algorithm: string }): Promise<RegistryEntry> => {
    const res = await apiClient.post<RegistryEntry>('/registry/register', null, {
      params: data,
    });
    return res.data;
  },

  list: async (stage?: string): Promise<RegistryEntry[]> => {
    const res = await apiClient.get('/registry/', {
      params: stage ? { stage } : undefined,
    });
    return getItems<RegistryEntry>(res.data);
  },

  getProduction: async (envId: string, algorithm: string): Promise<RegistryEntry> => {
    const res = await apiClient.get<RegistryEntry>(`/registry/production/${envId}/${algorithm}`);
    return res.data;
  },

  promote: async (registryId: number, data: { model_version_id: number; target_stage: string }): Promise<RegistryEntry> => {
    const res = await apiClient.post<RegistryEntry>(`/registry/${registryId}/promote`, data);
    return res.data;
  },

  rollback: async (envId: string, algorithm: string, comment?: string): Promise<RegistryEntry> => {
    const res = await apiClient.post<RegistryEntry>(`/registry/rollback/${envId}/${algorithm}`, {
      comment,
    });
    return res.data;
  },

  compare: async (registryId: number): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>(`/registry/${registryId}/compare`);
    return res.data;
  },
};
