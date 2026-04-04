import { apiClient } from './client';
import type {
  DistributedTrainRequest,
  DistributedTrainResponse,
  DistributedStatus,
} from '../types';

export const distributedApi = {
  train: async (data: DistributedTrainRequest): Promise<DistributedTrainResponse> => {
    const res = await apiClient.post<DistributedTrainResponse>('/distributed/train', data);
    return res.data;
  },

  getStatus: async (jobId: string): Promise<DistributedStatus> => {
    const res = await apiClient.get<DistributedStatus>(`/distributed/${jobId}/status`);
    return res.data;
  },

  cancel: async (jobId: string): Promise<void> => {
    await apiClient.post(`/distributed/${jobId}/cancel`);
  },

  listJobs: async (): Promise<DistributedStatus[]> => {
    const res = await apiClient.get<DistributedStatus[]>('/distributed/jobs');
    return Array.isArray(res.data) ? res.data : [];
  },

  getCluster: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/distributed/cluster');
    return res.data;
  },
};
