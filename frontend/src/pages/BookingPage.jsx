import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPitches } from '../api/pitch.api';
import { getSlots } from '../api/slot.api';
import { reserveSlot } from '../api/booking.api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import SlotCard from '../components/SlotCard';
import ConfirmModal from '../components/ConfirmModal';
import LoginModal from '../components/LoginModal';
import Spinner from '../components/Spinner';
import { getDateOptions, formatDate, getTodayDate } from '../utils/formatTime';
import { ROUTES, SLOT_STATUSES, TOAST_DURATION_MS } from '../constants';
import { MESSAGES } from '../constants/messages';
import { handleBookingError } from '../utils/errorHandler';

export default function BookingPage() {
  const { pitchId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [pitch, setPitch] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPitch, setLoadingPitch] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(null);

  const [modal, setModal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);
  const { toast, showToast } = useToast();

  const dateOptions = getDateOptions(7);

  useEffect(() => {
    const loadPitch = async () => {
      try {
        const res = await getPitches();
        const found = res.data.pitches.find((p) => p.id === parseInt(pitchId, 10));
        if (!found) { navigate(ROUTES.PITCHES); return; }
        setPitch(found);
      } catch {
        navigate(ROUTES.PITCHES);
      } finally {
        setLoadingPitch(false);
      }
    };
    loadPitch();
  }, [pitchId]);

  const fetchSlots = useCallback(async () => {
    if (!pitchId || !selectedDate) return;
    setLoadingSlots(true);
    setError('');
    try {
      const res = await getSlots(pitchId, selectedDate);
      setSlots(res.data.slots);
    } catch {
      setError(MESSAGES.BOOKING.SLOT_LOAD_ERROR);
    } finally {
      setLoadingSlots(false);
    }
  }, [pitchId, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleSlotUpdate = useCallback(({ slotId, status }) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status } : s)),
    );
  }, []);

  useSocket(parseInt(pitchId, 10), selectedDate, handleSlotUpdate);

  const handleSlotClick = async (slot) => {
    if (!isLoggedIn) {
      setPendingSlot(slot);
      setShowLoginModal(true);
      return;
    }
    if (reserving) return;
    setReserving(slot.id);
    try {
      const res = await reserveSlot({
        slotId: slot.id,
        pitchId: parseInt(pitchId, 10),
        bookingDate: selectedDate,
      });
      setModal({ slot, ttl: res.data.ttl });
    } catch (err) {
      showToast(handleBookingError(err), 'error');
    } finally {
      setReserving(null);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingSlot) {
      handleSlotClick(pendingSlot);
      setPendingSlot(null);
    }
  };

  const handleModalClose = (reason) => {
    setModal(null);
    if (reason === 'expired') showToast(MESSAGES.BOOKING.RESERVATION_EXPIRED, 'error');
    fetchSlots();
  };

  const handleBookingSuccess = (booking) => {
    setModal(null);
    navigate(ROUTES.BOOKING_SUCCESS(booking.id), { state: { booking, pitch } });
  };

  if (loadingPitch) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" text={MESSAGES.UI.LOADING_PITCH} />
      </div>
    );
  }

  const available = slots.filter((s) => s.status === SLOT_STATUSES.AVAILABLE).length;
  const booked = slots.filter((s) => s.status === SLOT_STATUSES.BOOKED).length;
  const reserved = slots.filter((s) => s.status === SLOT_STATUSES.RESERVED).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg animate-slide-up text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-1">✕</button>
        </div>
      )}

      <button
        onClick={() => navigate(ROUTES.PITCHES)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
      >
        {MESSAGES.UI.BACK_TO_PITCHES}
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              🏏
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pitch?.name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                📍 {pitch?.location}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Per Hour</p>
            <p className="text-3xl font-bold text-green-700">
              ₹{Number(pitch?.pricePerHour).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Select Date</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dateOptions.map((date) => {
            const isToday = date === getTodayDate();
            const isSelected = date === selectedDate;
            const d = new Date(date + 'T00:00:00');
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
                  isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-bold mt-0.5 ${isSelected ? 'text-green-700' : 'text-gray-800'}`}>
                  {d.getDate()}
                </span>
                <span className="text-xs opacity-70">
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Time Slots</h2>
          <p className="text-sm text-gray-500">{formatDate(selectedDate)}</p>
        </div>
        {!loadingSlots && slots.length > 0 && (
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="text-green-600">{available} Available</span>
            <span className="text-yellow-600">{reserved} Reserved</span>
            <span className="text-red-600">{booked} Booked</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm mb-4">
          {error}
          <button onClick={fetchSlots} className="ml-2 underline font-medium">Retry</button>
        </div>
      )}

      {loadingSlots ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" text={MESSAGES.UI.LOADING_SLOTS} />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500 font-medium">{MESSAGES.UI.NO_SLOTS}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slots.map((slot) => (
            <div key={slot.id} className="relative">
              {reserving === slot.id && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 rounded-2xl">
                  <Spinner size="sm" />
                </div>
              )}
              <SlotCard slot={slot} onClick={handleSlotClick} selectedDate={selectedDate} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
          <span>💡</span>
          <span>
            {MESSAGES.UI.RESERVATION_HINT}
            <strong> {MESSAGES.UI.RESERVATION_DURATION}</strong> {MESSAGES.UI.RESERVATION_HINT_END}
          </span>
        </p>
      </div>

      {modal && pitch && (
        <ConfirmModal
          slot={modal.slot}
          pitch={pitch}
          bookingDate={selectedDate}
          ttl={modal.ttl}
          onSuccess={handleBookingSuccess}
          onClose={handleModalClose}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => { setShowLoginModal(false); setPendingSlot(null); }}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
