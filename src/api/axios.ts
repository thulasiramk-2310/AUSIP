import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('🔧 API Configuration:', {
  baseURL: API_URL,
  env: import.meta.env.VITE_API_BASE_URL,
  mode: import.meta.env.MODE
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically add token from localStorage to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to headers if it exists
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url, token ? '(with token)' : '(no token)');
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    // If 401 Unauthorized and token exists, it means token is invalid/expired
    if (error.response?.status === 401) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Token is invalid or expired, remove it
        console.log('🔐 Token expired or invalid, removing token');
        localStorage.removeItem('auth_token');
        // Redirect to login (the AuthContext will handle this)
        window.location.reload();
      }
    }
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('Network error - unable to reach server');
    } else {
      throw new Error('Request failed');
    }
  }
);

export default axiosInstance;
