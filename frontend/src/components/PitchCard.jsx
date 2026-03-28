import { useNavigate } from 'react-router-dom';
import { PITCH_ICONS, ROUTES } from '../constants';

export default function PitchCard({ pitch, index }) {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Header with icon and status */}
      <div className="relative p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              {PITCH_ICONS[index % PITCH_ICONS.length]}
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full border border-green-200 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-700 group-hover:to-emerald-700 group-hover:bg-clip-text transition-all duration-300 mb-2">
            {pitch.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600">{pitch.location}</p>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Price per hour</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ₹{Number(pitch.pricePerHour).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 font-medium">/hr</span>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.BOOK_PITCH(pitch.id))}
            className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 group/btn"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book Now
              <svg className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            {/* Button shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
