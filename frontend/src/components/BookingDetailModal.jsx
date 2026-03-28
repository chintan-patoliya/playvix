import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatSlotRange, formatDate } from '../utils/formatTime';
import { cancelBooking } from '../api/booking.api';
import Spinner from './Spinner';
import { STATUS_STYLES, STATUS_ICONS, CANCELLABLE_STATUSES, ROUTES } from '../constants';
import { MESSAGES } from '../constants/messages';

export default function BookingDetailModal({ booking, onClose, onCancelled }) {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canCancel = CANCELLABLE_STATUSES.includes(booking.status);

  const handleCancelConfirm = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await cancelBooking(booking.id);
      setShowCancelConfirm(false);
      onCancelled(res.data.booking);
    } catch (err) {
      setCancelError(err.response?.data?.message || MESSAGES.BOOKING.CANCEL_ERROR);
    } finally {
      setCancelling(false);
    }
  };

  const pitch = booking.pitch;
  const slot = booking.slot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
              🏏
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <p className="text-xs text-gray-500">#{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="text-sm text-gray-500 font-medium">Status</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}
            >
              <span>{STATUS_ICONS[booking.status]}</span>
              <span className="capitalize">{booking.status}</span>
            </span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                🏏
              </div>
              <div>
                <p className="font-bold text-gray-900">{pitch?.name}</p>
                <p className="text-sm text-gray-500">📍 {pitch?.location}</p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(booking.bookingDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time Slot</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {slot ? formatSlotRange(slot.startTime, slot.endTime) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Amount</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">
                  ₹{Number(pitch?.pricePerHour).toLocaleString('en-IN')}
                </p>
              </div>
              {booking.user && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Booked By</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.user.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {cancelError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {cancelError}
          </div>
        )}

        {showCancelConfirm ? (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-800 font-medium mb-3">
              {MESSAGES.BOOKING.CANCEL_CONFIRM}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {cancelling ? <Spinner size="sm" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex gap-3">
            {booking.status === 'confirmed' && (
              <button
                onClick={() => navigate(ROUTES.BOOKING_SUCCESS(booking.id))}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-1.5"
              >
                View Confirmation →
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 transition-all text-sm"
              >
                Cancel Booking
              </button>
            )}
            {!canCancel && booking.status !== 'confirmed' && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
