import { Link } from 'react-router-dom';
import { Home, ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            404
          </h1>
        </div>

        {/* Illustration */}
        <Search className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-8 opacity-50" />

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-semibold transition"
          >
            Browse Articles
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}