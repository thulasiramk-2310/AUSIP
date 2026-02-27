import axiosInstance from './axios';
import { ApiResponse, AskRequest } from '../types/api';

export async function askQuestion(question: string): Promise<ApiResponse> {
  try {
    const payload: AskRequest = { question };
    const { data } = await axiosInstance.post<ApiResponse>('/ask', payload);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to process question');
  }
}
