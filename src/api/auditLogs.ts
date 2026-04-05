import { apiClient, getItems } from './client';
import type { AuditLog } from '../types';

export const auditLogsApi = {
  list: async (params?: {
    event_type?: string;
    action?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<AuditLog[]> => {
    const res = await apiClient.get('/audit/logs', { params });
    return getItems<AuditLog>(res.data);
  },
  me: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/audit/logs/me');
    return Array.isArray(res.data) ? res.data : [];
  },
  get: async (id: number): Promise<AuditLog> => {
    const res = await apiClient.get<AuditLog>(`/audit/logs/${id}`);
    return res.data;
  },
};
