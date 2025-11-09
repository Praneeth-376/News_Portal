const API_BASE = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },
};

// Articles API calls
export const articlesAPI = {
  getArticles: async (filters = {}) => {
    try {
      const { category = 'general', country = 'us', page = 1, q = '' } = filters;
      const queryParams = new URLSearchParams({
        category,
        country,
        page: page.toString(),
        ...(q && { q })
      });

      const response = await fetch(`${API_BASE}/articles?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        // If API is down, return empty results instead of throwing error
        if (response.status === 500) {
          return {
            success: true,
            data: {
              articles: [],
              hasMore: false
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Articles API error:', error);
      // Return empty results instead of failing
      return {
        success: true,
        data: {
          articles: [],
          hasMore: false
        }
      };
    }
  },

  getArticle: async (id) => {
    const response = await fetch(`${API_BASE}/articles/${id}`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  // FRONTEND-ONLY: Simulate breaking news without API calls
  getBreakingNews: async () => {
    // Return simulated breaking news data
    const simulatedBreakingNews = [
      {
        title: "🚨 Breaking: Major Developments in Technology Sector",
        url: "#",
        source: { name: "NewsHub" },
        publishedAt: new Date().toISOString()
      },
      {
        title: "🚨 Urgent: Global Climate Summit Reaches Historic Agreement",
        url: "#", 
        source: { name: "NewsHub" },
        publishedAt: new Date().toISOString()
      },
      {
        title: "🚨 Latest: Economic Recovery Shows Strong Progress",
        url: "#",
        source: { name: "NewsHub" },
        publishedAt: new Date().toISOString()
      }
    ];

    return {
      success: true,
      data: {
        articles: simulatedBreakingNews
      }
    };
  }
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return await handleResponse(response);
  },
};

// Preferences API calls
export const preferencesAPI = {
  getPreferences: async () => {
    const response = await fetch(`${API_BASE}/preferences`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  updatePreferences: async (preferences) => {
    const response = await fetch(`${API_BASE}/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return await handleResponse(response);
  },
};