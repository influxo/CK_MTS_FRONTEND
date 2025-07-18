import axios from 'axios';
import getApiUrl from './apiUrl';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other storage mechanism
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // You can modify the response data here before it's passed to the caller
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // You can implement token refresh logic here
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await refreshTokenAPI(refreshToken);
        // localStorage.setItem('token', response.data.token);
        
        // Retry the original request with new token
        // originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
        // return axiosInstance(originalRequest);
        
        // For now, just log out the user on auth errors
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (refreshError) {
        // If refresh token fails, log out the user
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    // You can implement global error handling here
    // e.g., show toast notifications for network errors
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
