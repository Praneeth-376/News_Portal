import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Bookmark, Home, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Preferences', icon: Settings, href: '/preferences' },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center transform group-hover:scale-105 transition">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">
              NewsHub
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 max-w-sm">
            <div className="w-full relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user && navLinks.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                to={href}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                title={label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <DarkModeToggle />

            {/* Desktop Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-slate-800 pt-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
              </div>
            </form>

            {user && (
              <>
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>

                <div className="space-y-1">
                  {navLinks.map(({ label, icon: Icon, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}