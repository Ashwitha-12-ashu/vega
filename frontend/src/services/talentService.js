import api from './api';

export const talentService = {
  async getCategories() {
    const response = await api.get('/categories/');
    return response.data;
  },

  async getMyTalents() {
    const response = await api.get('/talents/');
    return response.data;
  },

  async getTalent(id) {
    const response = await api.get(`/talents/${id}/`);
    return response.data;
  },

  async createTalent(talentData) {
    const response = await api.post('/talents/', talentData);
    return response.data;
  },

  async updateTalent(id, talentData) {
    const response = await api.patch(`/talents/${id}/`, talentData);
    return response.data;
  },

  async deleteTalent(id) {
    const response = await api.delete(`/talents/${id}/`);
    return response.data;
  },

  async activateTalent(id) {
    const response = await api.post(`/talents/${id}/activate/`);
    return response.data;
  },

  async deactivateTalent(id) {
    const response = await api.post(`/talents/${id}/deactivate/`);
    return response.data;
  },
};
