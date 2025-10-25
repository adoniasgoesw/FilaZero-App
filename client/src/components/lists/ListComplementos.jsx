import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Action from '../buttons/Action';
import { Plus, DollarSign, Calculator, CheckCircle, XCircle } from 'lucide-react';

const ListComplementos = ({ 
  estabelecimentoId, 
  onEdit, 
  onDelete, 
  onStatusToggle, 
  onRefresh,
  searchTerm = ''
}) => {
  const [complementos, setComplementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Filtrar complementos baseado no termo de pesquisa
  const filteredComplementos = complementos.filter(complemento => 
    complemento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (complemento.categoria_nome && complemento.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchComplementos = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Buscando complementos para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/complement/${estabelecimentoId}`);
      
      const response = await fetch(`${API_URL}/complement/${estabelecimentoId}`);
      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setComplementos(data.data.complementos);
        console.log('Complementos carregados:', data.data.complementos);
      } else {
        setError(data.message || 'Erro ao carregar complementos');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar complementos:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchComplementos();
    }
  }, [estabelecimentoId, fetchComplementos]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchComplementos(true));
    }
  }, [onRefresh, fetchComplementos]);

  const handleStatusToggle = (complemento) => {
    if (onStatusToggle) {
      onStatusToggle(complemento);
    }
  };

  const handleEdit = (complemento) => {
    if (onEdit) {
      onEdit(complemento);
    }
  };

  const handleDelete = (complemento) => {
    if (onDelete) {
      onDelete(complemento);
    }
  };

  const handleRowSelect = (complementoId, isSelected) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, complementoId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== complementoId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(filteredComplementos.map(complemento => complemento.id));
    } else {
      setSelectedRows([]);
    }
  };


  // Função para verificar se todos os complementos selecionados estão ativos
  const allSelectedActive = () => {
    if (selectedRows.length === 0) return false;
    const selectedComplementos = filteredComplementos.filter(c => selectedRows.includes(c.id));
    return selectedComplementos.every(c => c.status);
  };


  // Função para lidar com ações em lote
  const handleBatchAction = (action) => {
    const selectedComplementos = filteredComplementos.filter(c => selectedRows.includes(c.id));
    
    switch (action) {
      case 'edit':
        if (selectedComplementos.length === 1) {
          handleEdit(selectedComplementos[0]);
        }
        break;
      case 'delete':
        if (selectedComplementos.length === 1) {
          handleDelete(selectedComplementos[0]);
        } else if (selectedComplementos.length > 1) {
          // Implementar exclusão em lote
          console.log('Excluir complementos selecionados:', selectedComplementos);
        }
        break;
      case 'activate':
        selectedComplementos.forEach(complemento => {
          if (!complemento.status) {
            handleStatusToggle(complemento);
          }
        });
        break;
      case 'deactivate':
        selectedComplementos.forEach(complemento => {
          if (complemento.status) {
            handleStatusToggle(complemento);
          }
        });
        break;
    }
  };

  // Coluna para mobile - apenas uma coluna (checkbox, imagem e nome)
  const mobileColumn = {
    key: 'complemento',
    header: 'Complementos',
    width: '100',
    align: 'left',
    render: (complemento) => (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(complemento)}>
        <input
          type="checkbox"
          checked={selectedRows.includes(complemento.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelect(complemento.id, e.target.checked);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
        />
        
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {complemento.imagem_url ? (
            <img 
              src={complemento.imagem_url} 
              alt={complemento.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {complemento.nome}
          </div>
        </div>
      </div>
    )
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'complemento',
      header: 'Complemento',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (complemento) => (
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => handleEdit(complemento)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(complemento.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(complemento.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="text-sm text-gray-700 truncate">
            {complemento.nome.length > 10 ? `${complemento.nome.substring(0, 10)}...` : complemento.nome}
          </div>
        </div>
      )
    },
    {
      key: 'valor_venda',
      header: 'Valor',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (complemento) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            R$ {parseFloat(complemento.valor_venda).toFixed(2).replace('.', ',')}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    ...smallColumns,
    {
      key: 'valor_custo',
      header: 'Custo',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (complemento) => (
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {complemento.valor_custo ? `R$ ${parseFloat(complemento.valor_custo).toFixed(2).replace('.', ',')}` : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (complemento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          complemento.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {complemento.status ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'complemento',
      header: 'Complemento',
      width: '20',
      align: 'start',
      render: (complemento) => (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedRows.includes(complemento.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(complemento.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="text-sm text-gray-700">
            {complemento.nome.length > 20 ? `${complemento.nome.substring(0, 20)}...` : complemento.nome}
          </div>
        </div>
      )
    },
    {
      key: 'valor_venda',
      header: 'Valor de Venda',
      width: '20',
      align: 'start',
      render: (complemento) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            R$ {parseFloat(complemento.valor_venda).toFixed(2).replace('.', ',')}
          </div>
        </div>
      )
    },
    {
      key: 'valor_custo',
      header: 'Valor de Custo',
      width: '20',
      align: 'start',
      render: (complemento) => (
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {complemento.valor_custo ? `R$ ${parseFloat(complemento.valor_custo).toFixed(2).replace('.', ',')}` : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      render: (complemento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          complemento.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {complemento.status ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20',
      align: 'start',
      render: (complemento) => (
        <div className="flex items-center space-x-1">
          <Status 
            isActive={complemento.status}
            onClick={() => handleStatusToggle(complemento)}
          />
          <Edit 
            onClick={() => handleEdit(complemento)}
          />
          <Delete 
            onClick={() => handleDelete(complemento)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Header com seleção */}
      <div className="px-6 py-4 bg-gray-50 rounded-t-lg min-h-[60px]">
        {/* Layout responsivo: 2 linhas em celular, 1 linha em tablet/desktop */}
        
        {/* Checkbox + Contador + Botão de Ações */}
        <div className="flex items-center justify-between">
          {filteredComplementos.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedRows.length === filteredComplementos.length && filteredComplementos.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedRows.length > 0 
                  ? `${selectedRows.length} de ${filteredComplementos.length} selecionados`
                  : `${filteredComplementos.length} complementos`
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
            />
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1">
        <ListBase
          columns={largeColumns}
          data={filteredComplementos}
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

export default ListComplementos;