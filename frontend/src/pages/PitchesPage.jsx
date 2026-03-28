import { useState, useEffect } from 'react';
import { getPitches } from '../api/pitch.api';
import PitchCard from '../components/PitchCard';
import Spinner from '../components/Spinner';

export default function PitchesPage() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const res = await getPitches();
        setPitches(res.data.pitches);
      } catch {
        setError('Failed to load pitches. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchPitches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">🏟️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cricket Pitches</h1>
            <p className="text-gray-500 text-sm mt-0.5">Select a pitch to view available time slots</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="text-sm text-gray-600 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
            <span className="text-sm text-gray-600 font-medium">Reserved (2 min hold)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-sm text-gray-600 font-medium">Booked</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text="Loading pitches..." />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : pitches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="text-gray-600 font-medium">No pitches available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch, i) => (
            <PitchCard key={pitch.id} pitch={pitch} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
