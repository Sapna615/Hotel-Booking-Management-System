import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error messages & handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    if (error.response?.status === 401) {
      // If unauthorized on protected route, clean stale token
      if (window.location.pathname.startsWith('/guest') ||
          window.location.pathname.startsWith('/staff') ||
          window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('hb_token');
        localStorage.removeItem('hb_user');
      }
    }

    const enhancedError = new Error(message);
    enhancedError.statusCode = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.code = error.response?.data?.code;
    return Promise.reject(enhancedError);
  }
);

export default api;
