import api from './api';

export const providerService = {
  async getNearbyProviders(params) {
    const res = await api.get('/providers/nearby/', { params });
    return res.data;
  },
  async getProvider(id) {
    const res = await api.get(`/providers/${id}/`);
    return res.data;
  },
};

export default providerService;
