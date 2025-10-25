import React from 'react';
import { Plus } from 'lucide-react';

const AddButton = ({ text, onClick, fullWidth = false, showIcon = true, size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-10' : 'h-12';
  const paddingClass = fullWidth ? 'w-full px-4' : 'w-12 sm:w-auto sm:px-4';

  return (
    <button
      onClick={onClick}
      className={`${heightClass} ${paddingClass} bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
    >
      {showIcon && <Plus size={18} />}
      <span className={fullWidth ? 'inline' : 'hidden sm:inline'}>{text}</span>
    </button>
  );
};

export default AddButton;
