import axios from 'axios';
import { usersAPI } from './users'; // Import usersAPI for refreshToken

const api = axios.create({
  baseURL: 'http://localhost:8686/api/v1', // Assuming the backend runs on port 8080
});

// To avoid circular dependency with AuthContext, we'll store auth functions here.
let authService: { login: (accessToken: string, refreshToken: string) => Promise<void>; logout: () => void } | null = null;

export const setAuthService = (service: { login: (accessToken: string, refreshToken: string) => Promise<void>; logout: () => void }) => {
  authService = service;
};

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error status is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken && authService) {
        try {
          const newTokens = await usersAPI.refreshToken(refreshToken);
          localStorage.setItem('accessToken', newTokens.accessToken);
          localStorage.setItem('refreshToken', newTokens.refreshToken);
          
          // Update the Authorization header for the original request
          api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authService.logout(); // Logout user on refresh failure
          return Promise.reject(refreshError);
        }
      } else if (authService) {
        authService.logout(); // No refresh token available, logout
      }
    }
    return Promise.reject(error);
  }
);

export default api;
