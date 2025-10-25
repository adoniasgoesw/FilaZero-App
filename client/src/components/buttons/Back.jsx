import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ children, onClick, disabled = false, className = '', isRound = false, iconSize = 24, size = 'default' }) => {
  if (isRound) {
    const sizeClasses = size === 'small' 
      ? 'w-10 h-10' 
      : 'w-12 h-12';
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses} rounded-full bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ${className}`}
      >
        <ArrowLeft size={iconSize} />
      </button>
    );
  }

  return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      >
        <ArrowLeft size={iconSize} />
        {children}
      </button>
  );
};

export default BackButton;
