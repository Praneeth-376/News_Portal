import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-200 dark:border-red-900">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We encountered an unexpected error. Please try refreshing the page or go back home.
            </p>

            {/* Error Details (Dev Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-32 border border-gray-300 dark:border-slate-700">
                <p className="font-bold mb-2">Error Details:</p>
                <p>{this.state.error.toString()}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;