// Mock Articles Data - Use this to test without a backend
export const mockArticles = [
  {
    _id: '1',
    title: 'Breakthrough in Artificial Intelligence Transforms Industry',
    description: 'New AI breakthrough promises to revolutionize how we work and interact with technology.',
    content: 'A major breakthrough in artificial intelligence has emerged, with researchers developing new algorithms that could transform multiple industries. The advancement promises faster processing, better accuracy, and more practical applications across healthcare, finance, and education sectors.',
    image: 'https://images.unsplash.com/photo-1677442d019cecf3b5d4d46d5b3b8f3e?w=800&h=500&fit=crop',
    category: 'Technology',
    source: 'TechNews Daily',
    author: 'John Smith',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/article/1',
    views: 1250,
  },
  {
    _id: '2',
    title: 'Global Markets React to Economic Policy Changes',
    description: 'Stock markets worldwide show mixed reactions following major economic policy announcements.',
    content: 'Global financial markets are experiencing significant movements following a series of economic policy announcements. Investors are carefully analyzing the implications for various sectors and regions. Analysts suggest this could shape investment strategies for the coming quarters.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
    category: 'Business',
    source: 'Financial Times',
    author: 'Jane Doe',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/article/2',
    views: 892,
  },
  {
    _id: '3',
    title: 'Team Wins Championship After Thrilling Final Match',
    description: 'In an incredible display of athleticism, the home team secures victory in the championship finals.',
    content: 'In a thrilling match that kept fans on the edge of their seats, the home team clinched the championship title. The victory comes after a season of dedication and training, with the team demonstrating exceptional skill and teamwork throughout the competition.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=500&fit=crop',
    category: 'Sports',
    source: 'Sports Weekly',
    author: 'Mike Johnson',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/article/3',
    views: 2341,
  },
  {
    _id: '4',
    title: 'New Treatment Shows Promise in Medical Research',
    description: 'Researchers announce positive results from clinical trials of innovative medical treatment.',
    content: 'A new medical treatment has shown remarkable promise in recent clinical trials. The breakthrough offers hope to millions of patients worldwide who suffer from chronic conditions. The research team believes this could lead to FDA approval within the next year.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
    category: 'Health',
    source: 'Medical Journal',
    author: 'Dr. Emily Chen',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/article/4',
    views: 1567,
  },
  {
    _id: '5',
    title: 'Award-Winning Film Breaks Box Office Records',
    description: 'Latest cinema blockbuster achieves unprecedented box office success on opening weekend.',
    content: 'A new film has broken box office records with its impressive opening weekend performance. Audiences worldwide have embraced the movie, praising both the storytelling and cinematography. Industry experts predict continued strong performance in the coming weeks.',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=500&fit=crop',
    category: 'Entertainment',
    source: 'Entertainment Weekly',
    author: 'Sarah Wilson',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/article/5',
    views: 3421,
  },
];

// Mock user data
export const mockUser = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  bio: 'News enthusiast and tech lover',
};

// Mock bookmarks
export const mockBookmarks = [];

// Mock preferences
export const mockPreferences = {
  categories: ['Technology', 'Business'],
  language: 'en',
  sources: ['TechNews Daily', 'Financial Times'],
  emailNotifications: true,
  pushNotifications: false,
};

// Mock credentials for testing
export const mockCredentials = {
  email: 'demo@example.com',
  password: 'demo123456',
  name: 'Demo User',
};