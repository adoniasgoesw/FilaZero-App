import React from 'react';
import { Utensils } from 'lucide-react';

const Kitchen = ({ onClick, size = 'medium', className = '' }) => {
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
        bg-blue-100 text-blue-600 hover:bg-blue-200
        hover:animate-pulse
        ${className}
      `}
      title="Cozinha"
    >
      <Utensils size={iconSizes[size]} />
    </button>
  );
};

export default Kitchen;
