import { useState, useEffect } from 'react';
import api from '../api';
import ArticleCard from '../components/ArticleCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { Bookmark, Trash2 } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookmarks();
  }, [currentPage]);

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/bookmarks', {
        params: {
          page: currentPage,
          limit: 12,
        },
      });

      setBookmarks(response.data.bookmarks || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load bookmarks');
      console.error('Bookmarks fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
    } catch (err) {
      console.error('Remove bookmark error:', err);
      alert('Failed to remove bookmark');
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  if (loading && bookmarks.length === 0) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-900 dark:to-slate-800 text-white py-12 sticky top-16 z-10 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8" />
            <h1 className="text-3xl font-bold">My Bookmarks</h1>
          </div>
          <p className="text-blue-100">
            {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {bookmarks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {bookmarks.map(bookmark => (
                <div key={bookmark._id} className="relative group">
                  <ArticleCard
                    article={bookmark}
                    isBookmarked={true}
                    onBookmarkToggle={() => handleRemoveBookmark(bookmark._id)}
                    onClick={() => handleArticleClick(bookmark)}
                  />
                  <button
                    onClick={() => handleRemoveBookmark(bookmark._id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Bookmarks Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start bookmarking articles to save them for later
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Browse Articles
            </a>
          </div>
        )}
      </div>

      {/* Article Modal */}
      <Modal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isBookmarked={true}
        onBookmarkToggle={() => {
          if (selectedArticle) {
            handleRemoveBookmark(selectedArticle._id);
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
}