import { apiClient } from './client';
import type { BillingPlan, BillingSubscription } from '../types';

export const billingApi = {
  plans: async (): Promise<BillingPlan[]> => {
    const res = await apiClient.get<BillingPlan[]>('/billing/plans');
    return Array.isArray(res.data) ? res.data : [];
  },
  subscription: async (orgId: number): Promise<BillingSubscription> => {
    const res = await apiClient.get<BillingSubscription>(`/billing/subscription/${orgId}`);
    return res.data;
  },
  checkout: async (data: { org_id: number; plan: string; success_url: string; cancel_url: string }): Promise<{ checkout_url: string }> => {
    const res = await apiClient.post<{ checkout_url: string }>('/billing/checkout', data);
    return res.data;
  },
  cancel: async (orgId: number): Promise<BillingSubscription> => {
    const res = await apiClient.post<BillingSubscription>(`/billing/cancel/${orgId}`);
    return res.data;
  },
};
