import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Action from '../buttons/Action';
import { CreditCard, Percent, Building, CheckCircle, XCircle } from 'lucide-react';

const ListPayments = ({ 
  estabelecimentoId, 
  onEdit, 
  onDelete, 
  onStatusToggle, 
  onRefresh 
}) => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchPayments = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      console.log('Buscando pagamentos para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/payments/${estabelecimentoId}`);

      const response = await fetch(`${API_URL}/payments/${estabelecimentoId}`);
      const data = await response.json();

      console.log('Resposta da API:', data);

      if (data.success) {
        setPagamentos(data.data.pagamentos);
        console.log('Pagamentos carregados:', data.data.pagamentos);
      } else {
        setError(data.message || 'Erro ao carregar pagamentos');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar pagamentos:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchPayments();
    }
  }, [estabelecimentoId, fetchPayments]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchPayments(true));
    }
  }, [onRefresh, fetchPayments]);

  const handleStatusToggle = (pagamento) => {
    if (onStatusToggle) {
      onStatusToggle(pagamento);
    }
  };

  const handleEdit = (pagamento) => {
    if (onEdit) {
      onEdit(pagamento);
    }
  };

  const handleDelete = (pagamento) => {
    if (onDelete) {
      onDelete(pagamento);
    }
  };

  const handleRowSelect = (pagamentoId, isSelected) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, pagamentoId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== pagamentoId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(pagamentos.map(pagamento => pagamento.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Função para verificar se há pagamentos mistos (ativos e inativos)
  const hasMixedStatus = () => {
    if (selectedRows.length === 0) return false;
    const selectedPayments = pagamentos.filter(p => selectedRows.includes(p.id));
    const activeCount = selectedPayments.filter(p => p.status).length;
    const inactiveCount = selectedPayments.filter(p => !p.status).length;
    return activeCount > 0 && inactiveCount > 0;
  };

  // Função para verificar se todos os pagamentos selecionados estão ativos
  const allSelectedActive = () => {
    if (selectedRows.length === 0) return false;
    const selectedPayments = pagamentos.filter(p => selectedRows.includes(p.id));
    return selectedPayments.every(p => p.status);
  };

  // Função para lidar com ações em lote
  const handleBatchAction = (action) => {
    const selectedPayments = pagamentos.filter(p => selectedRows.includes(p.id));

    switch (action) {
      case 'edit':
        if (selectedPayments.length === 1) {
          handleEdit(selectedPayments[0]);
        }
        break;
      case 'delete':
        if (selectedPayments.length === 1) {
          handleDelete(selectedPayments[0]);
        } else if (selectedPayments.length > 1) {
          // Implementar exclusão em lote
          console.log('Excluir pagamentos selecionados:', selectedPayments);
        }
        break;
      case 'activate':
        selectedPayments.forEach(pagamento => {
          if (!pagamento.status) {
            handleStatusToggle(pagamento);
          }
        });
        break;
      case 'deactivate':
        selectedPayments.forEach(pagamento => {
          if (pagamento.status) {
            handleStatusToggle(pagamento);
          }
        });
        break;
    }
  };

  // Coluna para mobile - apenas uma coluna (checkbox e nome)
  const mobileColumn = {
    key: 'pagamento',
    header: 'Pagamentos',
    width: '100',
    align: 'left',
    render: (pagamento) => (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(pagamento)}>
        <input
          type="checkbox"
          checked={selectedRows.includes(pagamento.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelect(pagamento.id, e.target.checked);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {pagamento.nome}
          </div>
        </div>
      </div>
    )
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'pagamento',
      header: 'Pagamento',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (pagamento) => (
        <div
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => handleEdit(pagamento)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(pagamento.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(pagamento.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="text-sm text-gray-700 truncate">
            {pagamento.nome.length > 10 ? `${pagamento.nome.substring(0, 10)}...` : pagamento.nome}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (pagamento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pagamento.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {pagamento.status ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    ...smallColumns,
    {
      key: 'taxa',
      header: 'Taxa',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <div className="flex items-center space-x-2">
          <Percent className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {pagamento.taxa ? `${pagamento.taxa}%` : '0%'}
          </div>
        </div>
      )
    },
    {
      key: 'conta_bancaria',
      header: 'Conta Bancária',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (pagamento) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {pagamento.conta_bancaria || '-'}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'pagamento',
      header: 'Pagamento',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedRows.includes(pagamento.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(pagamento.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="text-sm text-gray-700">
            {pagamento.nome.length > 20 ? `${pagamento.nome.substring(0, 20)}...` : pagamento.nome}
          </div>
        </div>
      )
    },
    {
      key: 'taxa',
      header: 'Taxa',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="flex items-center space-x-2">
          <Percent className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {pagamento.taxa ? `${pagamento.taxa}%` : '0%'}
          </div>
        </div>
      )
    },
    {
      key: 'conta_bancaria',
      header: 'Conta Bancária',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {pagamento.conta_bancaria || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pagamento.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {pagamento.status ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20',
      align: 'start',
      render: (pagamento) => (
        <div className="flex items-center space-x-1">
          <Status 
            isActive={pagamento.status}
            onClick={() => handleStatusToggle(pagamento)}
          />
          <Edit 
            onClick={() => handleEdit(pagamento)}
          />
          <Delete 
            onClick={() => handleDelete(pagamento)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Header com seleção */}
      <div className="px-6 py-4 bg-gray-50 rounded-t-lg min-h-[60px] ">
        {/* Checkbox + Contador + Botão de Ações */}
        <div className="flex items-center justify-between">
          {pagamentos.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedRows.length === pagamentos.length && pagamentos.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedRows.length > 0
                  ? `${selectedRows.length} de ${pagamentos.length} selecionados`
                  : `${pagamentos.length} pagamentos`
                }
              </span>
            </div>
          )}

          {/* Botão de ações quando há seleção */}
          {selectedRows.length > 0 && (
            <Action
              onEdit={() => handleBatchAction('edit')}
              onActivate={() => handleBatchAction('activate')}
              onDeactivate={() => handleBatchAction('deactivate')}
              onDelete={() => handleBatchAction('delete')}
              isActive={allSelectedActive()}
              hasMixedStatus={hasMixedStatus()}
              showMixedActions={hasMixedStatus()}
            />
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1">
        <ListBase
          columns={largeColumns}
          data={pagamentos}
          loading={loading}
          error={error}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          mobileColumn={mobileColumn}
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

export default ListPayments;
