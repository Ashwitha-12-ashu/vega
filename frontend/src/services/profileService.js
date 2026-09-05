import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/profile/', profileData);
    return response.data;
  },

  async enableProvider(enable = true) {
    const response = await api.post('/profile/provider/enable/', { enable });
    return response.data;
  },

  async goOnline() {
    const response = await api.post('/provider/go-online/');
    return response.data;
  },

  async goOffline() {
    const response = await api.post('/provider/go-offline/');
    return response.data;
  },

  async getPublicProvider(providerId) {
    const response = await api.get(`/providers/${providerId}/`);
    return response.data;
  },
};
