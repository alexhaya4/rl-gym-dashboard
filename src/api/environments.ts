import { apiClient } from './client';
import type { Environment, EnvironmentCreate, StepResult, ResetResult } from '../types';

export const environmentsApi = {
  list: async (): Promise<Environment[]> => {
    const res = await apiClient.get<Environment[]>('/environments/');
    return Array.isArray(res.data) ? res.data : [];
  },

  available: async (): Promise<Record<string, string>[]> => {
    const res = await apiClient.get<Record<string, string>[]>('/environments/available');
    return res.data;
  },

  get: async (envKey: string): Promise<Environment> => {
    const res = await apiClient.get<Environment>(`/environments/${envKey}`);
    return res.data;
  },

  create: async (data: EnvironmentCreate): Promise<Environment> => {
    const res = await apiClient.post<Environment>('/environments/', data);
    return res.data;
  },

  delete: async (envKey: string): Promise<void> => {
    await apiClient.delete(`/environments/${envKey}`);
  },

  reset: async (envKey: string): Promise<ResetResult> => {
    const res = await apiClient.post<ResetResult>(`/environments/${envKey}/reset`);
    return res.data;
  },

  step: async (envKey: string, action: number | number[]): Promise<StepResult> => {
    const res = await apiClient.post<StepResult>(`/environments/${envKey}/step`, { action });
    return res.data;
  },
};
