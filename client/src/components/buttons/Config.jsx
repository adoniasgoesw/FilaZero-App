import React from 'react';
import { Settings } from 'lucide-react';

const ConfigButton = ({ onClick, className = "", size = 20 }) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105 ${className}`}
      title="Configurações"
    >
      <Settings size={size} />
    </button>
  );
};

export default ConfigButton;

