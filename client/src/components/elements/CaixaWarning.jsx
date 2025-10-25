import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

const CaixaWarning = ({ caixa, onOpenNewCaixa, onCancel }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateHoursOpen = (dataAbertura) => {
    const agora = new Date();
    const abertura = new Date(dataAbertura);
    const diffMs = agora - abertura;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours;
  };

  const hoursOpen = calculateHoursOpen(caixa.data_abertura);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header com ícone de aviso */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Caixa Aberto por Mais de 24 Horas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Este caixa pode afetar os relatórios
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Tempo de abertura: {hoursOpen} horas
              </span>
            </div>
            <div className="text-sm text-yellow-700">
              <p><strong>Data de abertura:</strong> {formatDate(caixa.data_abertura)}</p>
              <p><strong>Horário de abertura:</strong> {formatTime(caixa.data_abertura)}</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>
              Este caixa está aberto há mais de 24 horas. Isso não é um problema, 
              mas pode afetar a precisão dos relatórios. Recomendamos abrir um novo caixa.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onOpenNewCaixa}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Abrir Novo Caixa
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaixaWarning;
