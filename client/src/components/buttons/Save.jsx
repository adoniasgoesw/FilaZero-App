import React from 'react';

const SaveButton = ({ children, onClick, disabled = false, className = "", fullWidth = false }) => {
  const baseClasses = "px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2";
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

export default SaveButton;
