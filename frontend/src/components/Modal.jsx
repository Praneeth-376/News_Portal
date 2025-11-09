import { X, ExternalLink, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { formatDateFull } from '../utils/formatDate';

export default function Modal({ article, isOpen, onClose, isBookmarked, onBookmarkToggle }) {
  if (!isOpen || !article) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {article.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {/* Image */}
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.src = '/assets/default-article.jpg';
              }}
            />
          )}

          {/* Meta Info */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Source</p>
                <p className="font-semibold text-gray-900 dark:text-white">{article.source}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Published</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDateFull(article.publishedAt)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Category</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {article.category || 'General'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.description}
              </p>
            </div>

            {/* Full Content */}
            {article.content && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Full Article</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
          <button
            onClick={onBookmarkToggle}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              isBookmarked
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-5 h-5" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5" />
                Save
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            <ExternalLink className="w-5 h-5" />
            Read Full
          </a>
        </div>
      </div>
    </div>
  );
}