import { useState, useEffect } from 'react';
import { Save, Settings, Globe, Bell } from 'lucide-react';
import api from '../api';

export default function Preferences() {
  const [preferences, setPreferences] = useState({
    categories: [],
    language: 'en',
    sources: [],
    emailNotifications: true,
    pushNotifications: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Technology', 'Business', 'Sports', 'Health', 'Entertainment', 'Science', 'Politics'];
  const languages = ['en', 'es', 'fr', 'de', 'zh'];
  const sources = ['BBC', 'Reuters', 'AP News', 'CNN', 'The Guardian', 'TechCrunch', 'Bloomberg'];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/preferences');
      setPreferences(response.data.preferences || {
        categories: [],
        language: 'en',
        sources: [],
        emailNotifications: true,
        pushNotifications: false,
      });
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSourceToggle = (source) => {
    setPreferences(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source],
    }));
  };

  const handleLanguageChange = (lang) => {
    setPreferences(prev => ({ ...prev, language: lang }));
  };

  const handleNotificationToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/user/preferences', preferences);
      setSuccess('Preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Preferences</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your news experience
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
            <p className="text-green-700 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Preferences Sections */}
        <div className="space-y-6">
          {/* Language Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    preferences.language === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Interested Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* News Sources */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Preferred News Sources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map(source => (
                <label key={source} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sources.includes(source)}
                    onChange={() => handleSourceToggle(source)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{source}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={() => handleNotificationToggle('pushNotifications')}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}