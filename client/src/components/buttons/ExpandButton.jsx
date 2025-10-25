import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ExpandButton = ({ isExpanded, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white 
        flex items-center justify-center transition-all duration-200 
        hover:scale-110 active:scale-95 shadow-md hover:shadow-lg
        ${isExpanded ? 'animate-bounce' : 'animate-pulse'}
        ${className}
      `}
      title={isExpanded ? 'Reduzir lista' : 'Expandir lista'}
    >
      {isExpanded ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4 animate-bounce" />
      )}
    </button>
  );
};

export default ExpandButton;

