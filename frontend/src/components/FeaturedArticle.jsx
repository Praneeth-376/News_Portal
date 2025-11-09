import { BookmarkCheck, Bookmark, Play } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import TagChip from './TagChip';

export default function FeaturedArticle({
  article,
  isBookmarked,
  onBookmarkToggle,
  onClick,
}) {
  if (!article) return null;

  return (
    <div className="relative h-96 bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer mb-12">
      {/* Background Image */}
      <img
        src={article.image || '/assets/default-article.jpg'}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
        onError={(e) => {
          e.target.src = '/assets/default-article.jpg';
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {article.category && (
              <TagChip label={article.category} variant="success" />
            )}
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              FEATURED
            </span>
          </div>
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
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition">
              {article.title}
            </h1>
            <p className="text-gray-200 line-clamp-2 mb-4">
              {article.description}
            </p>
          </div>

          {/* Meta & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-300 font-medium">{article.source}</span>
              <span className="text-xs text-gray-400">
                {formatDate(article.publishedAt)}
              </span>
            </div>
            <button
              onClick={onClick}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <Play className="w-5 h-5" />
              Read Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}