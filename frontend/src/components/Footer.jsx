export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🏏</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Play<span className="text-green-400">vix</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm text-center">
            © 2026 Playvix. Book your pitch, own the crease.
          </p>
        </div>
      </div>
    </footer>
  );
}
