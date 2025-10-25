import React from 'react';

const Delete = ({ onClick, size = 'medium', className = "" }) => {
  const sizeClasses = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-2.5'
  };

  const iconSizes = {
    small: 14,
    medium: 16,
    large: 18
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-lg transition-all duration-200 hover:scale-105
        bg-red-100 text-red-600 hover:bg-red-200
        hover:animate-pulse
        ${className}
      `}
      title="Excluir"
    >
      <svg 
        className={`w-${iconSizes[size]/4} h-${iconSizes[size]/4}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        width={iconSizes[size]}
        height={iconSizes[size]}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};

export default Delete;


