import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingById, cancelBooking } from '../api/booking.api';
import { formatSlotRange, formatDate } from '../utils/formatTime';
import Spinner from '../components/Spinner';
import { ROUTES, CANCELLABLE_STATUSES, COPY_FEEDBACK_MS, TOAST_DURATION_MS } from '../constants';
import { MESSAGES } from '../constants/messages';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [pitch, setPitch] = useState(location.state?.pitch || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  useEffect(() => {
    if (booking) return;
    const fetchBooking = async () => {
      try {
        const res = await getBookingById(bookingId);
        setBooking(res.data.booking);
        setPitch(res.data.booking.pitch);
      } catch {
        setError(MESSAGES.BOOKING.NOT_FOUND);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const shareUrl = `${window.location.origin}/booking-success/${bookingId}`;

  const qrData = JSON.stringify({
    bookingId: booking?.id,
    pitch: pitch?.name,
    date: booking?.bookingDate,
    slot: booking?.slot
      ? `${booking.slot.startTime} - ${booking.slot.endTime}`
      : '',
    status: booking?.status,
  });

  const handleCopy = async () => {
    const text = [
      `🏏 Playvix Booking Confirmation`,
      ``,
      `Booking ID: #${booking?.id}`,
      `Pitch: ${pitch?.name}`,
      `Location: ${pitch?.location}`,
      `Date: ${formatDate(booking?.bookingDate)}`,
      `Time: ${booking?.slot ? formatSlotRange(booking.slot.startTime, booking.slot.endTime) : ''}`,
      `Amount: ₹${Number(pitch?.pricePerHour).toLocaleString('en-IN')}`,
      `Status: ${booking?.status?.toUpperCase()}`,
      ``,
      `View: ${shareUrl}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await cancelBooking(bookingId);
      setBooking(res.data.booking);
      if (res.data.booking.pitch) setPitch(res.data.booking.pitch);
      setShowCancelConfirm(false);
      showToast(MESSAGES.BOOKING.CANCEL_SUCCESS);
    } catch (err) {
      setCancelError(err.response?.data?.message || MESSAGES.BOOKING.CANCEL_ERROR);
    } finally {
      setCancelling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: MESSAGES.BOOKING.SHARE_TITLE(booking?.id),
          text: MESSAGES.BOOKING.SHARE_TEXT(pitch?.name, formatDate(booking?.bookingDate)),
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const canCancel = booking && CANCELLABLE_STATUSES.includes(booking.status);
  
  // Check if booking time has passed (completed booking)
  const bookingDateTime = booking ? new Date(`${booking.bookingDate} ${booking.slot?.startTime || '00:00'}`) : null;
  const isBookingTimePassed = bookingDateTime ? bookingDateTime < new Date() : false;
  const canCancelBooking = canCancel && !isBookingTimePassed;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" text={MESSAGES.UI.LOADING_BOOKING} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">{error || MESSAGES.BOOKING.NOT_FOUND_DESC}</p>
        <Link to={ROUTES.PITCHES} className="btn-primary inline-block">Browse Pitches</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
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

      {/* Status Banner */}
      <div className="text-center mb-8">
        {booking.status === 'cancelled' ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Cancelled</h1>
            <p className="text-gray-500 mt-2">This booking has been cancelled</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-500 mt-2">Your pitch has been reserved successfully</p>
          </>
        )}
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Booking ID</p>
              <p className="text-xl font-bold">#{booking.id}</p>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wide">
              {booking.status}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
              🏏
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{pitch?.name}</h3>
              <p className="text-sm text-gray-500">📍 {pitch?.location}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {formatDate(booking.bookingDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time Slot</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {booking.slot
                  ? formatSlotRange(booking.slot.startTime, booking.slot.endTime)
                  : '—'}
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

      {/* QR Code */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 text-center">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Check-in QR Code
        </h3>
        <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <QRCodeSVG
            value={qrData}
            size={180}
            level="M"
            includeMargin={false}
            fgColor="#166534"
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Show this QR code at the venue for check-in
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleShare}
          className="flex-1 py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Booking
        </button>
        <button
          onClick={handleCopy}
          className={`flex-1 py-3.5 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
            copied
              ? 'bg-green-50 text-green-700 border-2 border-green-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? (
            <>✓ Copied!</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Details
            </>
          )}
        </button>
      </div>

      {/* Cancel Booking */}
      {canCancelBooking && (
        <div className="mb-6">
          {cancelError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {cancelError}
            </div>
          )}
          {showCancelConfirm ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-800 font-medium mb-3">
                {MESSAGES.BOOKING.CANCEL_CONFIRM}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {cancelling ? <Spinner size="sm" /> : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 transition-all text-sm"
            >
              Cancel This Booking
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(ROUTES.PITCHES)}
          className="flex-1 py-3 text-center text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          {MESSAGES.UI.BACK_TO_PITCHES}
        </button>
        <button
          onClick={() => navigate(ROUTES.MY_BOOKINGS)}
          className="flex-1 py-3 text-center text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
        >
          {MESSAGES.UI.MY_BOOKINGS}
        </button>
      </div>
    </div>
  );
}
