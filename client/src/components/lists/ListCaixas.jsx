import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Info, Clock } from 'lucide-react';
import InformationButton from '../buttons/Information';
import ListBase from './ListBase';
import { API_URL } from '../../services/api';

const ListCaixas = ({ onCaixaClick }) => {
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCaixas();
  }, []);

  const fetchCaixas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const response = await fetch(`${API_URL}/caixas/fechadas/${estabelecimentoId}`);
      const result = await response.json();
      
      if (result.success) {
        setCaixas(result.data.caixas);
      } else {
        setError(result.message || 'Erro ao carregar caixas');
      }
    } catch (err) {
      console.error('Erro ao buscar caixas:', err);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

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

  const getDiferencaColor = (diferenca) => {
    if (diferenca > 0) return 'text-green-600';
    if (diferenca < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDiferencaIcon = (diferenca) => {
    if (diferenca > 0) return '↗';
    if (diferenca < 0) return '↘';
    return '→';
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'data_abertura',
      header: 'Data de Abertura',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (caixa) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700">
              {formatDate(caixa.data_abertura)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(caixa.data_abertura)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'valor_abertura',
      header: 'Valor de Abertura',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (caixa) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(caixa.valor_abertura)}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    {
      key: 'data_abertura',
      header: 'Data de Abertura',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (caixa) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700">
              {formatDate(caixa.data_abertura)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(caixa.data_abertura)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'valor_abertura',
      header: 'Valor de Abertura',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (caixa) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(caixa.valor_abertura)}
          </div>
        </div>
      )
    },
    {
      key: 'valor_fechamento',
      header: 'Valor de Fechamento',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (caixa) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(caixa.valor_fechamento)}
          </div>
        </div>
      )
    },
    {
      key: 'diferenca',
      header: 'Diferença',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (caixa) => (
        <div className={`flex items-center justify-end gap-1 ${getDiferencaColor(caixa.diferenca)}`}>
          <span className="text-lg">{getDiferencaIcon(caixa.diferenca)}</span>
          <span className="font-semibold">{formatCurrency(caixa.diferenca)}</span>
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'data_abertura',
      header: 'Data de Abertura',
      width: '20',
      align: 'start',
      render: (caixa) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700">
              {formatDate(caixa.data_abertura)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(caixa.data_abertura)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'valor_abertura',
      header: 'Valor de Abertura',
      width: '20',
      align: 'start',
      render: (caixa) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(caixa.valor_abertura)}
          </div>
        </div>
      )
    },
    {
      key: 'valor_fechamento',
      header: 'Valor de Fechamento',
      width: '20',
      align: 'start',
      render: (caixa) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(caixa.valor_fechamento)}
          </div>
        </div>
      )
    },
    {
      key: 'diferenca',
      header: 'Diferença',
      width: '20',
      align: 'start',
      render: (caixa) => (
        <div className={`flex items-center justify-end gap-1 ${getDiferencaColor(caixa.diferenca)}`}>
          <span className="text-lg">{getDiferencaIcon(caixa.diferenca)}</span>
          <span className="font-semibold">{formatCurrency(caixa.diferenca)}</span>
        </div>
      )
    },
    {
      key: 'detalhes',
      header: 'Detalhes',
      width: '20',
      align: 'start',
      render: (caixa) => (
        <div className="flex items-center justify-start">
          <InformationButton
            onClick={() => onCaixaClick && onCaixaClick(caixa)}
            size="small"
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Tabela */}
      <div className="flex-1">
        <ListBase
          columns={largeColumns}
          data={caixas}
          loading={loading}
          error={error}
          responsiveColumns={{
            small: smallColumns,
            medium: mediumColumns,
            large: largeColumns
          }}
        />
      </div>
    </div>
  );
};

export default ListCaixas;
