import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vega_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency control for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Handle expired tokens & token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    // Do not attempt refresh on auth endpoints themselves
    const isAuthEndpoint =
      url.includes('auth/login') ||
      url.includes('auth/register') ||
      url.includes('auth/token/refresh') ||
      url.includes('auth/logout') ||
      url.includes('auth/forgot-password') ||
      url.includes('auth/verify-otp') ||
      url.includes('auth/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('vega_refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('vega_access_token');
        localStorage.removeItem('vega_refresh_token');
        localStorage.removeItem('vega_user');
        window.dispatchEvent(new Event('vega_session_expired'));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshEndpoint = `${API_BASE_URL}/auth/token/refresh/`;
        const res = await axios.post(refreshEndpoint, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('vega_access_token', newAccessToken);

        // SimpleJWT token rotation support: save new rotated refresh token if returned
        if (res.data.refresh) {
          localStorage.setItem('vega_refresh_token', res.data.refresh);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('vega_access_token');
        localStorage.removeItem('vega_refresh_token');
        localStorage.removeItem('vega_user');
        window.dispatchEvent(new Event('vega_session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
