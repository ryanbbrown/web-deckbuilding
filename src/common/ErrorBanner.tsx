import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div
      className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
      data-testid="error-message"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <p className="text-red-800">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
