const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.NEWS_API_KEY || 'b9f291ad80c0308a11341b44922e9358';
const API_URL = 'https://gnews.io/api/v4';

// Get real news from GNews API with better error handling
router.get('/', async (req, res) => {
  try {
    const { category = 'general', country = 'us', page = 1, q = '' } = req.query;
    
    console.log('Fetching news with params:', { category, country, page, q });

    // Build the API URL with proper error handling
    let url = `${API_URL}/top-headlines?`;
    const params = new URLSearchParams({
      token: API_KEY, // GNews uses 'token' parameter
      lang: 'en',
      max: '10'
    });

    // Add optional parameters only if they have values
    if (category && category !== 'general') {
      params.append('topic', category);
    }
    
    if (country && country !== 'none') {
      params.append('country', country);
    }
    
    if (q && q.trim() !== '') {
      params.append('q', q.trim());
    }

    url += params.toString();

    console.log('GNews API URL:', url.replace(API_KEY, 'HIDDEN_KEY'));

    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });
    
    const data = response.data;

    if (data.articles && data.articles.length > 0) {
      const formattedArticles = data.articles.map((article, index) => ({
        id: `article-${Date.now()}-${index}`,
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        urlToImage: article.image || getFallbackImage(category),
        source: { name: article.source?.name || 'Unknown Source' },
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url || '#',
        content: article.content,
        category: category
      }));

      res.json({
        success: true,
        data: {
          articles: formattedArticles,
          total: formattedArticles.length,
          page: parseInt(page),
          hasMore: data.articles.length === 10
        }
      });
    } else {
      // Return empty array instead of demo data
      res.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          page: parseInt(page),
          hasMore: false
        }
      });
    }
  } catch (error) {
    console.error('Error fetching news:', error.message);
    
    // Better error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news from external API',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          page: 1,
          hasMore: false
        }
      });
    }

    const url = `${API_URL}/search?q=${encodeURIComponent(q)}&lang=en&max=10&page=${page}&token=${API_KEY}`;

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    if (data.articles && data.articles.length > 0) {
      const formattedArticles = data.articles.map((article, index) => ({
        id: `search-${Date.now()}-${index}`,
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        urlToImage: article.image || getFallbackImage('general'),
        source: { name: article.source?.name || 'Unknown Source' },
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url || '#',
        content: article.content
      }));

      res.json({
        success: true,
        data: {
          articles: formattedArticles,
          total: formattedArticles.length,
          page: parseInt(page),
          hasMore: data.articles.length === 10
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          page: parseInt(page),
          hasMore: false
        }
      });
    }
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function for fallback images
function getFallbackImage(category) {
  const fallbackImages = {
    technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    business: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=400&h=200&fit=crop',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
    health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop',
    entertainment: 'https://images.unsplash.com/photo-1489599809505-f2d4cac355af?w=400&h=200&fit=crop',
    general: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=200&fit=crop'
  };
  
  return fallbackImages[category] || fallbackImages.general;
}

module.exports = router;