export const SLOT_STATUSES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked',
};

export const BOOKING_STATUSES = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  expired: 'bg-red-100 text-red-600 border-red-200',
};

export const STATUS_ICONS = {
  confirmed: '✓',
  pending: '⏳',
  cancelled: '✕',
  expired: '⏰',
};

export const SLOT_STATUS_CONFIG = {
  available: {
    bg: 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer active:scale-95',
    dot: 'bg-green-500',
    text: 'text-green-800',
    label: 'Available',
    labelColor: 'text-green-600',
  },
  reserved: {
    bg: 'bg-yellow-50 border-yellow-200 cursor-not-allowed',
    dot: 'bg-yellow-500 animate-pulse',
    text: 'text-yellow-800',
    label: 'Reserved',
    labelColor: 'text-yellow-600',
  },
  booked: {
    bg: 'bg-red-50 border-red-200 cursor-not-allowed',
    dot: 'bg-red-500',
    text: 'text-red-800',
    label: 'Booked',
    labelColor: 'text-red-600',
  },
  past: {
    bg: 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60',
    dot: 'bg-gray-400',
    text: 'text-gray-400',
    label: 'Passed',
    labelColor: 'text-gray-400',
  },
};

export const PITCH_ICONS = ['🏟️', '🏏', '🎯', '🌿', '🏙️', '🌙', '🏛️', '⭐', '🏆', '⚡'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PITCHES: '/pitches',
  BOOK_PITCH: (pitchId) => `/pitches/${pitchId}/book`,
  MY_BOOKINGS: '/my-bookings',
  BOOKING_SUCCESS: (bookingId) => `/booking-success/${bookingId}`,
};

export const CANCELLABLE_STATUSES = [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.PENDING];

export const RESERVATION_TTL_SECONDS = 120;

export const TOAST_DURATION_MS = 4000;
export const COPY_FEEDBACK_MS = 2500;
