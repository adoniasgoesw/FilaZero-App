import React from 'react';

const ListValores = ({ pedidos = [], showOnlyTotal = false, pagamentosData = { pago: 0, restante: 0 }, pedidoAtual = null }) => {
  // Log para debug
  console.log('📊 ListValores recebeu pedidos:', pedidos);
  console.log('📊 ListValores recebeu pedidoAtual:', pedidoAtual);
  console.log('📊 Estrutura dos pedidos:', pedidos.map(p => ({
    item: p.item,
    preco: p.preco,
    quantidade: p.quantidade,
    total: p.total,
    valor_total: p.valor_total,
    desconto: p.desconto,
    acrescimos: p.acrescimos
  })));
  const calcularSubtotal = () => {
    // Subtotal = soma de todos os itens (valor original dos itens)
    // Sempre calcular baseado nos itens do frontend primeiro
    const subtotalFrontend = pedidos.reduce((total, pedido) => {
      const preco = parseFloat(pedido.preco) || 0;
      const quantidade = parseFloat(pedido.quantidade) || 0;
      const itemTotal = preco * quantidade;
      
      console.log('🧮 Item calculado:', {
        item: pedido.item,
        preco,
        quantidade,
        itemTotal
      });
      
      return total + itemTotal;
    }, 0);
    
    console.log('🧮 Debug calcularSubtotal:', {
      subtotalFrontend,
      pedidosLength: pedidos.length,
      pedidoAtual: pedidoAtual ? {
        valor_total: pedidoAtual.valor_total,
        desconto: pedidoAtual.desconto,
        acrescimos: pedidoAtual.acrescimos
      } : 'não disponível'
    });
    
    // Se temos itens no frontend, usar eles
    if (pedidos.length > 0 && subtotalFrontend > 0) {
      console.log('🧮 Usando subtotal do frontend:', subtotalFrontend);
      return subtotalFrontend;
    }
    
    // Se não há itens no frontend, mas temos dados do banco
    if (pedidoAtual && pedidoAtual.valor_total !== undefined) {
      const valorTotal = parseFloat(pedidoAtual.valor_total) || 0;
      const desconto = parseFloat(pedidoAtual.desconto) || 0;
      const acrescimos = parseFloat(pedidoAtual.acrescimos) || 0;
      
      // Se não há desconto nem acréscimo, o subtotal é igual ao valor_total
      if (desconto === 0 && acrescimos === 0) {
        console.log('🧮 Sem desconto/acréscimo - subtotal = valor_total:', valorTotal);
        return valorTotal;
      }
      
      // Se há desconto ou acréscimo, reconstruir subtotal original
      const subtotalBanco = valorTotal + desconto - acrescimos;
      
      console.log('🧮 Cálculo subtotal (banco):', {
        valorTotal,
        desconto,
        acrescimos,
        subtotalBanco
      });
      
      return subtotalBanco;
    }
    
    // Fallback: usar dados do frontend (mesmo que seja 0)
    console.log('🧮 Fallback - usando subtotal do frontend:', subtotalFrontend);
    return subtotalFrontend;
  };

  const calcularDesconto = () => {
    // Priorizar dados do banco se disponível
    if (pedidoAtual && pedidoAtual.desconto !== undefined) {
      const descontoBanco = parseFloat(pedidoAtual.desconto) || 0;
      console.log('🧮 Desconto (banco):', descontoBanco);
      return descontoBanco;
    }
    
    // Fallback para dados do frontend
    const descontoFrontend = pedidos.reduce((total, pedido) => total + (parseFloat(pedido.desconto) || 0), 0);
    console.log('🧮 Desconto (frontend):', descontoFrontend);
    return descontoFrontend;
  };

  const calcularAcrescimo = () => {
    // Priorizar dados do banco se disponível
    if (pedidoAtual && pedidoAtual.acrescimos !== undefined) {
      const acrescimoBanco = parseFloat(pedidoAtual.acrescimos) || 0;
      console.log('🧮 Acréscimo (banco):', acrescimoBanco);
      return acrescimoBanco;
    }
    
    // Fallback para dados do frontend
    const acrescimoFrontend = pedidos.reduce((total, pedido) => total + (parseFloat(pedido.acrescimos) || 0), 0);
    console.log('🧮 Acréscimo (frontend):', acrescimoFrontend);
    return acrescimoFrontend;
  };

  // Calcular desconto baseado no subtotal e tipo
  const calcularDescontoReal = () => {
    if (!pedidoAtual) return 0;
    
    const subtotal = calcularSubtotal();
    const valorOriginal = pedidoAtual.desconto_original;
    const tipo = pedidoAtual.desconto_tipo;
    
    console.log('🧮 Debug calcularDescontoReal:', {
      pedidoAtual: pedidoAtual,
      valorOriginal,
      tipo,
      subtotal,
      desconto_original_null: valorOriginal === null,
      desconto_tipo_null: tipo === null
    });
    
    // Se não há valor original ou tipo, ou se são NULL, retornar 0
    if (!valorOriginal || valorOriginal === null || !tipo || tipo === null || subtotal === 0) {
      console.log('🧮 Desconto retornando 0 - sem dados válidos');
      return 0;
    }
    
    let descontoCalculado = 0;
    if (tipo === 'percentage') {
      // Desconto percentual
      const percentual = parseFloat(valorOriginal);
      descontoCalculado = (subtotal * percentual) / 100;
    } else {
      // Desconto em valor fixo
      descontoCalculado = parseFloat(valorOriginal);
    }
    
    console.log('🧮 Desconto calculado:', {
      subtotal,
      valorOriginal,
      tipo,
      descontoCalculado
    });
    
    return descontoCalculado;
  };

  // Calcular acréscimo baseado no subtotal e tipo
  const calcularAcrescimoReal = () => {
    if (!pedidoAtual) return 0;
    
    const subtotal = calcularSubtotal();
    const valorOriginal = pedidoAtual.acrescimo_original;
    const tipo = pedidoAtual.acrescimo_tipo;
    
    console.log('🧮 Debug calcularAcrescimoReal:', {
      pedidoAtual: pedidoAtual,
      valorOriginal,
      tipo,
      subtotal,
      acrescimo_original_null: valorOriginal === null,
      acrescimo_tipo_null: tipo === null
    });
    
    // Se não há valor original ou tipo, ou se são NULL, retornar 0
    if (!valorOriginal || valorOriginal === null || !tipo || tipo === null || subtotal === 0) {
      console.log('🧮 Acréscimo retornando 0 - sem dados válidos');
      return 0;
    }
    
    let acrescimoCalculado = 0;
    if (tipo === 'percentage') {
      // Acréscimo percentual
      const percentual = parseFloat(valorOriginal);
      acrescimoCalculado = (subtotal * percentual) / 100;
    } else {
      // Acréscimo em valor fixo
      acrescimoCalculado = parseFloat(valorOriginal);
    }
    
    console.log('🧮 Acréscimo calculado:', {
      subtotal,
      valorOriginal,
      tipo,
      acrescimoCalculado
    });
    
    return acrescimoCalculado;
  };

  const getDescontoDisplay = () => {
    if (!pedidoAtual) return '';
    
    const valorOriginal = pedidoAtual.desconto_original;
    const tipo = pedidoAtual.desconto_tipo;
    
    if (!valorOriginal) return '';
    
    if (tipo === 'percentage') {
      return `${valorOriginal}%`;
    } else {
      return `R$ ${valorOriginal}`;
    }
  };

  const getAcrescimoDisplay = () => {
    if (!pedidoAtual) return '';
    
    const valorOriginal = pedidoAtual.acrescimo_original;
    const tipo = pedidoAtual.acrescimo_tipo;
    
    if (!valorOriginal) return '';
    
    if (tipo === 'percentage') {
      return `${valorOriginal}%`;
    } else {
      return `R$ ${valorOriginal}`;
    }
  };

  const calcularTotal = () => {
    // Total = subtotal - desconto + acréscimo
    const subtotal = calcularSubtotal();
    
    // Usar cálculos reais baseados no subtotal
    const desconto = calcularDescontoReal();
    const acrescimo = calcularAcrescimoReal();
    
    const total = subtotal - desconto + acrescimo;
    
    // Log para debug
    console.log('🧮 Cálculo de valores FINAL:', {
      subtotal,
      desconto,
      acrescimo,
      total,
      pedidos: pedidos.length,
      pedidoAtual: pedidoAtual ? 'disponível' : 'não disponível'
    });
    
    return total;
  };

  if (showOnlyTotal) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Resumo do Pedido</h3>
        </div>

        {/* Apenas Total */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              R$ {calcularTotal().toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Resumo do Pedido</h3>
      </div>

      {/* Valores */}
      <div className="p-3 space-y-1">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-500">
            R$ {calcularSubtotal().toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Desconto - só aparece se houver */}
        {calcularDescontoReal() > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">Desconto:</span>
            <span className="text-green-600">
              - R$ {calcularDescontoReal().toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}

        {/* Acréscimo - só aparece se houver */}
        {calcularAcrescimoReal() > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-600">Acréscimo:</span>
            <span className="text-yellow-600">
              + R$ {calcularAcrescimoReal().toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}

        {/* Pago e Restante - priorizar dados do banco */}
        {(() => {
          // Priorizar dados do banco se disponível
          const pagoBanco = pedidoAtual ? parseFloat(pedidoAtual.valor_pago) || 0 : 0;
          const restanteBanco = pedidoAtual ? parseFloat(pedidoAtual.valor_restante) || 0 : 0;
          const trocoBanco = pedidoAtual ? parseFloat(pedidoAtual.valor_troco) || 0 : 0;
          
          // SEMPRE priorizar dados do banco quando disponíveis
          let pago = pedidoAtual ? pagoBanco : (pagamentosData.pago || 0);
          let restante = pedidoAtual ? restanteBanco : (pagamentosData.restante || 0);
          let troco = pedidoAtual ? trocoBanco : 0;
          
          // Calcular total atual do pedido
          const totalAtual = calcularTotal();
          
          // Recalcular restante quando há acréscimo/desconto
          if (pedidoAtual && pago > 0) {
            // Se há pagamento, sempre recalcular baseado no total atual
            const totalOriginal = parseFloat(pedidoAtual.valor_total) || 0;
            const descontoOriginal = parseFloat(pedidoAtual.desconto) || 0;
            const acrescimoOriginal = parseFloat(pedidoAtual.acrescimos) || 0;
            const totalOriginalComDescontoAcrescimo = totalOriginal - descontoOriginal + acrescimoOriginal;
            
            console.log('🔍 Debug recálculo:', {
              totalAtual,
              totalOriginal,
              descontoOriginal,
              acrescimoOriginal,
              totalOriginalComDescontoAcrescimo,
              pago,
              restanteAtual: restante,
              trocoAtual: troco
            });
            
            // Sempre recalcular quando há pagamento
            restante = Math.max(0, totalAtual - pago);
            troco = Math.max(0, pago - totalAtual);
            
            console.log('🔍 Valores recalculados:', {
              restante,
              troco
            });
          } else if (!pedidoAtual) {
            // Se não há dados do banco, calcular baseado no total atual
            restante = totalAtual;
            troco = 0;
          }
          
          console.log('📊 Valores de pagamento (DESCONTO/ACRÉSCIMO):', { 
            pago, 
            restante, 
            troco, 
            totalAtual,
            pagoBanco, 
            restanteBanco, 
            trocoBanco,
            pagamentosDataPago: pagamentosData.pago
          });
          
          if (pago > 0) {
            return (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Pago:</span>
                  <span className="text-gray-500">
                    R$ {pago.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {restante > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Restante:</span>
                    <span className="text-gray-500">
                      R$ {restante.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                {troco > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Troco:</span>
                    <span className="text-gray-500">
                      R$ {troco.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </>
            );
          }
          return null;
        })()}
        
        {/* Total - sempre por último */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total:</span>
            <span className="text-base font-bold text-blue-600">
              R$ {calcularTotal().toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListValores;
