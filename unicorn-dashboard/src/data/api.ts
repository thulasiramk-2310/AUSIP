import axios from 'axios';
import type { AiResponse } from '../types';
import { mockAiResponse } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function askQuestion(question: string): Promise<AiResponse> {
    try {
        const response = await axios.post<AiResponse>(`${API_BASE}/ask`, { question });
        return response.data;
    } catch {
        // Fallback to mock data in dev
        console.warn('API unavailable — using mock data');
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockAiResponse), 1500);
        });
    }
}
