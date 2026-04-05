import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';
import type { VideoStatus } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

export const videoApi = {
  record: async (data: {
    environment_id: string;
    algorithm: string;
    num_episodes: number;
    max_steps: number;
    fps: number;
  }): Promise<VideoStatus> => {
    const res = await apiClient.post<VideoStatus>('/video/record', data);
    return res.data;
  },

  getStatus: async (videoId: string): Promise<VideoStatus> => {
    const res = await apiClient.get<VideoStatus>(`/video/${videoId}/status`);
    return res.data;
  },

  list: async (): Promise<VideoStatus[]> => {
    const res = await apiClient.get<VideoStatus[]>('/video/');
    return Array.isArray(res.data) ? res.data : [];
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/video/${videoId}`);
  },

  getDownloadUrl: async (videoId: string): Promise<string> => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_BASE_URL}/video/${videoId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to download video');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
