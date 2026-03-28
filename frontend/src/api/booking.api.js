import api from './axios';

export const reserveSlot = (data) => api.post('/bookings/reserve-slot', data);
export const confirmBooking = (data) => api.post('/bookings/confirm-booking', data);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
