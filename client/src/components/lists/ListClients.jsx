import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Action from '../buttons/Action';
import { User, CreditCard, Phone, Mail } from 'lucide-react';

const ListClients = ({ 
  estabelecimentoId, 
  onEdit, 
  onDelete, 
  onStatusToggle, 
  onRefresh 
}) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchClients = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Buscando clientes para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/client/${estabelecimentoId}`);
      
      const response = await fetch(`${API_URL}/client/${estabelecimentoId}`);
      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setClientes(data.data.clientes);
        console.log('Clientes carregados:', data.data.clientes);
      } else {
        setError(data.message || 'Erro ao carregar clientes');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar clientes:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchClients();
    }
  }, [estabelecimentoId, fetchClients]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchClients(true));
    }
  }, [onRefresh, fetchClients]);

  const handleStatusToggle = (cliente) => {
    if (onStatusToggle) {
      onStatusToggle(cliente);
    }
  };

  const handleEdit = (cliente) => {
    if (onEdit) {
      onEdit(cliente);
    }
  };

  const handleDelete = (cliente) => {
    if (onDelete) {
      onDelete(cliente);
    }
  };

  const handleRowSelect = (clienteId, isSelected) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, clienteId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== clienteId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(clientes.map(cliente => cliente.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Função para verificar se há clientes mistos (ativos e inativos)
  const hasMixedStatus = () => {
    if (selectedRows.length === 0) return false;
    const selectedClients = clientes.filter(c => selectedRows.includes(c.id));
    const activeCount = selectedClients.filter(c => c.status).length;
    const inactiveCount = selectedClients.filter(c => !c.status).length;
    return activeCount > 0 && inactiveCount > 0;
  };

  // Função para verificar se todos os clientes selecionados estão ativos
  const allSelectedActive = () => {
    if (selectedRows.length === 0) return false;
    const selectedClients = clientes.filter(c => selectedRows.includes(c.id));
    return selectedClients.every(c => c.status);
  };

  // Função para lidar com ações em lote
  const handleBatchAction = (action) => {
    const selectedClients = clientes.filter(c => selectedRows.includes(c.id));
    
    switch (action) {
      case 'edit':
        if (selectedClients.length === 1) {
          handleEdit(selectedClients[0]);
        }
        break;
      case 'delete':
        if (selectedClients.length === 1) {
          handleDelete(selectedClients[0]);
        } else if (selectedClients.length > 1) {
          // Implementar exclusão em lote
          console.log('Excluir clientes selecionados:', selectedClients);
        }
        break;
      case 'activate':
        selectedClients.forEach(cliente => {
          if (!cliente.status) {
            handleStatusToggle(cliente);
          }
        });
        break;
      case 'deactivate':
        selectedClients.forEach(cliente => {
          if (cliente.status) {
            handleStatusToggle(cliente);
          }
        });
        break;
    }
  };

  // Coluna para mobile - apenas uma coluna (checkbox e nome)
  const mobileColumn = {
    key: 'cliente',
    header: 'Clientes',
    width: '100',
    align: 'left',
    render: (cliente) => (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(cliente)}>
        <input
          type="checkbox"
          checked={selectedRows.includes(cliente.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelect(cliente.id, e.target.checked);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {cliente.nome}
          </div>
        </div>
      </div>
    )
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'cliente',
      header: 'Cliente',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (cliente) => (
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => handleEdit(cliente)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(cliente.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(cliente.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div className="text-sm text-gray-700 truncate">
              {cliente.nome.length > 10 ? `${cliente.nome.substring(0, 10)}...` : cliente.nome}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {cliente.cpf_cnpj || '-'}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    ...smallColumns,
    {
      key: 'whatsapp',
      header: 'WhatsApp',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {cliente.whatsapp || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'E-mail',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {cliente.email || '-'}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'cliente',
      header: 'Cliente',
      width: '20',
      align: 'start',
      render: (cliente) => (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedRows.includes(cliente.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(cliente.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div className="text-sm text-gray-700">
              {cliente.nome.length > 20 ? `${cliente.nome.substring(0, 20)}...` : cliente.nome}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      width: '20',
      align: 'start',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {cliente.cpf_cnpj || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'whatsapp',
      header: 'WhatsApp',
      width: '20',
      align: 'start',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {cliente.whatsapp || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'E-mail',
      width: '20',
      align: 'start',
      render: (cliente) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {cliente.email || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20',
      align: 'start',
      render: (cliente) => (
        <div className="flex items-center space-x-1">
          <Status 
            isActive={cliente.status}
            onClick={() => handleStatusToggle(cliente)}
          />
          <Edit 
            onClick={() => handleEdit(cliente)}
          />
          <Delete 
            onClick={() => handleDelete(cliente)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Header com seleção */}
      <div className="px-6 py-4 bg-gray-50 rounded-t-lg min-h-[60px]">
        {/* Checkbox + Contador + Botão de Ações */}
        <div className="flex items-center justify-between">
          {clientes.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedRows.length === clientes.length && clientes.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedRows.length > 0 
                  ? `${selectedRows.length} de ${clientes.length} selecionados`
                  : `${clientes.length} clientes`
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
          data={clientes}
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

export default ListClients;

