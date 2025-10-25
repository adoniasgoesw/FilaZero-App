import React from 'react';
import { Printer } from 'lucide-react';

const Print = ({ onClick, size = 'medium', className = '' }) => {
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
        bg-gray-200 text-gray-700 hover:bg-gray-300
        hover:animate-pulse
        ${className}
      `}
      title="Imprimir"
    >
      <Printer size={iconSizes[size]} />
    </button>
  );
};

export default Print;
