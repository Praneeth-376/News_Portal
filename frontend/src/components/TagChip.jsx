import { X } from 'lucide-react';

export default function TagChip({
  label,
  onRemove,
  variant = 'default',
  clickable = false,
  onClick,
}) {
  const variantClasses = {
    default: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${variantClasses[variant]} ${
        clickable ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:scale-110 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}