import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, CreditCard, Info, Clock } from 'lucide-react';
import InformationButton from '../buttons/Information';
import ListBase from './ListBase';
import { API_URL } from '../../services/api';

const ListPedidosHistorico = ({ onPedidoClick }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const response = await fetch(`${API_URL}/pedidos-historico/${estabelecimentoId}`);
      const result = await response.json();
      
      if (result.success) {
        setPedidos(result.data.pedidos);
      } else {
        setError(result.message || 'Erro ao carregar pedidos');
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
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


  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'criado_em',
      header: 'Data',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (pedido) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(pedido.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(pedido.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'valor_total',
      header: 'Valor Total',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (pedido) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(pedido.valor_total)}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    {
      key: 'criado_em',
      header: 'Data',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pedido) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(pedido.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(pedido.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cliente_nome',
      header: 'Cliente',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pedido) => (
        <div className="text-sm text-gray-900">
          {pedido.cliente_nome || 'N/A'}
        </div>
      )
    },
    {
      key: 'valor_total',
      header: 'Valor Total',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pedido) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(pedido.valor_total)}
          </div>
        </div>
      )
    },
    {
      key: 'usuario_nome',
      header: 'Vendido Por',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pedido) => (
        <div className="text-sm text-gray-900">
          {pedido.usuario_nome || 'N/A'}
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'criado_em',
      header: 'Data',
      width: '20',
      align: 'start',
      render: (pedido) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(pedido.criado_em)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(pedido.criado_em)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cliente_nome',
      header: 'Cliente',
      width: '20',
      align: 'start',
      render: (pedido) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {pedido.cliente_nome || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'valor_total',
      header: 'Valor Total',
      width: '20',
      align: 'start',
      render: (pedido) => (
        <div className="flex items-center justify-start space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(pedido.valor_total)}
          </div>
        </div>
      )
    },
    {
      key: 'usuario_nome',
      header: 'Vendido Por',
      width: '20',
      align: 'start',
      render: (pedido) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {pedido.usuario_nome || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'detalhes',
      header: 'Detalhes',
      width: '20',
      align: 'start',
      render: (pedido) => (
        <div className="flex items-center justify-start">
          <InformationButton
            onClick={() => onPedidoClick && onPedidoClick(pedido)}
            size="small"
          />
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
          data={pedidos}
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

export default ListPedidosHistorico;
