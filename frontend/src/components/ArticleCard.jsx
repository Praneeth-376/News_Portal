import { Bookmark, BookmarkCheck, Eye, Share2 } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../utils/formatDate';
import TagChip from './TagChip';

export default function ArticleCard({
  article,
  isBookmarked,
  onBookmarkToggle,
  onClick,
  variant = 'default',
}) {
  const [imageError, setImageError] = useState(false);
  const defaultImage = '/assets/default-article.jpg';

  const cardClasses = {
    default: 'hover:shadow-xl dark:hover:shadow-slate-800/50',
    compact: 'hover:shadow-lg dark:hover:shadow-slate-800/30',
    featured: 'hover:shadow-2xl',
  };

  const handleShare = async (e) => {
    e.stopPropagation();
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
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 transition duration-300 cursor-pointer ${cardClasses[variant]} group`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-slate-800 overflow-hidden">
        <img
          src={imageError ? defaultImage : article.image || defaultImage}
          onError={() => setImageError(true)}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle?.();
            }}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:scale-110 transition"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:scale-110 transition"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {article.category && (
          <div className="absolute top-3 left-3">
            <TagChip label={article.category} variant="success" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-full">
        {/* Meta */}
        <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
          {article.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{article.views || 0}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle?.();
            }}
            className={`p-1.5 rounded-lg transition ${
              isBookmarked
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}