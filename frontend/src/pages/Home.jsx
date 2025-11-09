import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import FeaturedArticle from '../components/FeaturedArticle';
import ArticleCard from '../components/ArticleCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import TagChip from '../components/TagChip';
import { Filter, TrendingUp } from 'lucide-react';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState(['all', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment']);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, currentPage, selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: 12,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await api.get('/articles', { params });

      if (response.data.articles && response.data.articles.length > 0) {
        setArticles(response.data.articles);
        setFeatured(response.data.articles[0]);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setArticles([]);
        setFeatured(null);
      }

      // Load bookmarks
      const bookmarksResponse = await api.get('/bookmarks');
      const bookmarkIds = new Set(
        bookmarksResponse.data.bookmarks?.map(b => b.articleId) || []
      );
      setBookmarks(bookmarkIds);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (articleId) => {
    try {
      if (bookmarks.has(articleId)) {
        await api.delete(`/bookmarks/${articleId}`);
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
      } else {
        await api.post('/bookmarks', { articleId });
        setBookmarks(prev => new Set([...prev, articleId]));
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  if (loading && articles.length === 0) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-900 dark:to-slate-800 text-white py-12 sticky top-16 z-10 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h1 className="text-3xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest News'}
            </h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
            {searchQuery
              ? `Found ${articles.length} articles`
              : 'Stay updated with the latest stories from around the world'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Article */}
        {featured && (
          <FeaturedArticle
            article={featured}
            isBookmarked={bookmarks.has(featured._id)}
            onBookmarkToggle={() => handleBookmarkToggle(featured._id)}
            onClick={() => handleArticleClick(featured)}
          />
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Filter by Category</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.slice(1).map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  isBookmarked={bookmarks.has(article._id)}
                  onBookmarkToggle={() => handleBookmarkToggle(article._id)}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery
                ? 'No articles found matching your search'
                : 'No articles available at the moment'}
            </p>
            {searchQuery && (
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Article Modal */}
      <Modal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isBookmarked={selectedArticle && bookmarks.has(selectedArticle._id)}
        onBookmarkToggle={() => {
          if (selectedArticle) {
            handleBookmarkToggle(selectedArticle._id);
          }
        }}
      />
    </div>
  );
}