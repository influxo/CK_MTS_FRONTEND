import axios from "axios";
import getApiUrl from "./apiUrl";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other storage mechanism
    const token = localStorage.getItem("token");

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
    const originalRequest = error.config || {};

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // IMPORTANT: Do not remove token or hard-redirect here to avoid reload loops.
      // Let the app's auth flow (ReduxProvider + ProtectedRoute) decide what to do.
    }

    // Handle other errors globally if desired
    return Promise.reject(error);
  }
);

export default axiosInstance;
