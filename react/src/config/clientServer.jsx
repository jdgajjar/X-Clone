import axios from "axios";

// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Production environment - use env or hardcoded backend URL
    return import.meta.env.VITE_API_URL || 'https://x-clone-1-d23n.onrender.com';
  } else {
    // Development environment - use our sandbox backend URL
    return import.meta.env.VITE_API_URL || 'https://3000-i8l8b86etqb6ib61qryxc-6532622b.e2b.dev';
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
  withCredentials: true, // ✅ Enable for session-based authentication
  timeout: 45000,
  headers: {
    'Accept': 'application/json'
    // Don't set Content-Type here - let axios handle it based on data type
  }
});

// Request interceptor to handle Content-Type (using session-based auth)
clientServer.interceptors.request.use((config) => {
  // Set Content-Type based on data type
  if (config.data instanceof FormData) {
    // For FormData (file uploads), let the browser set Content-Type with boundary
    delete config.headers['Content-Type'];
  } else {
    // For JSON data, explicitly set Content-Type
    config.headers['Content-Type'] = 'application/json';
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
      // Session-based auth - redirect to login
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
