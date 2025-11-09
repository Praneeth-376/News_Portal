import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import SummaryPanel from '../components/SummaryPanel';
import { Bookmark, BookmarkCheck, Share2, ExternalLink, ArrowLeft } from 'lucide-react';
import { formatDateFull } from '../utils/formatDate';
import TagChip from '../components/TagChip';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data.article);

      // Check if bookmarked
      const bookmarksResponse = await api.get('/bookmarks');
      const isBookmarked = bookmarksResponse.data.bookmarks?.some(
        b => b._id === id
      );
      setIsBookmarked(isBookmarked);
    } catch (err) {
      setError('Failed to load article');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
      } else {
        await api.post('/bookmarks', { articleId: id });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else if (article) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <Loader fullScreen size="lg" />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-900 dark:to-slate-800 text-white py-6 sticky top-16 z-10 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleBookmarkToggle}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image */}
        {article.image && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg h-96">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/default-article.jpg';
              }}
            />
          </div>
        )}

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <TagChip label={article.category} variant="success" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {article.source}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {article.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateFull(article.publishedAt)}
              </p>
            </div>
            <button
              onClick={handleBookmarkToggle}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
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
          </div>
        </div>

        {/* Summary Panel */}
        {article._id && <SummaryPanel articleId={article._id} />}

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none my-12">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800">
            {article.content ? (
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Full article content not available. Visit the original source for complete article.
              </p>
            )}
          </div>
        </div>

        {/* External Link */}
        {article.url && (
          <div className="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Read Full Article
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {article.url}
                </p>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap ml-4"
              >
                <ExternalLink className="w-5 h-5" />
                Open
              </a>
            </div>
          </div>
        )}

        {/* Related Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200 dark:border-slate-800">
          <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Views</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {article.views || 0}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Author</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {article.author || 'Unknown'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Source</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {article.source}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}