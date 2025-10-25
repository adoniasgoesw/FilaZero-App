import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Action = ({ 
  onEdit, 
  onActivate, 
  onDeactivate, 
  onDelete, 
  isActive = true,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'edit' && onEdit) {
      onEdit();
    } else if (action === 'activate' && onActivate) {
      onActivate();
    } else if (action === 'deactivate' && onDeactivate) {
      onDeactivate();
    } else if (action === 'delete' && onDelete) {
      onDelete();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        <span>Ações</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Editar */}
            <button
              onClick={() => handleAction('edit')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              Editar
            </button>
            
            {/* Ativar/Desativar */}
            {isActive ? (
              <button
                onClick={() => handleAction('deactivate')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                Desativar
              </button>
            ) : (
              <button
                onClick={() => handleAction('activate')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                Ativar
              </button>
            )}
            
            {/* Excluir */}
            <button
              onClick={() => handleAction('delete')}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Action;



