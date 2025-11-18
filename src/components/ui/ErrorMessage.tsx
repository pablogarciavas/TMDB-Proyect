import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-beige-light border border-dark/20 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">❌</span>
          <h3 className="text-xl font-semibold text-dark">Error</h3>
        </div>
        <p className="text-dark-medium mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full btn-primary"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

