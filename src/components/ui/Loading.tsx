import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  message = 'Cargando...' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-b-2 border-primary-500`}
      ></div>
      {message && (
        <p className="mt-4 text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
};

