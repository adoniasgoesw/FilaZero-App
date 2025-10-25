import React from 'react';

const CancelButton = ({ children, onClick, disabled = false, className = "", fullWidth = false }) => {
  const baseClasses = "px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  const widthClass = fullWidth ? "flex-1" : "";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default CancelButton;
