import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, User, DollarSign, Clock } from 'lucide-react';
import ListBase from './ListBase';
import { API_URL } from '../../services/api';

const ListMovimentacoesCaixa = ({ onRefresh, caixaId }) => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovimentacoes();
  }, [caixaId]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchMovimentacoes);
    }
  }, [onRefresh]);

  const fetchMovimentacoes = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const response = await fetch(`${API_URL}/movimentacoes-caixa/${estabelecimentoId}`);
      const result = await response.json();
      
      if (result.success) {
        setMovimentacoes(result.data.movimentacoes);
      } else {
        setError(result.message || 'Erro ao carregar movimentações');
      }
    } catch (err) {
      console.error('Erro ao buscar movimentações:', err);
      setError('Erro de conexão com o servidor');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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

  const getTipoColor = (tipo) => {
    return tipo === 'entrada' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'entrada' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'data',
      header: 'Data',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (movimentacao) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(movimentacao.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(movimentacao.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'valor',
      header: 'Valor',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (movimentacao) => (
        <div className="text-right">
          <div className={`text-sm font-semibold ${movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
            {movimentacao.tipo === 'entrada' ? '+' : '-'} {formatCurrency(movimentacao.valor)}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    {
      key: 'data',
      header: 'Data',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (movimentacao) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(movimentacao.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(movimentacao.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (movimentacao) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(movimentacao.tipo)}`}>
          {getTipoIcon(movimentacao.tipo)}
          <span className="ml-1 capitalize">{movimentacao.tipo}</span>
        </span>
      )
    },
    {
      key: 'descricao',
      header: 'Descrição',
      width: '35',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (movimentacao) => (
        <div className="text-sm text-gray-900 truncate">
          {movimentacao.descricao}
        </div>
      )
    },
    {
      key: 'valor',
      header: 'Valor',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (movimentacao) => (
        <div className={`text-sm font-semibold ${movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
          {movimentacao.tipo === 'entrada' ? '+' : '-'} {formatCurrency(movimentacao.valor)}
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'data',
      header: 'Data',
      width: '20',
      align: 'start',
      render: (movimentacao) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(movimentacao.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(movimentacao.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '20',
      align: 'start',
      render: (movimentacao) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(movimentacao.tipo)}`}>
          {getTipoIcon(movimentacao.tipo)}
          <span className="ml-1 capitalize">{movimentacao.tipo}</span>
        </span>
      )
    },
    {
      key: 'descricao',
      header: 'Descrição',
      width: '20',
      align: 'start',
      render: (movimentacao) => (
        <div className="text-sm text-gray-700">
          {movimentacao.descricao}
        </div>
      )
    },
    {
      key: 'valor',
      header: 'Valor',
      width: '20',
      align: 'start',
      render: (movimentacao) => (
        <div className={`text-sm font-semibold ${movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
          {movimentacao.tipo === 'entrada' ? '+' : '-'} {formatCurrency(movimentacao.valor)}
        </div>
      )
    },
    {
      key: 'usuario_nome',
      header: 'Adicionado por',
      width: '20',
      align: 'start',
      render: (movimentacao) => (
        <div className="flex items-center justify-start gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div className="text-sm text-gray-700">
            {movimentacao.usuario_nome || 'N/A'}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Tabela com rolagem interna */}
      <div className="flex-1 overflow-hidden">
        <ListBase
          columns={largeColumns}
          data={movimentacoes}
          loading={loading}
          error={error}
          hasMarginTop={true}
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

export default ListMovimentacoesCaixa;