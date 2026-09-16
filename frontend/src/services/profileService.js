import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const isFormData = profileData instanceof FormData;
    const response = await api.patch('/profile/', profileData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async removeProfilePhoto() {
    const response = await api.patch('/profile/', { remove_photo: true });
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
