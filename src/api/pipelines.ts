import { apiClient, getItems } from './client';
import type { PipelineRun } from '../types';

export const pipelinesApi = {
  health: async (): Promise<{ prefect_available: boolean; version: string }> => {
    const res = await apiClient.get<{ prefect_available: boolean; version: string }>(
      '/pipelines/health'
    );
    return res.data;
  },
  run: async (data: {
    environment_id: string;
    algorithm: string;
    total_timesteps: number;
    experiment_name?: string;
  }): Promise<PipelineRun> => {
    const res = await apiClient.post<PipelineRun>('/pipelines/run', data);
    return res.data;
  },
  search: async (data: {
    environment_id: string;
    algorithm: string;
    total_timesteps: number;
  }): Promise<PipelineRun> => {
    const res = await apiClient.post<PipelineRun>('/pipelines/search', data);
    return res.data;
  },
  list: async (): Promise<PipelineRun[]> => {
    const res = await apiClient.get('/pipelines/');
    return getItems<PipelineRun>(res.data);
  },
  get: async (id: string): Promise<PipelineRun> => {
    const res = await apiClient.get<PipelineRun>(`/pipelines/${id}`);
    return res.data;
  },
};
