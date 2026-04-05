import { apiClient, getItems } from './client';
import type { ABTest, ABTestCreate, ABTestStatistics, ABTestResultResponse } from '../types';

export const abTestingApi = {
  create: async (data: ABTestCreate): Promise<ABTest> => {
    const res = await apiClient.post<ABTest>('/ab-testing/', data);
    return res.data;
  },

  list: async (): Promise<ABTest[]> => {
    const res = await apiClient.get('/ab-testing/');
    return getItems<ABTest>(res.data);
  },

  get: async (testId: number): Promise<ABTest> => {
    const res = await apiClient.get<ABTest>(`/ab-testing/${testId}`);
    return res.data;
  },

  run: async (testId: number): Promise<ABTest> => {
    const res = await apiClient.post<ABTest>(`/ab-testing/${testId}/run`);
    return res.data;
  },

  stop: async (testId: number): Promise<ABTest> => {
    const res = await apiClient.post<ABTest>(`/ab-testing/${testId}/stop`);
    return res.data;
  },

  results: async (testId: number, page = 1, pageSize = 100): Promise<ABTestResultResponse[]> => {
    const res = await apiClient.get(`/ab-testing/${testId}/results`, {
      params: { page, page_size: pageSize },
    });
    return getItems<ABTestResultResponse>(res.data);
  },

  statistics: async (testId: number): Promise<ABTestStatistics> => {
    const res = await apiClient.get<ABTestStatistics>(`/ab-testing/${testId}/statistics`);
    return res.data;
  },
};
