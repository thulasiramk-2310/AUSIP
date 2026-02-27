import axios from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  fullName?: string;
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getMe(token: string): Promise<User> {
    const response = await axios.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Token management
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
    // Token will be automatically added to requests by axios interceptor
    console.log('🔐 Token saved to localStorage');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  removeToken() {
    localStorage.removeItem('auth_token');
    console.log('🔐 Token removed from localStorage');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
