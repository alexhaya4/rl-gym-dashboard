import { apiClient } from './client';
import type { TrainingSession, TrainingStart, TrainingJob, TrainingResult } from '../types';

export const trainingApi = {
  start: async (data: TrainingStart): Promise<TrainingSession> => {
    const res = await apiClient.post<TrainingSession>('/training/', data);
    return res.data;
  },

  list: async (): Promise<TrainingSession[]> => {
    const res = await apiClient.get<TrainingSession[]>('/training/');
    return Array.isArray(res.data) ? res.data : [];
  },

  get: async (experimentId: number): Promise<TrainingSession> => {
    const res = await apiClient.get<TrainingSession>(`/training/${experimentId}`);
    return res.data;
  },

  job: async (experimentId: number): Promise<TrainingJob> => {
    const res = await apiClient.get<TrainingJob>(`/training/${experimentId}/job`);
    return res.data;
  },

  result: async (experimentId: number): Promise<TrainingResult> => {
    const res = await apiClient.get<TrainingResult>(`/training/${experimentId}/result`);
    return res.data;
  },
};
