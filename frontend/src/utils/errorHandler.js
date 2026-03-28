import { MESSAGES } from '../constants/messages';

// API error handler with specific error types
export const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error);
  
  // Handle different types of errors
  if (error.response?.status === 401) {
    return 'Invalid email or password. Please try again.';
  } else if (error.response?.status === 409) {
    return 'Email already exists. Please use a different email or try logging in.';
  } else if (error.response?.status === 429) {
    return 'Too many requests. Please try again later.';
  } else if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.';
  } else if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection.';
  } else {
    return error.response?.data?.message || defaultMessage;
  }
};

// Booking specific error handler
export const handleBookingError = (error) => {
  return handleApiError(error, MESSAGES.BOOKING.SLOT_RESERVE_ERROR);
};

// Auth specific error handler
export const handleAuthError = (error) => {
  return handleApiError(error, MESSAGES.AUTH.LOGIN_ERROR);
};
