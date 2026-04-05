import { apiClient, getItems } from './client';
import type { MultiAgentExperiment, AgentPolicy } from '../types';

export const multiAgentApi = {
  environments: async (): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>('/multi-agent/environments');
    return Array.isArray(res.data) ? res.data : [];
  },
  train: async (data: { environment_id: string; algorithms: Record<string, string>; n_agents: number; total_timesteps: number }): Promise<MultiAgentExperiment> => {
    const res = await apiClient.post<MultiAgentExperiment>('/multi-agent/train', data);
    return res.data;
  },
  list: async (): Promise<MultiAgentExperiment[]> => {
    const res = await apiClient.get('/multi-agent/experiments');
    return getItems<MultiAgentExperiment>(res.data);
  },
  get: async (id: number): Promise<MultiAgentExperiment> => {
    const res = await apiClient.get<MultiAgentExperiment>(`/multi-agent/experiments/${id}`);
    return res.data;
  },
  agents: async (id: number): Promise<AgentPolicy[]> => {
    const res = await apiClient.get<AgentPolicy[]>(`/multi-agent/experiments/${id}/agents`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
