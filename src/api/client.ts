import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Extract items array from paginated {items, total} or plain array responses. */
export function getItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data)
    return (data as { items: T[] }).items ?? [];
  return [];
}

export const getWsUrl = (path: string) => {
  const token = useAuthStore.getState().token;
  const wsBase = API_BASE_URL.replace(/^http/, 'ws');
  return `${wsBase}${path}${token ? `?token=${token}` : ''}`;
};
