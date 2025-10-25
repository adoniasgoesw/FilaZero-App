import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus } from 'lucide-react';
import ExpandButton from '../buttons/ExpandButton';

const ListPedido = ({ pedidos = [], onDeleteItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const listRef = useRef(null);
  const contentRef = useRef(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleDeleteItem = (itemId) => {
    if (onDeleteItem) {
      onDeleteItem(itemId);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Verificar se precisa mostrar o botão de expandir
  useEffect(() => {
    if (contentRef.current && pedidos.length > 0) {
      const contentHeight = contentRef.current.scrollHeight;
      const containerHeight = 240; // h-60 = 240px
      
      if (contentHeight > containerHeight) {
        setShowExpandButton(true);
      } else {
        setShowExpandButton(false);
        setIsExpanded(false);
      }
    }
  }, [pedidos]);

  // Calcular quantidade total de itens únicos
  const quantidadeItens = pedidos.length;

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-60">
        {/* Header */}
        <div className="bg-gray-50 px-3 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700">Listagem de Itens</h3>
        </div>
        
        {/* Estado vazio */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-gray-400">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium mb-1">Nenhum item adicionado</p>
          <p className="text-xs text-center px-3">
            Adicione itens do painel ao lado para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${
      isExpanded 
        ? 'fixed inset-0 z-50 h-screen' 
        : 'h-60'
    }`}>
      {/* Header - igual ao resumo do pedido */}
      <div className="bg-gray-50 px-3 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Listagem de Itens</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {quantidadeItens} item{quantidadeItens !== 1 ? 's' : ''}
            </span>
            {showExpandButton && (
              <ExpandButton 
                isExpanded={isExpanded}
                onClick={handleToggleExpand}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lista de itens com altura fixa e rolagem */}
      <div 
        ref={contentRef}
        className={`flex-1 p-3 space-y-1 ${
          isExpanded ? 'overflow-y-auto' : 'overflow-y-auto'
        }`}
      >
        {pedidos.map((pedido, index) => (
          <div
            key={`${pedido.id}-${index}`}
            className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-b-0"
          >
            {/* Nome do item */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-gray-900 truncate">
                {pedido.item}
                {!pedido.salvo && pedido.quantidadeSalva > 0 && pedido.quantidade > pedido.quantidadeSalva && (
                  <span className="text-blue-600 font-semibold ml-1">
                    +{pedido.quantidade - pedido.quantidadeSalva} Novos
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500">
                Qtd: {pedido.quantidade || 1}
              </p>
              {pedido.observacoes && (
                <p className="text-xs text-gray-400 italic">
                  Obs: {pedido.observacoes}
                </p>
              )}
            </div>
            
            {/* Valor total e botão remover */}
            <div className="flex items-center space-x-2 ml-3">
              <div className="text-right">
                <div className="text-xs font-medium text-gray-900">
                  {formatCurrency(pedido.total)}
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteItem(pedido.id)}
                className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors"
                title="Remover item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListPedido;
