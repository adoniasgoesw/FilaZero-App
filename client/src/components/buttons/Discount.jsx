import React from 'react';
import { Percent } from 'lucide-react';

const Discount = ({ onClick, size = 'medium', className = '' }) => {
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
        bg-green-100 text-green-600 hover:bg-green-200
        hover:animate-pulse
        ${className}
      `}
      title="Desconto"
    >
      <Percent size={iconSizes[size]} />
    </button>
  );
};

export default Discount;
