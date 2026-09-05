import api from './api';

export const locationService = {
  async updateLocation(locationData) {
    const response = await api.post('/location/', locationData);
    return response.data;
  },

  async getMyLocation() {
    const response = await api.get('/location/me/');
    return response.data;
  },

  async getNearbyProviders({ lat, lng, radius = 5, category = '', search = '', min_rating = '' }) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (radius) params.append('radius', radius);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (min_rating) params.append('min_rating', min_rating);

    const response = await api.get(`/providers/nearby/?${params.toString()}`);
    return response.data;
  },
};
