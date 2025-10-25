import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Action from '../buttons/Action';
import { Package, Tag, DollarSign } from 'lucide-react';

const ListProduct = ({ 
  estabelecimentoId, 
  onEdit, 
  onDelete, 
  onStatusToggle, 
  onRefresh,
  searchTerm = ''
}) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Filtrar produtos baseado no termo de pesquisa
  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.categoria_nome && produto.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchProdutos = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Buscando produtos para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/product/${estabelecimentoId}`);
      
      const response = await fetch(`${API_URL}/product/${estabelecimentoId}`);
      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setProdutos(data.data.produtos);
        console.log('Produtos carregados:', data.data.produtos);
      } else {
        setError(data.message || 'Erro ao carregar produtos');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar produtos:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchProdutos();
    }
  }, [estabelecimentoId, fetchProdutos]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchProdutos(true));
    }
  }, [onRefresh, fetchProdutos]);

  const handleStatusToggle = (produto) => {
    if (onStatusToggle) {
      onStatusToggle(produto);
    }
  };

  const handleEdit = (produto) => {
    if (onEdit) {
      onEdit(produto);
    }
  };

  const handleDelete = (produto) => {
    if (onDelete) {
      onDelete(produto);
    }
  };

  const handleRowSelect = (produtoId, isSelected) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, produtoId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== produtoId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(filteredProdutos.map(produto => produto.id));
    } else {
      setSelectedRows([]);
    }
  };


  // Função para verificar se todos os produtos selecionados estão ativos
  const allSelectedActive = () => {
    if (selectedRows.length === 0) return false;
    const selectedProducts = filteredProdutos.filter(p => selectedRows.includes(p.id));
    return selectedProducts.every(p => p.status);
  };


  // Função para lidar com ações em lote
  const handleBatchAction = (action) => {
    const selectedProducts = filteredProdutos.filter(p => selectedRows.includes(p.id));
    
    switch (action) {
      case 'edit':
        if (selectedProducts.length === 1) {
          handleEdit(selectedProducts[0]);
        }
        break;
      case 'delete':
        if (selectedProducts.length === 1) {
          handleDelete(selectedProducts[0]);
        } else if (selectedProducts.length > 1) {
          // Implementar exclusão em lote
          console.log('Excluir produtos selecionados:', selectedProducts);
        }
        break;
      case 'activate':
        selectedProducts.forEach(produto => {
          if (!produto.status) {
            handleStatusToggle(produto);
          }
        });
        break;
      case 'deactivate':
        selectedProducts.forEach(produto => {
          if (produto.status) {
            handleStatusToggle(produto);
          }
        });
        break;
    }
  };

  // Coluna para mobile - apenas uma coluna (checkbox, imagem e nome)
  const mobileColumn = {
    key: 'produto',
    header: 'Produtos',
    width: '100',
    align: 'left',
    render: (produto) => (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(produto)}>
        <input
          type="checkbox"
          checked={selectedRows.includes(produto.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelect(produto.id, e.target.checked);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
        />
        
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {produto.imagem_url ? (
            <img 
              src={produto.imagem_url} 
              alt={produto.nome}
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
            {produto.nome}
          </div>
        </div>
      </div>
    )
  };

  // Colunas para telas pequenas (celulares) - 2 colunas
  const smallColumns = [
    {
      key: 'produto',
      header: 'Produto',
      width: '60',
      align: 'start',
      responsiveClass: 'w-3/5',
      render: (produto) => (
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => handleEdit(produto)}
        >
          <input
            type="checkbox"
            checked={selectedRows.includes(produto.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(produto.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {produto.imagem_url ? (
              <img 
                src={produto.imagem_url} 
                alt={produto.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div className="text-sm text-gray-700 truncate">
              {produto.nome.length > 10 ? `${produto.nome.substring(0, 10)}...` : produto.nome}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'categoria',
      header: 'Categoria',
      width: '40',
      align: 'start',
      responsiveClass: 'w-2/5',
      render: (produto) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700 truncate">
            {produto.categoria_nome || 'Sem categoria'}
          </div>
        </div>
      )
    }
  ];

  // Colunas para telas médias (tablets) - 4 colunas
  const mediumColumns = [
    ...smallColumns,
    {
      key: 'valor_venda',
      header: 'Valor',
      width: '20',
      align: 'start',
      responsiveClass: 'w-1/4',
      render: (produto) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div className="text-sm font-medium text-gray-700">
            R$ {parseFloat(produto.valor_venda).toFixed(2).replace('.', ',')}
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
      render: (produto) => (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            produto.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {produto.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    }
  ];

  // Colunas para telas grandes (desktops) - 5 colunas
  const largeColumns = [
    {
      key: 'produto',
      header: 'Produto',
      width: '20',
      align: 'start',
      render: (produto) => (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedRows.includes(produto.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(produto.id, e.target.checked);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {produto.imagem_url ? (
              <img 
                src={produto.imagem_url} 
                alt={produto.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-700">
            {produto.nome.length > 20 ? `${produto.nome.substring(0, 20)}...` : produto.nome}
          </div>
        </div>
      )
    },
    {
      key: 'categoria',
      header: 'Categoria',
      width: '20',
      align: 'start',
      render: (produto) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <div className="text-sm text-gray-700">
            {produto.categoria_nome || 'Sem categoria'}
          </div>
        </div>
      )
    },
    {
      key: 'valor_venda',
      header: 'Valor de Venda',
      width: '20',
      align: 'start',
      render: (produto) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div className="text-sm font-medium text-gray-700">
            R$ {parseFloat(produto.valor_venda).toFixed(2).replace('.', ',')}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      align: 'start',
      render: (produto) => (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            produto.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {produto.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20',
      align: 'start',
      render: (produto) => (
        <div className="flex items-center space-x-1">
          <Status 
            isActive={produto.status}
            onClick={() => handleStatusToggle(produto)}
          />
          <Edit 
            onClick={() => handleEdit(produto)}
          />
          <Delete 
            onClick={() => handleDelete(produto)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Header com seleção */}
      <div className="px-6 py-4 bg-gray-50 rounded-t-lg min-h-[60px] ">
        {/* Layout responsivo: 2 linhas em celular, 1 linha em tablet/desktop */}
        
        {/* Checkbox + Contador + Botão de Ações */}
        <div className="flex items-center justify-between pt-1.5">
          {filteredProdutos.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedRows.length === filteredProdutos.length && filteredProdutos.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedRows.length > 0 
                  ? `${selectedRows.length} de ${filteredProdutos.length} selecionados`
                  : `${filteredProdutos.length} produtos`
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
          data={filteredProdutos}
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

export default ListProduct;
