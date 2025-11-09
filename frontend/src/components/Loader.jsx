import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400 animate-spin`} />
      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}