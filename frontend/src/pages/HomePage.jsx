import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPitches } from '../api/pitch.api';
import { ROUTES } from '../constants';

const HERO_STATS = [
  { label: 'Pitches', value: '10+', icon: '🏟️' },
  { label: 'Time Slots Daily', value: '160+', icon: '⏰' },
  { label: 'Real-time Updates', value: 'Live', icon: '📡' },
];

const FEATURES = [
  {
    icon: '🏏',
    title: 'Premium Pitches',
    desc: 'Choose from turf grounds, box cricket arenas, indoor nets, and more — all maintained to professional standards.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Reserve your slot in seconds with our 2-minute hold system. No double bookings, guaranteed.',
  },
  {
    icon: '📡',
    title: 'Real-Time Availability',
    desc: 'See live slot updates powered by WebSockets. Know exactly what\'s available right now.',
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    desc: 'Clear per-hour pricing with no hidden charges. Pay only for the time you play.',
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    desc: 'Book from anywhere on any device. Our responsive design works perfectly on phones and tablets.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    desc: 'JWT authentication, idempotent bookings, and transaction-safe operations keep your data secure.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse Pitches', desc: 'Explore available cricket pitches near you with detailed info and pricing.', icon: '🔍' },
  { step: '02', title: 'Pick a Slot', desc: 'Choose your preferred date and time slot from the real-time availability grid.', icon: '📅' },
  { step: '03', title: 'Confirm & Play', desc: 'Complete your booking in one click. Show up and enjoy your game!', icon: '🏏' },
];

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [pitches, setPitches] = useState([]);
  const [loadingPitches, setLoadingPitches] = useState(true);

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const res = await getPitches();
        setPitches(res.data.pitches?.slice(0, 3) || []);
      } catch {
        // Silently fail on homepage
      } finally {
        setLoadingPitches(false);
      }
    };
    fetchPitches();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating cricket elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-bounce-slow">🏏</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-bounce-slow" style={{ animationDelay: '1s' }}>🏟️</div>
        <div className="absolute bottom-20 left-1/4 text-4xl opacity-10 animate-bounce-slow" style={{ animationDelay: '2s' }}>🎯</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-200 text-sm font-medium">Live Booking Available Now</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Book Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                Cricket Pitch
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold text-green-200/80 mt-2">
                in Seconds
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-green-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              India's smartest cricket pitch booking platform. Real-time availability,
              instant reservations, and zero hassle. Just pick, book, and play.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate(ROUTES.PITCHES)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-green-800 font-bold text-lg rounded-2xl hover:bg-green-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                Browse Pitches →
              </button>
              {!isLoggedIn && (
                <Link
                  to={ROUTES.REGISTER}
                  className="w-full sm:w-auto px-8 py-4 bg-green-600/30 backdrop-blur-sm text-white font-bold text-lg rounded-2xl border-2 border-white/30 hover:bg-green-600/50 transition-all duration-300 hover:scale-105 active:scale-95 text-center"
                >
                  Create Free Account
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="text-3xl">{stat.icon}</span>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-green-200/70">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45C96 40 192 30 288 35C384 40 480 60 576 65C672 70 768 60 864 50C960 40 1056 30 1152 35C1248 40 1344 60 1392 70L1440 80V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Featured Pitches Section */}
      {!loadingPitches && pitches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Featured Pitches
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Popular Cricket Venues
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Top-rated pitches ready for your next game
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {pitches.map((pitch, i) => (
              <div
                key={pitch.id}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Pitch Banner */}
                <div className={`h-40 relative overflow-hidden ${
                  i % 3 === 0 ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                  i % 3 === 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                  'bg-gradient-to-br from-orange-400 to-red-500'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                      {i % 3 === 0 ? '🏟️' : i % 3 === 1 ? '🏏' : '🎯'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <span className="text-white text-xs font-semibold">Available Now</span>
                  </div>
                </div>

                {/* Pitch Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {pitch.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    📍 {pitch.location}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Per Hour</p>
                      <p className="text-2xl font-bold text-gray-900">₹{Number(pitch.pricePerHour).toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => navigate(ROUTES.BOOK_PITCH(pitch.id))}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      View Slots →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate(ROUTES.PITCHES)}
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
            >
              View All Pitches →
            </button>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Book in 3 Simple Steps
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From browsing to playing — it takes less than a minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector Line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-green-300 to-green-100" />
                )}
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-5xl">{item.icon}</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-3">
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-4">
            Why Playvix?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Everything You Need to Play
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Built for cricket lovers who want the best booking experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-green-700 to-emerald-800 rounded-3xl p-10 sm:p-16 text-center">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 text-9xl opacity-10">🏏</div>
          <div className="absolute bottom-0 left-10 text-8xl opacity-10">🏟️</div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Hit the Pitch?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of cricket enthusiasts. Book your favourite pitch today and own the crease!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(ROUTES.PITCHES)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-green-800 font-bold text-lg rounded-2xl hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                Browse Pitches Now →
              </button>
              {!isLoggedIn && (
                <Link
                  to={ROUTES.REGISTER}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-white/40 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 text-center"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
