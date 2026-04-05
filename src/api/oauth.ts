import { apiClient } from './client';

export const oauthApi = {
  googleLogin: async (): Promise<{ authorization_url: string; state: string }> => {
    const res = await apiClient.get<{ authorization_url: string; state: string }>('/oauth/google/login');
    return res.data;
  },
  googleCallback: async (code: string, state: string): Promise<{ access_token: string; token_type: string }> => {
    const res = await apiClient.get<{ access_token: string; token_type: string }>('/oauth/google/callback', {
      params: { code, state },
    });
    return res.data;
  },
  githubLogin: async (): Promise<{ authorization_url: string; state: string }> => {
    const res = await apiClient.get<{ authorization_url: string; state: string }>('/oauth/github/login');
    return res.data;
  },
  githubCallback: async (code: string, state: string): Promise<{ access_token: string; token_type: string }> => {
    const res = await apiClient.get<{ access_token: string; token_type: string }>('/oauth/github/callback', {
      params: { code, state },
    });
    return res.data;
  },
  accounts: async (): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get<Record<string, unknown>[]>('/oauth/accounts');
    return Array.isArray(res.data) ? res.data : [];
  },
  deleteAccount: async (provider: string): Promise<void> => {
    await apiClient.delete(`/oauth/accounts/${provider}`);
  },
};
