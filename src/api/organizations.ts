import { apiClient, getItems } from './client';
import type { Organization } from '../types';

export const organizationsApi = {
  create: async (data: { name: string; slug: string }): Promise<Organization> => {
    const res = await apiClient.post<Organization>('/organizations', data);
    return res.data;
  },
  list: async (): Promise<Organization[]> => {
    const res = await apiClient.get('/organizations');
    return getItems<Organization>(res.data);
  },
  get: async (id: number): Promise<Organization> => {
    const res = await apiClient.get<Organization>(`/organizations/${id}`);
    return res.data;
  },
  addMember: async (
    orgId: number,
    data: { user_id: number; role: string }
  ): Promise<Record<string, unknown>> => {
    const res = await apiClient.post<Record<string, unknown>>(
      `/organizations/${orgId}/members`,
      data
    );
    return res.data;
  },
  removeMember: async (orgId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/members/${userId}`);
  },
  usage: async (orgId: number): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>(`/organizations/${orgId}/usage`);
    return res.data;
  },
};
