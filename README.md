# 📰 NewsHub Pro - MERN Stack News Portal

![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![Render](https://img.shields.io/badge/Deployed%20on-Render-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)
![MERN](https://img.shields.io/badge/Stack-MERN-red)

## 🎯 Live Demo

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-brightgreen)](https://news-portal-5oxi9lyyo-praneeth-376s-projects.vercel.app)

**🌐 Live Application:** [https://news-portal-5oxi9lyyo-praneeth-376s-projects.vercel.app](https://news-portal-5oxi9lyyo-praneeth-376s-projects.vercel.app)

**🔗 API Base URL:** [https://news-portal-zs8s.onrender.com/api](https://news-portal-zs8s.onrender.com/api)

---

## 📸 Screenshots
| Home Page | Article View | Dark Mode |
|-----------|-------------|-----------|
| ![Home](screenshots/home.png) | ![Article](screenshots/article.png) | ![Dark](screenshots/dark-mode.png) |

## 🚀 Features

### 🔥 Core Features
- **Infinite Scroll** - Seamless pagination with intersection observer
- **Breaking News Ticker** - Real-time scrolling news alerts
- **Advanced Search** - Debounced search with instant results
- **Bookmark System** - Save articles with local storage
- **Dark/Light Theme** - Toggleable UI themes
- **Responsive Design** - Mobile-first responsive layout

### 👤 User Features
- **JWT Authentication** - Secure user registration/login
- **Personalized Feed** - AI-powered content recommendations
- **Category Preferences** - Customizable news categories
- **Reading History** - Track user reading patterns
- **Multi-language Support** - News from different countries

### 🛠️ Technical Features
- **RESTful API** - Clean API architecture
- **Real-time Updates** - WebSocket integration for live news
- **Image Optimization** - Lazy loading and error handling
- **Performance Optimized** - Code splitting and caching
- **PWA Ready** - Progressive Web App capabilities

## 🏗️ Project Architecture
personalized-news-portal/
├── 📁 frontend/ # React.js Client
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Route pages
│ │ ├── services/ # API services
│ │ ├── context/ # State management
│ │ └── hooks/ # Custom React hooks
│ └── public/
│
├── 📁 backend/ # Express.js Server
│ ├── controllers/ # Route controllers
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── middleware/ # Auth & validation
│ └── config/ # Database config
│
├── 📁 ai-service/ # Python AI Microservice
│ ├── recommendation/ # ML models
│ ├── nlp/ # Text processing
│ └── api/ # FastAPI endpoints


## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **React Context** - State management
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with gradients
- **Intersection Observer API** - Infinite scroll

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### AI/ML Service
- **Python** - Machine learning
- **FastAPI** - API framework
- **NLTK/Spacy** - NLP processing
- **Scikit-learn** - ML algorithms

### APIs & Services
- **News API** - News data source
- **RESTful APIs** - Custom endpoints
- **WebSocket** - Real-time features

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Python 3.8+ (for AI service)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/personalized-news-portal.git
cd personalized-news-portal

