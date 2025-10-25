import React, { useState, useEffect, useCallback } from 'react';
import SaveButton from '../buttons/Save';
import CancelButton from '../buttons/Cancel';
import InformationButton from '../buttons/Information';
import BackButton from '../buttons/Back';
import SearchBar from '../layouts/SearchBar';
import { API_URL } from '../../services/api';

// ItemsPanel component for managing categories and products
const ItemsPanel = ({ onInfoClick, isMobile, onBack, estabelecimentoId = 7, onAddToPedido, pedidos = [], onSaveItems, onCancelItems, isBalcao = false }) => {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtosClicados, setProdutosClicados] = useState({});

  // Calcular contador apenas para a parte temporária dos itens
  useEffect(() => {
    const contadorTemp = {};
    
    pedidos.forEach(pedido => {
      if (!pedido.salvo) {
        // Item sendo adicionado (temporário)
        if (pedido.quantidadeSalva > 0) {
          // Item que tinha salvos - contador mostra apenas a parte nova
          contadorTemp[pedido.id] = pedido.quantidade - pedido.quantidadeSalva;
        } else {
          // Item totalmente novo - contador mostra quantidade total
          contadorTemp[pedido.id] = pedido.quantidade || 0;
        }
      }
    });
    
    setProdutosClicados(contadorTemp);
  }, [pedidos]);

  // Calcular total de itens para salvar
  const calcularTotalItens = () => {
    return pedidos
      .filter(pedido => !pedido.salvo)
      .reduce((total, pedido) => {
        if (pedido.quantidadeSalva > 0) {
          // Item que tinha salvos - conta apenas a parte nova
          return total + (pedido.quantidade - pedido.quantidadeSalva);
        } else {
          // Item totalmente novo - conta quantidade total
          return total + (pedido.quantidade || 0);
        }
      }, 0);
  };

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/category/${estabelecimentoId}`);
      const data = await response.json();
      
      if (data.success) {
        setCategorias(data.data.categorias);
      } else {
        setError(data.message || 'Erro ao carregar categorias');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  const fetchProdutos = useCallback(async (categoriaId) => {
    try {
      setLoadingProdutos(true);
      
      const response = await fetch(`${API_URL}/product/${estabelecimentoId}`);
      const data = await response.json();
      
      if (data.success) {
        // Filtrar produtos pela categoria selecionada
        const produtosFiltrados = data.data.produtos.filter(produto => 
          produto.categoria_id === categoriaId
        );
        setProdutos(produtosFiltrados);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoadingProdutos(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchCategorias();
    }
  }, [estabelecimentoId, fetchCategorias]);

  // Selecionar automaticamente a primeira categoria quando carregar
  useEffect(() => {
    if (categorias.length > 0 && !categoriaSelecionada) {
      const primeira = categorias[0];
      setCategoriaSelecionada(primeira);
      fetchProdutos(primeira.id);
    }
  }, [categorias, categoriaSelecionada, fetchProdutos]);

  const handleSave = () => {
    if (onSaveItems) {
      onSaveItems();
    } else {
      console.log('Salvando...');
    }
  };

  const handleCancel = () => {
    if (onCancelItems) {
      onCancelItems();
    } else {
      console.log('Cancelando...');
    }
  };

  const handleInfo = () => {
    if (onInfoClick) {
      onInfoClick();
    }
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    console.log('Pesquisando:', searchTerm);
  };


  const handleCategoriaClick = (categoria) => {
    setCategoriaSelecionada(categoria);
    fetchProdutos(categoria.id);
  };

  const handleProdutoClick = (produto) => {
    // Adiciona item temporário (não salvo ainda)
    if (onAddToPedido) {
      const itemPedido = {
        id: produto.id, // Usar ID do produto para agrupamento
        item: produto.nome,
        quantidade: 1,
        preco: parseFloat(produto.valor_venda),
        total: parseFloat(produto.valor_venda),
        observacoes: '',
        salvo: false // Marca como não salvo
      };
      onAddToPedido(itemPedido);
    }
  };

  // Filtrar categorias baseado na pesquisa
  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar produtos baseado na pesquisa
  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center w-full p-3 sm:p-4 mb-2 border-b border-gray-200">
        {/* Mobile: Botão voltar + Barra de pesquisa */}
        <div className="md:hidden flex items-center gap-3 w-full">
          <BackButton 
            onClick={onBack} 
            isRound={true}
            size="small"
            iconSize={16}
          />
          <div className="flex-1">
            <SearchBar 
              placeholder="Pesquisar itens..."
              onSearch={handleSearch}
              className="w-full"
              height="h-10"
            />
          </div>
        </div>
        
        {/* Desktop: Apenas barra de pesquisa */}
        <div className="hidden md:block w-full">
          <SearchBar 
            placeholder="Pesquisar itens..."
            onSearch={handleSearch}
            className="w-full"
            height="h-10"
          />
        </div>
      </div>

      {/* Conteúdo Principal - Categorias */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="mb-4">
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
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
          ) : filteredCategorias.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                </p>
                <p className="text-sm">
                  {searchTerm ? 'Tente outro termo de pesquisa' : 'Adicione uma nova categoria'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredCategorias.map((categoria) => (
                <div 
                  key={categoria.id} 
                  className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform duration-200"
                  onClick={() => handleCategoriaClick(categoria)}
                >
                  {/* Imagem redonda com bordas azuis */}
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-50 flex items-center justify-center mb-2 group-hover:border-blue-600 transition-colors duration-200">
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
                  
                  {/* Nome da categoria */}
                  <span className="text-sm font-medium text-gray-800 text-center max-w-20 truncate group-hover:text-blue-600 transition-colors duration-200">
                    {categoria.nome}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Produtos */}
        {categoriaSelecionada && (
          <div className="mt-4">
            
            {loadingProdutos ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Nenhum produto encontrado</p>
                  <p className="text-sm">
                    {searchTerm ? 'Tente outro termo de pesquisa' : 'Esta categoria não possui produtos'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProdutos.map((produto) => (
                  <div 
                    key={produto.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group relative"
                    onClick={() => handleProdutoClick(produto)}
                  >
                    {/* Imagem do produto */}
                    <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                      {produto.imagem_url ? (
                        <img 
                          src={produto.imagem_url} 
                          alt={produto.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Contador - mostra APENAS itens sendo adicionados (temporários) */}
                      {produtosClicados[produto.id] > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {produtosClicados[produto.id]}
                        </div>
                      )}
                    </div>
                    
                    {/* Nome e preço do produto */}
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {produto.nome}
                      </h4>
                      <p className="text-lg font-bold text-blue-600">
                        R$ {parseFloat(produto.valor_venda).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer com Botões */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
        <div className="flex items-center justify-end">
          {/* Botão de Informação - Apenas em mobile */}
          {isMobile && (
            <button
              onClick={handleInfo}
              className="px-4 py-3 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center mr-3"
              title="Ver detalhes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          
          {/* Botões Cancelar e Salvar - escondidos para balcões */}
          {!isBalcao && (
            <div className="flex gap-3">
              <CancelButton 
                onClick={handleCancel}
                className="w-24 whitespace-nowrap"
              >
                Cancelar
              </CancelButton>
              <SaveButton 
                onClick={handleSave}
                className="w-24 whitespace-nowrap"
              >
                {calcularTotalItens() > 0 ? `Salvar (${calcularTotalItens()})` : 'Salvar'}
              </SaveButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsPanel;



