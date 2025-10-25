import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Action from '../buttons/Action';
import { User, CreditCard, Briefcase } from 'lucide-react';

const ListUsers = ({ 
  estabelecimentoId, 
  onEdit, 
  onDelete, 
  onStatusToggle, 
  onRefresh 
}) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [adminCount, setAdminCount] = useState(0);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Buscando usuários para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/users/${estabelecimentoId}`);
      
      const response = await fetch(`${API_URL}/users/${estabelecimentoId}`);
      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setUsuarios(data.data.usuarios);
        console.log('Usuários carregados:', data.data.usuarios);
        
        // Contar administradores ativos
        const activeAdmins = data.data.usuarios.filter(u => u.cargo === 'Administrador' && u.status);
        setAdminCount(activeAdmins.length);
      } else {
        setError(data.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchUsers();
    }
  }, [estabelecimentoId, fetchUsers]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchUsers(true));
    }
  }, [onRefresh, fetchUsers]);

  // Verificar se é único administrador
  const isOnlyAdmin = (usuario) => {
    return usuario.cargo === 'Administrador' && adminCount === 1;
  };

  const handleStatusToggle = (usuario) => {
    if (isOnlyAdmin(usuario)) {
      return; // Não faz nada se for único administrador
    }
    if (onStatusToggle) {
      onStatusToggle(usuario);
    }
  };

  const handleEdit = (usuario) => {
    if (onEdit) {
      onEdit(usuario);
    }
  };

  const handleDelete = (usuario) => {
    if (isOnlyAdmin(usuario)) {
      return; // Não faz nada se for único administrador
    }
    if (onDelete) {
      onDelete(usuario);
    }
  };

  const handleRowSelect = (usuarioId, isSelected) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, usuarioId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== usuarioId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(usuarios.map(usuario => usuario.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Função para verificar se há usuários mistos (ativos e inativos)
  const hasMixedStatus = () => {
    if (selectedRows.length === 0) return false;
    const selectedUsers = usuarios.filter(u => selectedRows.includes(u.id));
    const activeCount = selectedUsers.filter(u => u.status).length;
    const inactiveCount = selectedUsers.filter(u => !u.status).length;
    return activeCount > 0 && inactiveCount > 0;
  };

  // Função para verificar se todos os usuários selecionados estão ativos
  const allSelectedActive = () => {
    if (selectedRows.length === 0) return false;
    const selectedUsers = usuarios.filter(u => selectedRows.includes(u.id));
    return selectedUsers.every(u => u.status);
  };

  // Função para lidar com ações em lote
  const handleBatchAction = (action) => {
    const selectedUsers = usuarios.filter(u => selectedRows.includes(u.id));
    
    switch (action) {
      case 'edit':
        if (selectedUsers.length === 1) {
          handleEdit(selectedUsers[0]);
        }
        break;
      case 'delete':
        if (selectedUsers.length === 1) {
          handleDelete(selectedUsers[0]);
        } else if (selectedUsers.length > 1) {
          // Implementar exclusão em lote
          console.log('Excluir usuários selecionados:', selectedUsers);
        }
        break;
      case 'activate':
        selectedUsers.forEach(usuario => {
          if (!usuario.status) {
            handleStatusToggle(usuario);
          }
        });
        break;
      case 'deactivate':
        selectedUsers.forEach(usuario => {
          if (usuario.status) {
            handleStatusToggle(usuario);
          }
        });
        break;
    }
  };

  // Coluna para mobile - apenas uma coluna (checkbox e nome)
  const mobileColumn = {
    key: 'usuario',
    header: 'Usuários',
    width: '100',
    align: 'left',
    render: (usuario) => (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(usuario)}>
        <input
          type="checkbox"
          checked={selectedRows.includes(usuario.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelect(usuario.id, e.target.checked);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {usuario.nome_completo}
          </div>
        </div>
      </div>
    )
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'usuario',
      header: 'Usuário',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (usuario) => (
        <div
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 group"
          onClick={() => handleEdit(usuario)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(usuario.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(usuario.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
              {usuario.nome_completo.length > 10 ? `${usuario.nome_completo.substring(0, 10)}...` : usuario.nome_completo}
            </div>
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
      render: (usuario) => (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            usuario.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {usuario.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    {
      key: 'usuario',
      header: 'Usuário',
      width: '20',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (usuario) => (
        <div
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 group"
          onClick={() => handleEdit(usuario)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(usuario.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(usuario.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
              {usuario.nome_completo.length > 15 ? `${usuario.nome_completo.substring(0, 15)}...` : usuario.nome_completo}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cpf',
      header: 'CPF',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/5',
      render: (usuario) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate font-mono">
            {usuario.cpf ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'cargo',
      header: 'Cargo',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/5',
      render: (usuario) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 font-medium">
            {usuario.cargo || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/5',
      render: (usuario) => (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            usuario.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {usuario.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'usuario',
      header: 'Usuário',
      width: '20',
      align: 'start',
      render: (usuario) => (
        <div className="flex items-center space-x-3 group">
          <input
            type="checkbox"
            checked={selectedRows.includes(usuario.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(usuario.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div 
              className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200"
              onClick={() => handleEdit(usuario)}
            >
              {usuario.nome_completo.length > 25 ? `${usuario.nome_completo.substring(0, 25)}...` : usuario.nome_completo}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cpf',
      header: 'CPF',
      width: '20',
      align: 'start',
      render: (usuario) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 font-mono">
            {usuario.cpf ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'cargo',
      header: 'Cargo',
      width: '20',
      align: 'start',
      render: (usuario) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 font-medium">
            {usuario.cargo || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      render: (usuario) => (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            usuario.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {usuario.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20',
      align: 'start',
      render: (usuario) => (
        <div className="flex items-center space-x-1">
          <Status 
            isActive={usuario.status}
            onClick={() => handleStatusToggle(usuario)}
          />
          <Edit 
            onClick={() => handleEdit(usuario)}
          />
          <Delete 
            onClick={() => handleDelete(usuario)}
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
          {usuarios.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedRows.length === usuarios.length && usuarios.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedRows.length > 0 
                  ? `${selectedRows.length} de ${usuarios.length} selecionados`
                  : `${usuarios.length} usuários`
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
          data={usuarios}
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

export default ListUsers;
