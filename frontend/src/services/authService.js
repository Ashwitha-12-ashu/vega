import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.tokens) {
      localStorage.setItem('vega_access_token', response.data.tokens.access);
      localStorage.setItem('vega_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('vega_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.tokens) {
      localStorage.setItem('vega_access_token', response.data.tokens.access);
      localStorage.setItem('vega_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('vega_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    const refresh = localStorage.getItem('vega_refresh_token');
    try {
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.warn('Logout endpoint error:', e);
    } finally {
      localStorage.removeItem('vega_access_token');
      localStorage.removeItem('vega_refresh_token');
      localStorage.removeItem('vega_user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    localStorage.setItem('vega_user', JSON.stringify(response.data));
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/verify-otp/', { email, otp });
    return response.data;
  },

  async resetPassword({ email, otp, password, confirm_password }) {
    const response = await api.post('/auth/reset-password/', {
      email,
      otp,
      password,
      confirm_password,
    });
    if (response.data.tokens) {
      localStorage.setItem('vega_access_token', response.data.tokens.access);
      localStorage.setItem('vega_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('vega_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

