import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../../api/auth';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  getItems: vi.fn((data: unknown) => data),
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login sends x-www-form-urlencoded Content-Type', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { access_token: 'test-token', token_type: 'bearer' },
    });

    await authApi.login({ username: 'user', password: 'pass' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', expect.any(URLSearchParams), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const body = vi.mocked(apiClient.post).mock.calls[0][1] as URLSearchParams;
    expect(body.get('username')).toBe('user');
    expect(body.get('password')).toBe('pass');
  });

  it('register sends JSON body', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 1, username: 'user', email: 'u@e.com', is_active: true, created_at: '' },
    });

    await authApi.register({ username: 'user', email: 'u@e.com', password: 'pass' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      username: 'user',
      email: 'u@e.com',
      password: 'pass',
    });
  });

  it('logout calls POST /auth/logout', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await authApi.logout();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });
});
