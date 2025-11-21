import React from 'react';
import { Clock, CheckCircle, ChefHat, AlertCircle } from 'lucide-react';

const ListPedidos = ({ pedidos = [], onPedidoClick, onAceitarPedido, getStatusColor, getStatusLabel, getStatusIcon }) => {
  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400">
        <ChefHat className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Nenhum pedido no momento</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-2">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          onClick={() => onPedidoClick && onPedidoClick(pedido.id)}
          className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
        >
          {/* Header do Pedido */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 truncate">
                Pedido #{pedido.codigo || pedido.id}
              </h3>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-gray-600">
                  Mesa: {pedido.mesa || 'N/A'}
                </p>
                {pedido.nome_ponto && (
                  <p className="text-xs text-gray-600 truncate">
                    {pedido.nome_ponto}
                  </p>
                )}
              </div>
            </div>
            <div className={`ml-2 px-2 py-1 rounded-full border flex items-center gap-1 text-xs font-semibold flex-shrink-0 ${getStatusColor(pedido.status)}`}>
              {getStatusIcon(pedido.status)}
              <span className="hidden sm:inline">{getStatusLabel(pedido.status)}</span>
            </div>
          </div>

          {/* Informações dos Itens */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-gray-800">{pedido.total_itens || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-yellow-50 px-2 py-1 rounded">
              <span className="text-yellow-700">Pendentes:</span>
              <span className="font-semibold text-yellow-800">{pedido.itens_pendentes || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-orange-50 px-2 py-1 rounded">
              <span className="text-orange-700">Em preparo:</span>
              <span className="font-semibold text-orange-800">{pedido.itens_em_preparo || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-green-50 px-2 py-1 rounded">
              <span className="text-green-700">Finalizados:</span>
              <span className="font-semibold text-green-800">{pedido.itens_finalizados || 0}</span>
            </div>
          </div>

          {/* Botão Aceitar (só aparece se status for pendente) */}
          {pedido.status === 'pendente' && onAceitarPedido && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAceitarPedido(pedido.id, e);
              }}
              className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold text-sm"
            >
              Aceitar Pedido
            </button>
          )}

          {/* Indicador de clique */}
          <div className="mt-2 text-center text-xs text-gray-400">
            Clique para ver detalhes
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListPedidos;

