import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      url = 'https://hotel-booking-management-system-backend-nak7.onrender.com/api';
    } else {
      return '/api';
    }
  }
  // Remove trailing slashes
  url = url.trim().replace(/\/+$/, '');
  // If user provided base domain without /api, append /api
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
      if (
        window.location.pathname.startsWith('/guest') ||
        window.location.pathname.startsWith('/staff') ||
        window.location.pathname.startsWith('/admin')
      ) {
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
