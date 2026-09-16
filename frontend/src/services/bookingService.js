import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },

  async getBookings({ role = 'all', status = '' } = {}) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    const response = await api.get(`/bookings/?${params.toString()}`);
    return response.data;
  },

  async getBookingDetail(id) {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  async updateBookingStatus(id, status) {
    const response = await api.patch(`/bookings/${id}/status/`, { status });
    return response.data;
  },

  async updateTrackingLocation(id, { latitude, longitude }) {
    const response = await api.patch(`/bookings/${id}/location/`, { latitude, longitude });
    return response.data;
  },

  async getBookingTracking(id) {
    const response = await api.get(`/bookings/${id}/tracking/`);
    return response.data;
  },
};

