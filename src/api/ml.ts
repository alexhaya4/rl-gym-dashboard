import { apiClient, getItems } from './client';
import type {
  MLTrainRequest,
  MLTrainResponse,
  MLPredictRequest,
  MLPredictResponse,
  MLModelInfo,
} from '../types';

export const mlApi = {
  getAlgorithms: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<Record<string, string[]>>('/ml/algorithms');
    return res.data;
  },

  train: async (data: MLTrainRequest): Promise<MLTrainResponse> => {
    const res = await apiClient.post<MLTrainResponse>('/ml/train', data);
    return res.data;
  },

  predict: async (data: MLPredictRequest): Promise<MLPredictResponse> => {
    const res = await apiClient.post<MLPredictResponse>('/ml/predict', data);
    return res.data;
  },

  listModels: async (page = 1): Promise<MLModelInfo[]> => {
    const res = await apiClient.get('/ml/models', { params: { page } });
    return getItems<MLModelInfo>(res.data);
  },

  getModel: async (id: number): Promise<MLModelInfo> => {
    const res = await apiClient.get<MLModelInfo>(`/ml/models/${id}`);
    return res.data;
  },

  deleteModel: async (id: number): Promise<void> => {
    await apiClient.delete(`/ml/models/${id}`);
  },
};
