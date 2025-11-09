import { useState, useEffect, useRef, useCallback } from 'react'
import { authAPI, articlesAPI, preferencesAPI } from './services/api'

// ADD THIS LINE - Define API_BASE constant
const API_BASE = 'http://localhost:5000/api'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedCountry, setSelectedCountry] = useState('us')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [pullToRefreshY, setPullToRefreshY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [breakingNews, setBreakingNews] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)

  const observer = useRef()
  const pullStartY = useRef(0)
  const containerRef = useRef()
  const articleUrls = useRef(new Set()) // Track unique article URLs

  const categories = [
    { id: 'general', name: 'General', icon: '📰' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'technology', name: 'Tech', icon: '💻' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  ]

  const countries = [
    { id: 'us', name: 'United States', flag: '🇺🇸' },
    { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'in', name: 'India', flag: '🇮🇳' },
    { id: 'au', name: 'Australia', flag: '🇦🇺' },
    { id: 'ca', name: 'Canada', flag: '🇨🇦' },
    { id: 'de', name: 'Germany', flag: '🇩🇪' },
    { id: 'fr', name: 'France', flag: '🇫🇷' },
    { id: 'jp', name: 'Japan', flag: '🇯🇵' },
    { id: 'br', name: 'Brazil', flag: '🇧🇷' },
    { id: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  ]

  // Show notification
  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  // Share functionality
  const shareArticle = async (article) => {
    const shareData = {
      title: article.title,
      text: article.description,
      url: article.url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        showNotificationMessage('Article shared successfully!')
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(article.url).then(() => {
        showNotificationMessage('Article link copied to clipboard!')
      })
    }
  }

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus()
    loadUserPreferences()
    loadBookmarks()
  }, [])

  useEffect(() => {
    if (user) {
      fetchNews(true) // Reset when dependencies change
      fetchBreakingNews()
    }
  }, [selectedCategory, selectedCountry, user])

  // Load bookmarks from localStorage
  const loadBookmarks = () => {
    const savedBookmarks = localStorage.getItem('bookmarks')
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }

  // Check if user is already logged in
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        const response = await authAPI.getCurrentUser()
        if (response.success) {
          setUser(response.data.user)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  // Load user preferences
  const loadUserPreferences = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await preferencesAPI.getPreferences()
        if (response.success) {
          const prefs = response.data.preferences
          setDarkMode(prefs.darkMode || false)
          setSelectedCountry(prefs.selectedCountry || 'us')
          setSelectedCategory(prefs.selectedCategories?.[0] || 'general')
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    } else {
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode))
      }
    }
  }

  // Save preferences to backend
  const savePreferences = async () => {
    const token = localStorage.getItem('token')
    const preferences = {
      darkMode,
      selectedCountry,
      selectedCategories: [selectedCategory],
    }

    if (token) {
      try {
        await preferencesAPI.updatePreferences(preferences)
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    } else {
      localStorage.setItem('darkMode', JSON.stringify(darkMode))
    }
  }

  // Fetch breaking news
const fetchBreakingNews = async () => {
  try {
    const response = await articlesAPI.getBreakingNews();
    if (response.success) {
      setBreakingNews(response.data.articles || []);
    }
  } catch (error) {
    console.error('Failed to fetch breaking news:', error);
    // Fallback to simulated data even if there's an error
    const fallbackBreakingNews = [
      {
        title: "🚨 Breaking News: Stay Informed with NewsHub",
        url: "#",
        source: { name: "NewsHub" },
        publishedAt: new Date().toISOString()
      }
    ];
    setBreakingNews(fallbackBreakingNews);
  }
}
  // UPDATED: Fetch news with duplicate prevention
// UPDATED: Fetch news with duplicate prevention
const fetchNews = async (isRefresh = false) => {
  if (!isRefresh && page === 1) setLoading(true);
  if (isRefresh) setRefreshing(true);
  
  setError('');
  
  try {
    const filters = {
      category: selectedCategory,
      country: selectedCountry,
      page: isRefresh ? 1 : page
    };

    if (searchQuery && searchQuery.trim() !== '') {
      filters.q = searchQuery.trim();
    }

    console.log('Fetching news with filters:', filters); // DEBUG

    const response = await articlesAPI.getArticles(filters);
    
    console.log('News API response:', response); // DEBUG
    
    if (response.success) {
      const newArticles = response.data.articles || [];
      
      console.log('Received articles:', newArticles.length); // DEBUG
      
      // FIXED: Only filter duplicates on refresh, not on pagination
      let articlesToAdd;
      if (isRefresh) {
        // On refresh, clear and filter duplicates
        articleUrls.current.clear();
        articlesToAdd = newArticles.filter(article => article.url);
        articlesToAdd.forEach(article => {
          if (article.url) {
            articleUrls.current.add(article.url);
          }
        });
      } else {
        // On pagination, add all new articles without strict filtering
        articlesToAdd = newArticles;
        newArticles.forEach(article => {
          if (article.url && !articleUrls.current.has(article.url)) {
            articleUrls.current.add(article.url);
          }
        });
      }
      
      console.log('Articles to add:', articlesToAdd.length); // DEBUG
      
      if (isRefresh || page === 1) {
        setArticles(articlesToAdd);
        console.log('Set initial articles:', articlesToAdd.length); // DEBUG
      } else {
        setArticles(prev => [...prev, ...articlesToAdd]);
        console.log('Appended articles, total now:', articles.length + articlesToAdd.length); // DEBUG
      }
      
      // Set hasMore based on whether we got any articles
      const gotArticles = articlesToAdd.length > 0;
      setHasMore(gotArticles);
      console.log('Setting hasMore:', gotArticles); // DEBUG
    } else {
      setError(response.message || 'Failed to load articles');
      setHasMore(false); // Stop infinite scroll on error
      console.log('Setting hasMore: false due to API error'); // DEBUG
    }
  } catch (err) {
    console.error('Fetch error:', err);
    setError('Failed to load news. Please try again.');
    setHasMore(false); // Stop infinite scroll on error
    console.log('Setting hasMore: false due to fetch error'); // DEBUG
  } finally {
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }
}
  // IMPROVED: Handle search input with proper debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search execution
    const newTimeout = setTimeout(() => {
      if (value.trim() === '') {
        setPage(1);
        setArticles([]);
        articleUrls.current.clear();
        fetchNews(true);
      } else {
        setPage(1);
        setArticles([]);
        articleUrls.current.clear();
        setSelectedCategory('general'); // Reset category when searching
        fetchNews(true);
      }
    }, 500); // 500ms debounce delay
    
    setSearchTimeout(newTimeout);
  }

  // UPDATED: Login handler
  const handleLogin = async (email, password) => {
    setError('')
    try {
      const response = await authAPI.login({ email, password })
      
      if (response.success) {
        const { user, token } = response.data
        setUser(user)
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setCurrentPage('home')
        showNotificationMessage(`Welcome back, ${user.name}!`)
        
        await loadUserPreferences()
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // UPDATED: Register handler
  const handleRegister = async (name, email, password) => {
    setError('')
    try {
      const response = await authAPI.register({ name, email, password })
      
      if (response.success) {
        const { user, token } = response.data
        setUser(user)
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setCurrentPage('home')
        showNotificationMessage(`Welcome to NewsHub, ${user.name}!`)
      } else {
        setError(response.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // UPDATED: Logout handler
  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setCurrentPage('login')
      showNotificationMessage('Logged out successfully')
    }
  }

  // Update handlers to save preferences
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    setTimeout(savePreferences, 100)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setPage(1)
    setArticles([])
    articleUrls.current.clear()
    setTimeout(savePreferences, 100)
  }

  const handleCountryChange = (country) => {
    setSelectedCountry(country)
    setPage(1)
    setArticles([])
    articleUrls.current.clear()
    setTimeout(savePreferences, 100)
  }

  // Pull to refresh handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling) return

    const currentY = e.touches[0].clientY
    const diff = currentY - pullStartY.current

    if (diff > 0) {
      setPullToRefreshY(Math.min(diff, 100))
    }
  }

  const handleTouchEnd = () => {
    if (pullToRefreshY > 60) {
      handleRefresh()
    }
    setPullToRefreshY(0)
    setIsPulling(false)
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    articleUrls.current.clear()
    await fetchNews(true)
    await fetchBreakingNews()
    setRefreshing(false)
    showNotificationMessage('News refreshed!')
  }, [selectedCategory, selectedCountry, searchQuery])

  // IMPROVED: Infinite scroll observer with better logic
const lastArticleElementRef = useCallback(node => {
  if (loadingMore || loading || !hasMore) {
    if (observer.current) observer.current.disconnect();
    console.log('Observer disconnected - condition not met:', { loadingMore, loading, hasMore }); // DEBUG
    return;
  }
  
  if (observer.current) observer.current.disconnect();
  
  observer.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
      console.log('Last article visible, loading more...'); // DEBUG
      setLoadingMore(true);
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchNewsWithPage(nextPage);
        return nextPage;
      });
    }
  }, {
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  if (node) {
    observer.current.observe(node);
    console.log('Observer attached to node'); // DEBUG
  }
}, [loadingMore, hasMore, loading])
  // BETTER SOLUTION: Remove duplicate filtering for infinite scroll
const fetchNewsWithPage = async (pageNum) => {
  try {
    const filters = {
      category: selectedCategory,
      country: selectedCountry,
      page: pageNum
    };

    if (searchQuery && searchQuery.trim() !== '') {
      filters.q = searchQuery.trim();
    }

    console.log('Fetching page:', pageNum, 'with filters:', filters);

    const response = await articlesAPI.getArticles(filters);
    
    console.log('API Response:', response);
    
    if (response.success) {
      const newArticles = response.data.articles || [];
      
      console.log('New articles received:', newArticles.length);
      
      // REMOVED: Duplicate filtering - let the backend handle pagination
      // Just add all new articles
      newArticles.forEach(article => {
        if (article.url) {
          articleUrls.current.add(article.url);
        }
      });

      if (newArticles.length > 0) {
        setArticles(prev => [...prev, ...newArticles]);
        // Assume there are more pages if we got any articles
        setHasMore(newArticles.length > 0);
        console.log('Setting hasMore: true - got', newArticles.length, 'articles');
      } else {
        // No articles means we've reached the end
        setHasMore(false);
        console.log('Setting hasMore: false - no articles received');
      }
    } else {
      setHasMore(false);
      console.log('Setting hasMore: false - API response not successful');
    }
  } catch (err) {
    console.error('Error loading more articles:', err);
    setHasMore(false);
    console.log('Setting hasMore: false - error occurred');
  } finally {
    setLoadingMore(false);
  }
}
  // Bookmark functionality
  const handleBookmarkToggle = (article) => {
    const isBookmarked = bookmarks.some(b => b.url === article.url)
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.url !== article.url)
    } else {
      newBookmarks = [...bookmarks, { ...article, bookmarkedAt: new Date().toISOString() }]
    }
    
    setBookmarks(newBookmarks)
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
    showNotificationMessage(isBookmarked ? 'Article removed from bookmarks' : 'Article bookmarked!')
  }

  const isBookmarked = (article) => bookmarks.some(b => b.url === article.url)

  // Filter articles for search (client-side fallback)
  const filteredArticles = articles.filter(article =>
    !searchQuery || 
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const bgStyle = darkMode ? '#0f172a' : '#ffffff'
  const textStyle = darkMode ? '#f1f5f9' : '#111827'
  const cardStyle = darkMode ? '#1e293b' : '#f8fafc'
  const borderStyle = darkMode ? '#334155' : '#e2e8f0'
  const secondaryText = darkMode ? '#cbd5e1' : '#64748b'

  // Breaking News Component
  const BreakingNews = () => {
    if (!breakingNews || breakingNews.length === 0) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        color: 'white',
        padding: '12px 0',
        marginBottom: '24px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          animation: 'scrollBreakingNews 30s linear infinite'
        }}>
          <span style={{
            background: 'white',
            color: '#dc2626',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            marginRight: '16px',
            whiteSpace: 'nowrap'
          }}>
            🚨 BREAKING
          </span>
          {breakingNews.map((news, index) => (
            <span key={index} style={{ 
              marginRight: '32px',
              whiteSpace: 'nowrap',
              fontWeight: '500'
            }}>
              {news.title}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Notification Component
  const Notification = () => (
    showNotification && (
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxWidth: '90%',
        textAlign: 'center',
        animation: 'slideDown 0.3s ease-out'
      }}>
        {notificationMessage}
      </div>
    )
  )

  // Pull to Refresh Indicator
  const PullToRefreshIndicator = () => (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      height: `${pullToRefreshY}px`,
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      zIndex: 999,
      transition: 'height 0.2s ease',
      overflow: 'hidden'
    }}>
      {pullToRefreshY > 60 ? 'Release to refresh' : 'Pull down to refresh'}
    </div>
  )

  // Navbar Component
  const Navbar = () => (
    <div style={{
      background: `linear-gradient(135deg, ${darkMode ? '#1e293b' : '#ffffff'} 0%, ${darkMode ? '#0f172a' : '#f8fafc'} 100%)`,
      borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          onClick={() => setCurrentPage('home')}
        >
          📰 NewsHub Pro
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user && (
            <>
              <button
                onClick={() => setCurrentPage('bookmarks')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textStyle,
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2563eb'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none'
                  e.target.style.color = textStyle
                }}
              >
                🔖 Bookmarks ({bookmarks.length})
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textStyle,
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#7c3aed'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none'
                  e.target.style.color = textStyle
                }}
              >
                👤 {user.name}
              </button>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            style={{
              background: 'none',
              border: 'none',
              color: textStyle,
              cursor: 'pointer',
              fontSize: '24px',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'rotate(20deg)'}
            onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg)'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {user && (
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Login Page Component
  const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isRegister, setIsRegister] = useState(false)

    const handleSubmit = () => {
      if (isRegister) {
        if (!name) {
          setError('Please enter your name')
          return
        }
        handleRegister(name, email, password)
      } else {
        handleLogin(email, password)
      }
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${darkMode ? '#0f172a' : '#f0f9ff'}, ${darkMode ? '#1e293b' : '#e0f2fe'})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: cardStyle,
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '450px',
          border: `1px solid ${borderStyle}`
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: textStyle, marginBottom: '8px' }}>
              NewsHub Pro
            </h2>
            <p style={{ color: secondaryText }}>
              {isRegister ? 'Create your account' : 'Your Premium News Portal'}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                marginBottom: '16px',
                borderRadius: '8px',
                border: `2px solid ${borderStyle}`,
                background: bgStyle,
                color: textStyle,
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = borderStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '16px',
              borderRadius: '8px',
              border: `2px solid ${borderStyle}`,
              background: bgStyle,
              color: textStyle,
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = borderStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '24px',
              borderRadius: '8px',
              border: `2px solid ${borderStyle}`,
              background: bgStyle,
              color: textStyle,
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = borderStyle}
          />

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)'
              e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)'
            }}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: secondaryText,
              cursor: 'pointer',
              padding: '12px',
              marginTop: '16px',
              fontSize: '14px'
            }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', color: secondaryText, fontSize: '12px' }}>
            Demo: Use any email/password to test
          </p>
        </div>
      </div>
    )
  }

  // Home Page Component
  const HomePage = () => (
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh', 
        background: bgStyle, 
        color: textStyle, 
        padding: '24px 0',
        position: 'relative'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PullToRefreshIndicator />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {/* Breaking News Section */}
        <BreakingNews />

        <div style={{
          background: `linear-gradient(135deg, #2563eb, #7c3aed)`,
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '40px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>Welcome to NewsHub Pro</h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>Stay informed with the latest news from around the world</p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="🔍 Search news stories..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '10px',
              border: `2px solid ${borderStyle}`,
              background: cardStyle,
              color: textStyle,
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb'
              e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = borderStyle
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === cat.id
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                    : borderStyle,
                  color: selectedCategory === cat.id ? 'white' : textStyle,
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.target.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Country Selector */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
            {countries.map(country => (
              <button
                key={country.id}
                onClick={() => handleCountryChange(country.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCountry === country.id
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : borderStyle,
                  color: selectedCountry === country.id ? 'white' : textStyle,
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  boxShadow: selectedCountry === country.id ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCountry !== country.id) {
                    e.target.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                }}
              >
                {country.flag} {country.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {error}
          </div>
        )}

        {refreshing && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid ' + borderStyle,
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '12px', color: secondaryText }}>Refreshing news...</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid ' + borderStyle,
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '16px', color: secondaryText }}>Loading latest news...</p>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredArticles.map((article, index) => {
              if (filteredArticles.length === index + 1) {
                return (
                  <div
                    key={`${article.url}-${index}`}
                    ref={lastArticleElementRef}
                    onClick={() => {
                      setSelectedArticle(article)
                      setCurrentPage('detail')
                    }}
                    style={{
                      background: cardStyle,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: `1px solid ${borderStyle}`,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=200&fit=crop&text=News+Image`
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            shareArticle(article)
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)'
                            e.target.style.background = 'rgba(255,255,255,1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.background = 'rgba(255,255,255,0.9)'
                          }}
                        >
                          📤
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookmarkToggle(article)
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)'
                            e.target.style.background = 'rgba(255,255,255,1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.background = 'rgba(255,255,255,0.9)'
                          }}
                        >
                          {isBookmarked(article) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#2563eb',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                      }}>
                        {article.source?.name || 'Unknown Source'}
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        flex: 1,
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: secondaryText,
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.description || 'No description available'}
                      </p>
                      <div style={{
                        fontSize: '12px',
                        color: secondaryText,
                        borderTop: `1px solid ${borderStyle}`,
                        paddingTop: '12px'
                      }}>
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date unknown'}
                      </div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div
                    key={`${article.url}-${index}`}
                    onClick={() => {
                      setSelectedArticle(article)
                      setCurrentPage('detail')
                    }}
                    style={{
                      background: cardStyle,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: `1px solid ${borderStyle}`,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=200&fit=crop&text=News+Image`
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            shareArticle(article)
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)'
                            e.target.style.background = 'rgba(255,255,255,1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.background = 'rgba(255,255,255,0.9)'
                          }}
                        >
                          📤
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookmarkToggle(article)
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)'
                            e.target.style.background = 'rgba(255,255,255,1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.background = 'rgba(255,255,255,0.9)'
                          }}
                        >
                          {isBookmarked(article) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#2563eb',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                      }}>
                        {article.source?.name || 'Unknown Source'}
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        flex: 1,
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: secondaryText,
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.description || 'No description available'}
                      </p>
                      <div style={{
                        fontSize: '12px',
                        color: secondaryText,
                        borderTop: `1px solid ${borderStyle}`,
                        paddingTop: '12px'
                      }}>
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date unknown'}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}

        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid ' + borderStyle,
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '16px', color: secondaryText }}>Loading more articles...</p>
          </div>
        )}

        {!hasMore && articles.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: secondaryText }}>
            You've reached the end of the news feed
          </div>
        )}

        {!loading && articles.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px', color: secondaryText }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No articles found</h3>
            <p>Try changing your search criteria or category</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); }
          to { transform: translateX(-50%) translateY(0); }
        }
        @keyframes scrollBreakingNews {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )

  // The rest of your components (DetailPage, BookmarksPage, ProfilePage) remain the same
  const DetailPage = () => (
    <div style={{ minHeight: '100vh', background: bgStyle, color: textStyle, padding: '24px 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <button
          onClick={() => setCurrentPage('home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '24px',
            padding: '8px 0',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateX(-4px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateX(0px)'}
        >
          ← Back to News
        </button>

        {selectedArticle && (
          <>
            <img
                  src={selectedArticle.urlToImage}
                  alt={selectedArticle.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/800/400?random=detail`;
                    e.target.style.backgroundColor = darkMode ? '#374151' : '#e5e7eb';
                  }}
                />

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px'
                }}>
                  {selectedArticle.source?.name || 'Unknown Source'}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: secondaryText,
                  padding: '6px 12px',
                  background: borderStyle,
                  borderRadius: '20px'
                }}>
                  {selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleDateString() : 'Date unknown'}
                </span>
              </div>

              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {selectedArticle.title}
              </h1>

              <p style={{
                fontSize: '18px',
                color: secondaryText,
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                {selectedArticle.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleBookmarkToggle(selectedArticle)}
                style={{
                  padding: '12px 24px',
                  background: isBookmarked(selectedArticle)
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                {isBookmarked(selectedArticle) ? '❤️ Saved' : '🤍 Save'}
              </button>

              <button
                onClick={() => shareArticle(selectedArticle)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                📤 Share
              </button>

              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                Read Full Story
              </a>
            </div>

            <div style={{
              background: cardStyle,
              padding: '24px',
              borderRadius: '10px',
              border: `1px solid ${borderStyle}`,
              lineHeight: '1.8'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Full Story</h2>
              <p>{selectedArticle.description}</p>
              <p style={{ marginTop: '16px', color: secondaryText }}>
                For the complete article, please visit the source website by clicking "Read Full Story" above.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const BookmarksPage = () => (
    <div style={{ minHeight: '100vh', background: bgStyle, color: textStyle, padding: '24px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Saved Articles</h2>

        {bookmarks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: cardStyle,
            borderRadius: '12px',
            border: `2px dashed ${borderStyle}`
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔖</div>
            <p style={{ fontSize: '18px', color: secondaryText }}>No saved articles yet</p>
            <p style={{ color: secondaryText, marginTop: '8px' }}>Start bookmarking articles to read them later!</p>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              Browse News
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {bookmarks.map((article, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedArticle(article)
                  setCurrentPage('detail')
                }}
                style={{
                  background: cardStyle,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: `1px solid ${borderStyle}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                  <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/400/200?random=bookmark-${index}`;
                        e.target.style.backgroundColor = darkMode ? '#374151' : '#e5e7eb';
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmarkToggle(article)
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)'
                      e.target.style.background = 'rgba(255,255,255,1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.background = 'rgba(255,255,255,0.9)'
                    }}
                  >
                    ❤️
                  </button>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#2563eb',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {article.source?.name || 'Unknown Source'}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    flex: 1,
                    lineHeight: '1.4'
                  }}>
                    {article.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: secondaryText,
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.description || 'No description available'}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    color: secondaryText,
                    borderTop: `1px solid ${borderStyle}`,
                    paddingTop: '12px'
                  }}>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const ProfilePage = () => (
    <div style={{ minHeight: '100vh', background: bgStyle, color: textStyle, padding: '24px 0' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>User Profile</h2>

        <div style={{
          background: `linear-gradient(135deg, ${darkMode ? '#1e293b' : '#f0f9ff'}, ${darkMode ? '#0f172a' : '#e0f2fe'})`,
          padding: '32px',
          borderRadius: '12px',
          border: `2px solid ${borderStyle}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 16px'
            }}>
              👤
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{user?.name}</h3>
            <p style={{ color: secondaryText }}>{user?.email}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: cardStyle,
              padding: '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: `1px solid ${borderStyle}`
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
              <p style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Saved Articles</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookmarks.length}</p>
            </div>
            <div style={{
              background: cardStyle,
              padding: '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: `1px solid ${borderStyle}`
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌍</div>
              <p style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Member Since</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Today</p>
            </div>
          </div>

          <div style={{
            background: cardStyle,
            padding: '16px',
            borderRadius: '10px',
            border: `1px solid ${borderStyle}`,
            marginBottom: '24px'
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Account Info</h4>
            <p style={{ color: secondaryText, marginBottom: '8px', fontSize: '14px' }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ color: secondaryText, marginBottom: '8px', fontSize: '14px' }}>
              <strong>Status:</strong> Active
            </p>
            <p style={{ color: secondaryText, fontSize: '14px' }}>
              <strong>Theme:</strong> {darkMode ? 'Dark Mode' : 'Light Mode'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)'
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            Sign Out
          </button>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: cardStyle,
          borderRadius: '10px',
          border: `1px solid ${borderStyle}`,
          textAlign: 'center'
        }}>
          <p style={{ color: secondaryText, fontSize: '14px' }}>
            📰 <strong>NewsHub Pro</strong> - Your Premium News Portal
          </p>
          <p style={{ color: secondaryText, fontSize: '12px', marginTop: '8px' }}>
            © 2024 NewsHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )

  if (!user) {
    return <LoginPage />
  }

  return (
    <div style={{ background: bgStyle, color: textStyle, minHeight: '100vh' }}>
      <Navbar />
      <Notification />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'detail' && <DetailPage />}
      {currentPage === 'bookmarks' && <BookmarksPage />}
      {currentPage === 'profile' && <ProfilePage />}
    </div>
  )
}