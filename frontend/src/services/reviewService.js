import api from './api';

export const reviewService = {
  async createReview({ booking_id, rating, comment }) {
    const response = await api.post('/reviews/', { booking_id, rating, comment });
    return response.data;
  },

  async getProviderReviews(providerId) {
    const response = await api.get(`/providers/${providerId}/reviews/`);
    return response.data;
  },
};
