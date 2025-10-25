import React from 'react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick, variant = "default", className = "" }) => {
  const baseClasses = "w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200";
  
  const variantClasses = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800",
    minimal: "bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600",
    danger: "bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <X size={20} />
    </button>
  );
};

export default CloseButton;