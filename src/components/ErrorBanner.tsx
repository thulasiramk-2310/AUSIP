import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 mb-8 flex items-start space-x-4">
      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-red-400 mb-1">Error</h3>
        <p className="text-gray-300">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
