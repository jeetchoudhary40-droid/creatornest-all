import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for automatic token refresh and consistent error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // In mock mode, we won't get actual 401s unless we mock them, but keep the handler for completeness
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', errorMessage);
    return Promise.reject(error);
  }
);

