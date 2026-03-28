import { useState, useEffect } from 'react';
import { getMyBookings } from '../api/booking.api';
import Spinner from '../components/Spinner';
import BookingDetailModal from '../components/BookingDetailModal';
import { formatSlotRange, formatDate } from '../utils/formatTime';
import { STATUS_STYLES, STATUS_ICONS, ROUTES, TOAST_DURATION_MS } from '../constants';
import { MESSAGES } from '../constants/messages';

// Helper function to check if booking is passed or upcoming
const getBookingTimeStatus = (bookingDate, startTime) => {
  const bookingDateTime = new Date(`${bookingDate} ${startTime}`);
  const now = new Date();
  const isPassed = bookingDateTime < now;
  
  if (isPassed) {
    return {
      isPassed: true,
      badge: {
        text: 'Passed',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: '✓'
      }
    };
  } else {
    const timeDiff = bookingDateTime - now;
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysDiff = Math.floor(hoursDiff / 24);
    
    let badgeText = 'Upcoming';
    let badgeIcon = '🔜';
    
    if (daysDiff === 0 && hoursDiff <= 24) {
      if (hoursDiff <= 2) {
        badgeText = 'Today';
        badgeIcon = '📅';
      } else {
        badgeText = 'Today';
        badgeIcon = '⏰';
      }
    } else if (daysDiff === 1) {
      badgeText = 'Tomorrow';
      badgeIcon = '🗓️';
    } else if (daysDiff <= 7) {
      badgeText = `In ${daysDiff} days`;
      badgeIcon = '📆';
    }
    
    return {
      isPassed: false,
      badge: {
        text: badgeText,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: badgeIcon
      }
    };
  }
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'cancelled', or 'completed'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.data.bookings);
      } catch {
        setError(MESSAGES.BOOKING.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelled = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)),
    );
    setSelectedBooking(null);
    showToast(MESSAGES.BOOKING.CANCEL_SUCCESS);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg animate-slide-up text-sm font-medium ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-1">✕</button>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
            📋
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Your cricket pitch booking history</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text={MESSAGES.UI.LOADING_BOOKINGS} />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-6xl mb-4">🏏</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{MESSAGES.UI.NO_BOOKINGS_TITLE}</h3>
          <p className="text-gray-500 mb-6">{MESSAGES.UI.NO_BOOKINGS_DESC}</p>
          <a
            href={ROUTES.PITCHES}
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            {MESSAGES.UI.BROWSE_PITCHES}
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Separate bookings into upcoming, cancelled, and completed */}
          {(() => {
            const upcomingBookings = bookings.filter(booking => 
              !getBookingTimeStatus(booking.bookingDate, booking.slot?.startTime).isPassed && 
              booking.status !== 'cancelled'
            );
            const cancelledBookings = bookings.filter(booking => 
              booking.status === 'cancelled'
            );
            const completedBookings = bookings.filter(booking => 
              getBookingTimeStatus(booking.bookingDate, booking.slot?.startTime).isPassed && 
              booking.status !== 'cancelled'
            );

            return (
              <>
                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'upcoming'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">🔜</span>
                      <span className="hidden sm:inline">Upcoming</span>
                      <span className="sm:hidden">🔜</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {upcomingBookings.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('cancelled')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">❌</span>
                      <span className="hidden sm:inline">Cancelled</span>
                      <span className="sm:hidden">❌</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cancelledBookings.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'completed'
                          ? 'bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">✓</span>
                      <span className="hidden sm:inline">Completed</span>
                      <span className="sm:hidden">✓</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'completed' 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {completedBookings.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                  {/* Upcoming Bookings Panel */}
                  {activeTab === 'upcoming' && (
                    <div className="animate-fade-in">
                      {upcomingBookings.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {upcomingBookings.map((booking) => {
                            const timeStatus = getBookingTimeStatus(booking.bookingDate, booking.slot?.startTime);
                            const isPassed = timeStatus.isPassed;
                            
                            return (
                              <div
                                key={booking.id}
                                className={`group relative p-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-green-50/30 transition-all duration-300 ${
                                  isPassed ? 'opacity-75' : ''
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={`relative flex-shrink-0 ${
                                    isPassed ? 'opacity-60' : ''
                                  }`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                                      isPassed 
                                        ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                                        : 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600'
                                    }`}>
                                      🏏
                                    </div>
                                    {!isPassed && (
                                      <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <h3 className={`text-xl font-bold leading-tight mb-1 ${
                                          isPassed ? 'text-gray-600' : 'text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-700 group-hover:to-emerald-700 group-hover:bg-clip-text transition-all duration-300'
                                        }`}>
                                          {booking.pitch?.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className={`w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isPassed 
                                              ? 'bg-gray-300' 
                                              : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                          }`}>
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <p className={`text-sm font-medium ${
                                            isPassed ? 'text-gray-500' : 'text-gray-600'
                                          }`}>
                                            {booking.pitch?.location}
                                          </p>
                                        </div>

                                        {/* Booking details in row with badges */}
                                        <div className="space-y-3">
                                          <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">📅</span>
                                              <span className={`text-sm font-semibold ${
                                                isPassed ? 'text-gray-600' : 'text-gray-900'
                                              }`}>{formatDate(booking.bookingDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">🕐</span>
                                              <span className={`text-sm font-semibold ${
                                                isPassed ? 'text-gray-600' : 'text-gray-900'
                                              }`}>
                                                {booking.slot
                                                  ? formatSlotRange(booking.slot.startTime, booking.slot.endTime)
                                                  : '—'}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">💰</span>
                                              <span className={`text-sm font-bold ${
                                                isPassed ? 'text-gray-600' : 'text-green-700'
                                              }`}>
                                                ₹{Number(booking.pitch?.pricePerHour).toLocaleString('en-IN')}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {/* Badges row */}
                                          <div className="flex flex-wrap gap-2">
                                            {/* Time-based badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${timeStatus.badge.className}`}>
                                              <span>{timeStatus.badge.icon}</span>
                                              <span>{timeStatus.badge.text}</span>
                                            </span>
                                            
                                            {/* Status badge */}
                                            <span
                                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                STATUS_STYLES[booking.status] || STATUS_STYLES.pending
                                              } ${isPassed ? 'opacity-60' : ''}`}
                                            >
                                              <span>{STATUS_ICONS[booking.status]}</span>
                                              <span className="capitalize">{booking.status}</span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action button */}
                                      <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                                          isPassed
                                            ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                            : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-emerald-100 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95'
                                        }`}
                                      >
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">🔜</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Bookings</h3>
                          <p className="text-gray-500 mb-6">You don't have any scheduled cricket pitch bookings</p>
                          <a
                            href={ROUTES.PITCHES}
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            Book a Pitch
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancelled Bookings Panel */}
                  {activeTab === 'cancelled' && (
                    <div className="animate-fade-in">
                      {cancelledBookings.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {cancelledBookings.map((booking) => {
                            const timeStatus = getBookingTimeStatus(booking.bookingDate, booking.slot?.startTime);
                            const isPassed = timeStatus.isPassed;
                            
                            return (
                              <div
                                key={booking.id}
                                className={`group relative p-6 hover:bg-red-50/50 transition-all duration-300 opacity-75`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="relative flex-shrink-0 opacity-60">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br from-red-300 to-red-400">
                                      🏏
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="text-xl font-bold leading-tight mb-1 text-gray-600">
                                          {booking.pitch?.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-300">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <p className="text-sm font-medium text-gray-500">
                                            {booking.pitch?.location}
                                          </p>
                                        </div>

                                        {/* Booking details in row with badges */}
                                        <div className="space-y-3">
                                          <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">📅</span>
                                              <span className="text-sm font-semibold text-gray-600">{formatDate(booking.bookingDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">🕐</span>
                                              <span className="text-sm font-semibold text-gray-600">
                                                {booking.slot
                                                  ? formatSlotRange(booking.slot.startTime, booking.slot.endTime)
                                                  : '—'}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">💰</span>
                                              <span className="text-sm font-bold text-gray-600">
                                                ₹{Number(booking.pitch?.pricePerHour).toLocaleString('en-IN')}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {/* Badges row */}
                                          <div className="flex flex-wrap gap-2">
                                            {/* Time-based badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${timeStatus.badge.className}`}>
                                              <span>{timeStatus.badge.icon}</span>
                                              <span>{timeStatus.badge.text}</span>
                                            </span>
                                            
                                            {/* Status badge */}
                                            <span
                                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                STATUS_STYLES[booking.status] || STATUS_STYLES.pending
                                              } opacity-60`}
                                            >
                                              <span>{STATUS_ICONS[booking.status]}</span>
                                              <span className="capitalize">{booking.status}</span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action button */}
                                      <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                      >
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">❌</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Cancelled Bookings</h3>
                          <p className="text-gray-500 mb-6">You haven't cancelled any cricket pitch bookings</p>
                          <a
                            href={ROUTES.PITCHES}
                            className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Book a Pitch
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Bookings Panel */}
                  {activeTab === 'completed' && (
                    <div className="animate-fade-in">
                      {completedBookings.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {completedBookings.map((booking) => {
                            const timeStatus = getBookingTimeStatus(booking.bookingDate, booking.slot?.startTime);
                            const isPassed = timeStatus.isPassed;
                            
                            return (
                              <div
                                key={booking.id}
                                className={`group relative p-6 hover:bg-gray-50 transition-all duration-300 ${
                                  isPassed ? 'opacity-75' : ''
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={`relative flex-shrink-0 ${
                                    isPassed ? 'opacity-60' : ''
                                  }`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                                      isPassed 
                                        ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                                        : 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600'
                                    }`}>
                                      🏏
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <h3 className={`text-xl font-bold leading-tight mb-1 ${
                                          isPassed ? 'text-gray-600' : 'text-gray-900'
                                        }`}>
                                          {booking.pitch?.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className={`w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isPassed 
                                              ? 'bg-gray-300' 
                                              : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                          }`}>
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <p className={`text-sm font-medium ${
                                            isPassed ? 'text-gray-500' : 'text-gray-600'
                                          }`}>
                                            {booking.pitch?.location}
                                          </p>
                                        </div>

                                        {/* Booking details in row with badges */}
                                        <div className="space-y-3">
                                          <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">📅</span>
                                              <span className={`text-sm font-semibold ${
                                                isPassed ? 'text-gray-600' : 'text-gray-900'
                                              }`}>{formatDate(booking.bookingDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">🕐</span>
                                              <span className={`text-sm font-semibold ${
                                                isPassed ? 'text-gray-600' : 'text-gray-900'
                                              }`}>
                                                {booking.slot
                                                  ? formatSlotRange(booking.slot.startTime, booking.slot.endTime)
                                                  : '—'}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm">💰</span>
                                              <span className={`text-sm font-bold ${
                                                isPassed ? 'text-gray-600' : 'text-green-700'
                                              }`}>
                                                ₹{Number(booking.pitch?.pricePerHour).toLocaleString('en-IN')}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {/* Badges row */}
                                          <div className="flex flex-wrap gap-2">
                                            {/* Time-based badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${timeStatus.badge.className}`}>
                                              <span>{timeStatus.badge.icon}</span>
                                              <span>{timeStatus.badge.text}</span>
                                            </span>
                                            
                                            {/* Status badge */}
                                            <span
                                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                STATUS_STYLES[booking.status] || STATUS_STYLES.pending
                                              } ${isPassed ? 'opacity-60' : ''}`}
                                            >
                                              <span>{STATUS_ICONS[booking.status]}</span>
                                              <span className="capitalize">{booking.status}</span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action button */}
                                      <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                                          isPassed
                                            ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                            : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-emerald-100 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95'
                                        }`}
                                      >
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">✓</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Bookings</h3>
                          <p className="text-gray-500 mb-6">You haven't completed any cricket pitch bookings yet</p>
                          <a
                            href={ROUTES.PITCHES}
                            className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
                          >
                            Book a Pitch
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Empty state for both sections */}
                {upcomingBookings.length === 0 && completedBookings.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="text-6xl mb-4">🏏</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{MESSAGES.UI.NO_BOOKINGS_TITLE}</h3>
                    <p className="text-gray-500 mb-6">{MESSAGES.UI.NO_BOOKINGS_DESC}</p>
                    <a
                      href={ROUTES.PITCHES}
                      className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                    >
                      {MESSAGES.UI.BROWSE_PITCHES}
                    </a>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
}
