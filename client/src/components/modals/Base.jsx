import React, { useEffect } from 'react';
import { X, Package } from 'lucide-react';
import CloseButton from '../buttons/Close';
import SaveButton from '../buttons/Save';
import CancelButton from '../buttons/Cancel';

const BaseModal = ({ isOpen, onClose, onSave, children, title, saveText = "Salvar", cancelText = "Cancelar", description = "Configure as informações necessárias", tabs = null, activeTab = 'detalhes', onTabChange = null }) => {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-[999999] bg-gray-200/40"
        onClick={onClose}
      />

      {/* Modal base com animação de gaveta */}
      <div
        className="fixed top-0 right-0 h-full z-[1000000] transition-transform duration-300 ease-in-out w-full sm:w-1/2 lg:w-[40%] xl:w-[35%] max-w-2xl transform translate-x-0"
      >
        <div className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {/* Abas */}
            {tabs && (
              <div className="px-6 pb-4">
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => onTabChange && onTabChange(tab.key)}
                      className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
            {children}
          </div>

          {/* Footer */}
          {(saveText || cancelText) && (
            <div className="p-6 flex-shrink-0">
              <div className="flex gap-3">
                {cancelText && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
                  >
                    {cancelText}
                  </button>
                )}
                {saveText && (
                  <button
                    type="button"
                    onClick={onSave || onClose}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {saveText}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BaseModal;
