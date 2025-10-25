import React from 'react';
import { Plus, X } from 'lucide-react';

const CaixaActionButton = ({ isOpen, onClick, disabled = false }) => {
  if (isOpen) {
    // Botão laranja para fechar caixa
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="h-12 w-12 sm:w-auto sm:px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={20} />
        <span className="hidden sm:inline">Fechar Caixa</span>
      </button>
    );
  } else {
    // Botão azul para novo caixa
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="h-12 w-12 sm:w-auto sm:px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">Novo Caixa</span>
      </button>
    );
  }
};

export default CaixaActionButton;
