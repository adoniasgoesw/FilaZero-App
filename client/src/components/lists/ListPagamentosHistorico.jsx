import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, User, Info } from 'lucide-react';
import InformationButton from '../buttons/Information';
import ListBase from './ListBase';
import { API_URL } from '../../services/api';

const ListPagamentosHistorico = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const response = await fetch(`${API_URL}/pagamentos-historico/${estabelecimentoId}`);
      const result = await response.json();
      
      if (result.success) {
        setPagamentos(result.data.pagamentos);
      } else {
        setError(result.message || 'Erro ao carregar pagamentos');
      }
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
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


  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'dinheiro': return 'text-green-600 bg-green-100';
      case 'cartao': return 'text-blue-600 bg-blue-100';
      case 'pix': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderProgressBar = (porcentagem) => {
    const percentage = Math.min(Math.max(porcentagem || 0, 0), 100);
    const colorClass = percentage >= 100 ? 'bg-green-500' : 
                      percentage >= 75 ? 'bg-blue-500' : 
                      percentage >= 50 ? 'bg-yellow-500' : 
                      'bg-red-500';
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'pagamento_tipo',
      header: 'Pagamento',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (pagamento) => (
        <div>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(pagamento.pagamento_tipo)}`}>
            {pagamento.pagamento_tipo}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {pagamento.quantidade_pagamentos} pagamento(s)
          </div>
        </div>
      )
    },
    {
      key: 'valor_pago',
      header: 'Valor',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (pagamento) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(pagamento.valor_pago)}
          </div>
          <div className="mt-1">
            {renderProgressBar(pagamento.porcentagem)}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    {
      key: 'pagamento_tipo',
      header: 'Pagamento',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(pagamento.pagamento_tipo)}`}>
          {pagamento.pagamento_tipo}
        </span>
      )
    },
    {
      key: 'quantidade',
      header: 'Qtd',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <div className="text-sm text-gray-900 text-center justify-start">
          {pagamento.quantidade_pagamentos}
        </div>
      )
    },
    {
      key: 'valor_pago',
      header: 'Valor Total',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(pagamento.valor_pago)}
          </div>
        </div>
      )
    },
    {
      key: 'porcentagem',
      header: 'Progresso',
      width: '25',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <div className="w-full">
          {renderProgressBar(pagamento.porcentagem)}
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'pagamento_tipo',
      header: 'Pagamento',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(pagamento.pagamento_tipo)}`}>
          {pagamento.pagamento_tipo}
        </span>
      )
    },
    {
      key: 'quantidade',
      header: 'Quantidade',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="text-sm text-gray-700 text-center">
          {pagamento.quantidade_pagamentos}
        </div>
      )
    },
    {
      key: 'valor_pago',
      header: 'Valor Total',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {formatCurrency(pagamento.valor_pago)}
          </div>
        </div>
      )
    },
    {
      key: 'porcentagem',
      header: 'Progresso',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="w-full">
          {renderProgressBar(pagamento.porcentagem)}
        </div>
      )
    },
    {
      key: 'detalhes',
      header: 'Detalhes',
      width: '20',
      align: 'start',
      render: () => (
        <div className="flex items-center justify-center">
          <Info className="w-4 h-4 text-gray-400" />
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
          data={pagamentos}
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

export default ListPagamentosHistorico;
