import { describe, it, expect } from 'vitest';
import { apiClient } from '../../api/client';

describe('apiClient', () => {
  it('has correct base URL', () => {
    expect(apiClient.defaults.baseURL).toContain('/api/v1');
  });

  it('has JSON Content-Type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('has request interceptor for auth token', () => {
    // Axios interceptors are stored in the interceptors.request.handlers array
    const handlers = (apiClient.interceptors.request as unknown as { handlers: unknown[] })
      .handlers;
    expect(handlers.length).toBeGreaterThan(0);
  });

  it('has response interceptor for 401 handling', () => {
    const handlers = (apiClient.interceptors.response as unknown as { handlers: unknown[] })
      .handlers;
    expect(handlers.length).toBeGreaterThan(0);
  });
});
