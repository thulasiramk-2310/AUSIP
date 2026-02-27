import axios from 'axios';
import { AnalysisResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeQuestion = async (question: string): Promise<AnalysisResponse> => {
  const response = await api.post<AnalysisResponse>('/ask', { question });
  return response.data;
};

export default api;
