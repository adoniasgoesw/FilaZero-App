import React, { useState, useEffect, useCallback } from 'react';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import { API_URL } from '../../services/api';

console.log('API_URL configurada:', API_URL);

const ListCategory = ({ estabelecimentoId, onEdit, onDelete, onStatusToggle, onRefresh }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Buscando categorias para estabelecimento:', estabelecimentoId);
      console.log('URL da API:', `${API_URL}/category/${estabelecimentoId}`);
      
      const response = await fetch(`${API_URL}/category/${estabelecimentoId}`);
      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setCategorias(data.data.categorias);
        console.log('Categorias carregadas:', data.data.categorias);
      } else {
        setError(data.message || 'Erro ao carregar categorias');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar categorias:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchCategorias();
    }
  }, [estabelecimentoId, fetchCategorias]);

  // Expor função de refresh para o componente pai
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchCategorias(true));
    }
  }, [onRefresh, fetchCategorias]);

  const handleStatusToggle = (categoria) => {
    if (onStatusToggle) {
      onStatusToggle(categoria);
    }
  };

  const handleEdit = (categoria) => {
    if (onEdit) {
      onEdit(categoria);
    }
  };

  const handleDelete = (categoria) => {
    if (onDelete) {
      onDelete(categoria);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchCategorias}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Nenhuma categoria encontrada</p>
          <p className="text-sm">Clique em "Nova Categoria" para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 p-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {categorias.map((categoria) => (
        <div 
          key={categoria.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
          onClick={() => handleEdit(categoria)}
        >
          {/* Imagem da categoria */}
          <div className="aspect-square bg-gray-50 flex items-center justify-center relative rounded-t-xl overflow-hidden border-b-2 border-gray-200">
            {/* Botões de ação no topo (telas muito pequenas) */}
            <div className="absolute top-2 right-2 flex items-center gap-0.5 xs:hidden">
              <div className="scale-75">
                <Status 
                  isActive={categoria.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusToggle(categoria);
                  }}
                />
              </div>
              <div className="scale-75">
                <Edit 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(categoria);
                  }}
                />
              </div>
              <div className="scale-75">
                <Delete 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(categoria);
                  }}
                />
              </div>
            </div>
            
            {/* Status no bottom direito (telas muito pequenas) */}
            <div className="absolute bottom-2 right-2 xs:hidden scale-90">
              <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                categoria.status 
                  ? 'bg-emerald-400 text-white border border-emerald-500' 
                  : 'bg-red-400 text-white border border-red-500'
              }`}>
                {categoria.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            {categoria.imagem_url ? (
              <img 
                src={categoria.imagem_url} 
                alt={categoria.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                {categoria.icone ? (
                  <span className="text-2xl text-gray-400">{categoria.icone}</span>
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          
          {/* Nome da categoria e botões */}
          <div className="p-3 pb-3 md:pb-4">
            {/* Nome da categoria */}
            <h3 className="font-semibold text-gray-900 truncate text-xs md:text-sm mb-1">
              {categoria.nome}
            </h3>
            
            {categoria.descricao && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                {categoria.descricao}
              </p>
            )}
            
            {/* Status badge e botões (telas maiores que 430px) */}
            <div className="hidden xs:flex items-center justify-between">
              <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                categoria.status 
                  ? 'bg-emerald-400 text-white border border-emerald-500' 
                  : 'bg-red-400 text-white border border-red-500'
              }`}>
                <span className="text-xs">{categoria.status ? 'Ativo' : 'Inativo'}</span>
              </span>
              
              {/* Botões de ação */}
              <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                <div className="scale-75 md:scale-100">
                  <Status 
                    isActive={categoria.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(categoria);
                    }}
                  />
                </div>
                <div className="scale-75 md:scale-100">
                  <Edit 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(categoria);
                    }}
                  />
                </div>
                <div className="scale-75 md:scale-100">
                  <Delete 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(categoria);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListCategory;
