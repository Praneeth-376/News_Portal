import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

export default function SummaryPanel({ articleId }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && !summary && !loading) {
      fetchSummary();
    }
  }, [isExpanded]);

  const fetchSummary = async () => {
    if (summary) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/articles/${articleId}/summary`);
      setSummary(response.data.summary);
    } catch (err) {
      setError('Failed to load summary');
      console.error('Summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 dark:text-white">AI Summary</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Get a quick overview</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900/50">
          {loading && <Loader size="sm" />}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {summary && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
              {summary}
            </p>
          )}

          {!loading && !summary && !error && (
            <button
              onClick={fetchSummary}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Generate Summary
            </button>
          )}
        </div>
      )}
    </div>
  );
}