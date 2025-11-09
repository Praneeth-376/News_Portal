import axios from 'axios';
import { mockArticles, mockUser, mockPreferences } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_MOCK_API = true; // Set to false when backend is ready

// Persistent storage for mock bookmarks
let mockBookmarks = [];

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (USE_MOCK_API) {
  // Mock API Interceptor
  api.interceptors.request.use((config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { url, method, data } = config;

        // Authentication
        if (url === '/auth/register' || url === '/auth/login') {
          config.mockResponse = {
            status: 200,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              user: mockUser,
            },
          };
        }
        // Get Articles
        else if (url === '/articles' && method === 'get') {
          const searchParams = new URLSearchParams(config.params || {});
          let filteredArticles = mockArticles;

          const search = searchParams.get('search');
          if (search) {
            filteredArticles = filteredArticles.filter(
              (a) =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.description.toLowerCase().includes(search.toLowerCase())
            );
          }

          const category = searchParams.get('category');
          if (category && category !== 'all') {
            filteredArticles = filteredArticles.filter((a) => a.category === category);
          }

          const page = parseInt(searchParams.get('page') || '1');
          const limit = parseInt(searchParams.get('limit') || '12');
          const start = (page - 1) * limit;
          const paginatedArticles = filteredArticles.slice(start, start + limit);

          config.mockResponse = {
            status: 200,
            data: {
              articles: paginatedArticles,
              totalPages: Math.ceil(filteredArticles.length / limit),
              total: filteredArticles.length,
            },
          };
        }
        // Get Single Article
        else if (url.includes('/articles/') && !url.includes('/summary') && method === 'get') {
          const id = url.split('/articles/')[1];
          const article = mockArticles.find((a) => a._id === id) || mockArticles[0];
          config.mockResponse = {
            status: 200,
            data: { article },
          };
        }
        // Get Article Summary
        else if (url.includes('/articles/') && url.includes('/summary') && method === 'get') {
          config.mockResponse = {
            status: 200,
            data: {
              summary:
                'This is an AI-generated summary of the article. ' +
                'It provides key points and main information in a concise format. ' +
                'Perfect for quick understanding of the article content.',
            },
          };
        }
        // Get Bookmarks
        else if (url === '/bookmarks' && method === 'get') {
          const bookmarkedArticles = mockArticles.filter((a) =>
            mockBookmarks.includes(a._id)
          );
          config.mockResponse = {
            status: 200,
            data: {
              bookmarks: bookmarkedArticles,
              total: bookmarkedArticles.length,
            },
          };
        }
        // Add Bookmark
        else if (url === '/bookmarks' && method === 'post') {
          const { articleId } = data;
          if (!mockBookmarks.includes(articleId)) {
            mockBookmarks.push(articleId);
          }
          config.mockResponse = {
            status: 201,
            data: { success: true, message: 'Bookmark added' },
          };
        }
        // Delete Bookmark
        else if (url.includes('/bookmarks/') && method === 'delete') {
          const id = url.split('/bookmarks/')[1];
          mockBookmarks = mockBookmarks.filter((bid) => bid !== id);
          config.mockResponse = {
            status: 200,
            data: { success: true, message: 'Bookmark removed' },
          };
        }
        // Get User Preferences
        else if (url === '/user/preferences' && method === 'get') {
          config.mockResponse = {
            status: 200,
            data: { preferences: mockPreferences },
          };
        }
        // Update User Preferences
        else if (url === '/user/preferences' && method === 'put') {
          config.mockResponse = {
            status: 200,
            data: { preferences: data, message: 'Preferences updated' },
          };
        }
        // Update User Profile
        else if (url === '/user/profile' && method === 'put') {
          config.mockResponse = {
            status: 200,
            data: { user: { ...mockUser, ...data }, message: 'Profile updated' },
          };
        }
        // Admin Stats
        else if (url === '/admin/stats' && method === 'get') {
          config.mockResponse = {
            status: 200,
            data: {
              stats: {
                totalUsers: 1250,
                totalArticles: 5480,
                totalBookmarks: mockBookmarks.length,
                activeUsers: 340,
              },
            },
          };
        }
        // Default fallback
        else {
          config.mockResponse = {
            status: 200,
            data: { success: true },
          };
        }

        resolve(config);
      }, 300); // Simulate network delay
    });
  });

  api.interceptors.response.use(
    (response) => {
      if (response.config.mockResponse) {
        return response.config.mockResponse;
      }
      return response;
    },
    (error) => {
      console.error('Mock API Error:', error);
      return Promise.reject(error);
    }
  );
} else {
  // Real API Interceptors
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);

      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (error.response?.status === 500) {
        console.error('Backend server error (500)');
      }

      if (!error.response) {
        console.error('Network error - Backend may not be running on:', API_URL);
      }

      return Promise.reject(error);
    }
  );
}

export default api;