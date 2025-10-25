import React from 'react';

const CardBase = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`bg-white border border-gray-100 rounded-2xl shadow-lg p-8 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default CardBase;
