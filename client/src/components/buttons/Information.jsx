import React from 'react';
import { Info } from 'lucide-react';

const InformationButton = ({ onClick, disabled = false, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        text-gray-500 hover:text-gray-700 
        disabled:text-gray-300
        transition-colors duration-200 
        flex items-center justify-center
        disabled:cursor-not-allowed
        disabled:opacity-50
      `}
      title="Ver detalhes"
    >
      <Info size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
    </button>
  );
};

export default InformationButton;
