import React from 'react';
import { Power } from 'lucide-react';

const Status = ({ isActive, onClick, disabled = false, className = "" }) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        p-2 rounded-lg transition-all duration-200 hover:scale-105
        ${isActive
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-red-100 text-red-600 hover:bg-red-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}
      `}
      title={disabled ? 'Não é possível alterar status' : (isActive ? 'Desativar' : 'Ativar')}
    >
      <Power className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
    </button>
  );
};

export default Status;