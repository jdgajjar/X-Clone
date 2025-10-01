import axios from "axios";

// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Production environment
    return import.meta.env.VITE_API_URL || 'https://your-backend-app-name.onrender.com';
  } else {
    // Development environment
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
};

const BASE_URL = getApiUrl();

const clientServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add authentication header if needed
clientServer.interceptors.request.use(
  (config) => {
    // Add any auth tokens if stored locally
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
clientServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored auth data on 401
      localStorage.removeItem('authToken');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { clientServer };

