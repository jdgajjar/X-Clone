import axios from "axios";

// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Production environment - use env or hardcoded backend URL
    return import.meta.env.VITE_API_URL || 'https://x-clone-1-d23n.onrender.com';
  } else {
    // Development environment
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
};

const BASE_URL = getApiUrl();

// Log configuration for debugging
if (import.meta.env.DEV) {
  console.log('Frontend API Configuration:', {
    baseURL: BASE_URL,
    environment: import.meta.env.PROD ? 'production' : 'development',
    viteApiUrl: import.meta.env.VITE_API_URL
  });
}

const clientServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // ✅ not needed unless using cookies
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add authentication header
clientServer.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ✅ consistent key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for enhanced error handling
clientServer.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // ✅ use same key as request interceptor
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('Redirecting to login due to 401 error');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error - check if backend is running:', error.message);
    }

    return Promise.reject(error);
  }
);

export { clientServer };
