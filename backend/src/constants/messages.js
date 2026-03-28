const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'An account with this email already exists.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    LOGGED_OUT: 'Logged out successfully.',
  },
  BOOKING: {
    SLOT_HELD: (ttl) =>
      `Slot is temporarily held by another user. It will be available in ${ttl} seconds.`,
    RESERVATION_EXPIRED: 'Your 2-minute reservation has expired. Please select the slot again.',
    SLOT_HELD_OTHER: 'This slot is currently held by another user.',
    ALREADY_BOOKED: 'This slot has already been booked.',
    NOT_FOUND: 'Booking not found.',
    CANNOT_CANCEL: 'Only confirmed or pending bookings can be cancelled.',
    NOT_OWNER: 'You are not authorized to cancel this booking.',
    CANCELLED: 'Booking cancelled successfully.',
  },
  RESERVATION: {
    SERVICE_UNAVAILABLE: 'Reservation service unavailable (Redis offline).',
  },
};

module.exports = MESSAGES;
