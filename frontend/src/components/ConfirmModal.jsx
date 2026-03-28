import { useState, useEffect, useRef } from 'react';
import { formatSlotRange, formatDate } from '../utils/formatTime';
import { confirmBooking } from '../api/booking.api';
import Spinner from './Spinner';
import { RESERVATION_TTL_SECONDS } from '../constants';
import { MESSAGES } from '../constants/messages';

export default function ConfirmModal({ slot, pitch, bookingDate, ttl = RESERVATION_TTL_SECONDS, onSuccess, onClose }) {
  const [countdown, setCountdown] = useState(ttl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (countdown <= 0) {
      onClose('expired');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const urgency = countdown <= 30;
  const pct = Math.round((countdown / ttl) * 100);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await confirmBooking({
        slotId: slot.id,
        pitchId: pitch.id,
        bookingDate,
        idempotencyKey: idempotencyKeyRef.current,
      });
      onSuccess(res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || MESSAGES.BOOKING.CONFIRM_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose('cancel')} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
              <p className="text-xs text-gray-500">Review your selection</p>
            </div>
          </div>
          <button
            onClick={() => onClose('cancel')}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Pitch</span>
            <span className="text-sm font-semibold text-gray-900">{pitch.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Location</span>
            <span className="text-sm font-medium text-gray-700">{pitch.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-semibold text-gray-900">{formatDate(bookingDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Time Slot</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatSlotRange(slot.startTime, slot.endTime)}
            </span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-lg font-bold text-green-700">
              ₹{Number(pitch.pricePerHour).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={`rounded-2xl p-4 mb-5 ${urgency ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${urgency ? 'text-red-700' : 'text-yellow-700'}`}>
              ⏱ Reservation expires in
            </span>
            <span className={`text-xl font-bold tabular-nums ${urgency ? 'text-red-700 animate-pulse' : 'text-yellow-700'}`}>
              {String(Math.floor(countdown / 60)).padStart(2, '0')}:
              {String(countdown % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${urgency ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className={`text-xs mt-1.5 ${urgency ? 'text-red-500' : 'text-yellow-600'}`}>
            {urgency
              ? 'Hurry! Slot will be released soon.'
              : `Confirm within ${RESERVATION_TTL_SECONDS / 60} minutes or the slot will be released.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onClose('cancel')}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || countdown <= 0}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : '✓ Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
