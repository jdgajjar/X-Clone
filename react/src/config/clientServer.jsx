import axios from "axios";

// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Production environment - try multiple fallbacks
    return import.meta.env.VITE_API_URL || 
           'https://x-clone-backend.onrender.com' ||
           'https://your-backend-app-name.onrender.com';
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
  withCredentials: true,
  timeout: 45000, // Extended timeout for production (Render can be slow on cold starts)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

// Response interceptor for enhanced error handling
clientServer.interceptors.response.use(
  (response) => {
    // Log successful responses in development
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
    // Enhanced error logging for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Clear any stored auth data on 401
      localStorage.removeItem('authToken');
      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('Redirecting to login due to 401 error');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status);
      // Could show a toast notification here in production
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error - check if backend is running:', error.message);
      // Could show offline indicator here
    }

    return Promise.reject(error);
  }
);

export { clientServer };

