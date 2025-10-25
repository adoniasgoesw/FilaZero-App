import React from 'react';
import { DollarSign } from 'lucide-react';

const Increase = ({ onClick, size = 'medium', className = '' }) => {
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
        bg-yellow-100 text-yellow-600 hover:bg-yellow-200
        hover:animate-pulse
        ${className}
      `}
      title="Acréscimo"
    >
      <DollarSign size={iconSizes[size]} />
    </button>
  );
};

export default Increase;
