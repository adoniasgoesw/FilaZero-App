import React, { useState, useEffect, useCallback } from 'react';
import BackButton from '../buttons/Back';
import AddButton from '../buttons/Add';
import CloseButton from '../buttons/Close';
import ListValores from '../lists/ListValores';
import BaseModal from '../modals/Base';
import ListClientes from '../lists/ListClientes';
import { User, Plus } from 'lucide-react';
import { API_URL } from '../../services/api';
import pedidosPagamentosService from '../../services/pedidosPagamentosService';
import pedidoService from '../../services/pedidoService';


const PaymentsPanel = ({ onBack, onFinalizarPagamento, estabelecimentoId = 7, pedidos = [], pedidoId, caixaId = 1, pedidoAtual }) => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantidadePessoas, setQuantidadePessoas] = useState(0);
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState([]);
  const [valoresPagamento, setValoresPagamento] = useState({});
  const [valoresLimitados, setValoresLimitados] = useState({});
  const [errosValores, setErrosValores] = useState({});
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteTemporario, setClienteTemporario] = useState(null);
  const [dadosPedido, setDadosPedido] = useState({
    valor_pago: 0,
    valor_restante: 0,
    valor_troco: 0,
    situacao: 'aberto'
  });
  const [pagamentosRemovidos, setPagamentosRemovidos] = useState([]);

  // Calcular total dos pedidos (considerando desconto e acréscimo)
  const calcularTotal = useCallback(() => {
    // Subtotal = soma de todos os itens
    const subtotal = pedidos.reduce((total, pedido) => {
      const preco = parseFloat(pedido.preco) || 0;
      const quantidade = parseFloat(pedido.quantidade) || 0;
      return total + (preco * quantidade);
    }, 0);
    
    // Desconto e acréscimo do pedidoAtual (dados do banco)
    const desconto = parseFloat(pedidoAtual?.desconto) || 0;
    const acrescimo = parseFloat(pedidoAtual?.acrescimos) || 0;
    
    // Total = subtotal - desconto + acréscimo
    return subtotal - desconto + acrescimo;
  }, [pedidos, pedidoAtual]);

  // Carregar dados do pedido e pagamentos salvos
  const carregarDadosPedido = useCallback(async () => {
    if (!pedidoId) return;

    try {
      console.log('📦 Carregando dados do pedido:', pedidoId);
      
      // Carregar pagamentos salvos do pedido
      const responsePagamentos = await pedidosPagamentosService.getPagamentosByPedido(pedidoId);
      
      if (responsePagamentos.success) {
        console.log('✅ Pagamentos carregados:', responsePagamentos.data.pagamentos);
        
        // Adicionar pagamentos salvos à lista de selecionados
        const pagamentosSalvosFormatados = responsePagamentos.data.pagamentos.map(pag => ({
          id: `${pag.pagamento_id}-salvo-${pag.id}`,
          nome: pag.pagamento_nome,
          valor_pago: parseFloat(pag.valor_pago),
          isSalvo: true,
          pagamentoId: pag.pagamento_id,
          pedidoPagamentoId: pag.id
        }));
        
        setPagamentosSelecionados(pagamentosSalvosFormatados);
        
        // Configurar valores dos pagamentos salvos
        const valoresSalvos = {};
        pagamentosSalvosFormatados.forEach(pag => {
          valoresSalvos[pag.id] = pag.valor_pago;
        });
        setValoresPagamento(valoresSalvos);
        
        // Calcular totais dos pagamentos salvos
        const totalPago = responsePagamentos.data.pagamentos.reduce((total, pag) => 
          total + (parseFloat(pag.valor_pago) || 0), 0
        );
        
        // Atualizar dados do pedido com valores do banco
        setDadosPedido(prev => ({
          ...prev,
          valor_pago: totalPago,
          valor_restante: Math.max(0, calcularTotal() - totalPago),
          valor_troco: Math.max(0, totalPago - calcularTotal())
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do pedido:', error);
    }
  }, [pedidoId, calcularTotal]);

  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/payments/${estabelecimentoId}`);
        const data = await response.json();
        
        if (data.success) {
          setPagamentos(data.data.pagamentos);
        } else {
          setError(data.message || 'Erro ao carregar pagamentos');
        }
      } catch (err) {
        setError('Erro de conexão com o servidor');
        console.error('Erro ao buscar pagamentos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (estabelecimentoId) {
      fetchPagamentos();
    }
  }, [estabelecimentoId]);

  // Carregar dados do pedido quando o pedidoId mudar
  useEffect(() => {
    if (pedidoId) {
      carregarDadosPedido();
    }
  }, [pedidoId, carregarDadosPedido]);

  const handlePagamentoClick = (pagamento) => {
    const pagamentoId = `${pagamento.id}-${Date.now()}`;
    
    // Adicionar pagamento à lista de selecionados
    setPagamentosSelecionados(prev => [...prev, { ...pagamento, id: pagamentoId }]);
    
    // Verificar se é dinheiro
    const isDinheiro = pagamento.nome.toLowerCase().includes('dinheiro');
    
    if (!isDinheiro) {
      // Para pagamentos digitais, preencher com o valor restante
      const total = calcularTotal();
      const outrosPagamentos = Object.values(valoresPagamento)
        .reduce((sum, valor) => sum + (valor || 0), 0);
      
      const valorRestante = total - outrosPagamentos;
      setValoresPagamento(prev => ({
        ...prev,
        [pagamentoId]: Math.max(0, valorRestante)
      }));
    } else {
      // Para dinheiro, começar com 0
      setValoresPagamento(prev => ({
        ...prev,
        [pagamentoId]: 0
      }));
    }
  };

  const handleRemoverPagamento = (pagamentoId) => {
    const pagamento = pagamentosSelecionados.find(p => p.id === pagamentoId);
    
    // Se é um pagamento salvo, adicionar à lista de removidos
    if (pagamento && pagamento.isSalvo) {
      setPagamentosRemovidos(prev => [...prev, pagamento.pedidoPagamentoId]);
    }
    
    setPagamentosSelecionados(prev => prev.filter(p => p.id !== pagamentoId));
    setValoresPagamento(prev => {
      const newValores = { ...prev };
      delete newValores[pagamentoId];
      return newValores;
    });
    
    // Limpar marcação de limitado e erros
    setValoresLimitados(prev => {
      const newValores = { ...prev };
      delete newValores[pagamentoId];
      return newValores;
    });
    
    setErrosValores(prev => {
      const newErros = { ...prev };
      delete newErros[pagamentoId];
      return newErros;
    });
  };

  const handleValorChange = (pagamentoId, valor) => {
    const valorNumerico = parseFloat(valor) || 0;
    const pagamento = pagamentosSelecionados.find(p => p.id === pagamentoId);
    
    if (!pagamento) return;
    
    // Verificar se é dinheiro (pode ultrapassar o total)
    const isDinheiro = pagamento.nome.toLowerCase().includes('dinheiro');
    
    if (!isDinheiro) {
      // Para pagamentos digitais (PIX, Cartão), não pode ultrapassar o valor restante
      // Calcular restante considerando apenas os outros pagamentos (não o atual)
      const total = calcularTotal();
      const outrosPagamentos = Object.entries(valoresPagamento)
        .filter(([id]) => id !== pagamentoId)
        .reduce((sum, [, valor]) => sum + (valor || 0), 0);
      
      const valorRestante = total - outrosPagamentos;
      
      // Se o novo valor ultrapassar o restante, mostrar erro
      if (valorNumerico > valorRestante) {
        setErrosValores(prev => ({
          ...prev,
          [pagamentoId]: `Valor não pode ser maior que R$ ${valorRestante.toFixed(2)}`
        }));
        // Não aplicar o valor inválido
        return;
      } else {
        // Remover erro se valor for válido
        setErrosValores(prev => {
          const newErros = { ...prev };
          delete newErros[pagamentoId];
          return newErros;
        });
      }
    }
    
    // Para dinheiro ou valores válidos, aplicar normalmente
    setValoresPagamento(prev => ({
      ...prev,
      [pagamentoId]: valorNumerico
    }));
  };

  // Verificar se um pagamento está selecionado (para mostrar hover)
  const isPagamentoSelecionado = (pagamento) => {
    return pagamentosSelecionados.some(p => p.nome === pagamento.nome);
  };

  // Calcular valor por pessoa
  const calcularValorPorPessoa = () => {
    const total = calcularTotal();
    return quantidadePessoas > 0 ? total / quantidadePessoas : 0;
  };

  // Calcular total pago (valor real sendo pago, incluindo troco)
  const calcularTotalPago = () => {
    return Object.values(valoresPagamento).reduce((total, valor) => total + (valor || 0), 0);
  };

  // Calcular restante
  const calcularRestante = () => {
    const total = calcularTotal();
    const pago = calcularTotalPago();
    
    // Se o valor pago é maior ou igual ao total, não há restante
    if (pago >= total) {
      return 0;
    }
    
    return total - pago;
  };

  // Calcular troco
  const calcularTroco = () => {
    const total = calcularTotal();
    const pago = calcularTotalPago();
    
    // Troco é o valor excedente quando pago > total
    if (pago > total) {
      return pago - total;
    }
    
    return 0;
  };

  // Verificar se pode finalizar pagamento (tem pelo menos um pagamento com valor > 0)
  const podeFinalizarPagamento = () => {
    return Object.values(valoresPagamento).some(valor => valor > 0);
  };

  const handleFinalizarPagamento = async () => {
    if (!pedidoId) {
      console.error('❌ Pedido ID não fornecido');
      return;
    }

    const pago = calcularTotalPago();
    const restante = calcularRestante();
    const troco = calcularTroco();
    
    console.log('💳 Finalizando pagamento...', { 
      pedidoId, 
      caixaId,
      pagamentosSelecionados, 
      valoresPagamento, 
      pago, 
      restante,
      troco 
    });

    try {
      // Excluir pagamentos removidos do banco
      if (pagamentosRemovidos.length > 0) {
        console.log('🗑️ Excluindo pagamentos removidos:', pagamentosRemovidos);
        for (const pagamentoId of pagamentosRemovidos) {
          await pedidosPagamentosService.deletePagamentoById(pagamentoId);
        }
      }

      // Preparar dados dos pagamentos para salvar
      const pagamentosParaSalvar = pagamentosSelecionados
        .filter(pagamento => (valoresPagamento[pagamento.id] || 0) > 0)
        .map(pagamento => ({
          pagamento_id: pagamento.isSalvo ? pagamento.pagamentoId : pagamento.id.split('-')[0],
          valor_pago: valoresPagamento[pagamento.id] || 0
        }));

      if (pagamentosParaSalvar.length === 0) {
        console.warn('⚠️ Nenhum pagamento com valor > 0 para salvar');
        return;
      }

      // Salvar pagamentos no banco
      const response = await pedidosPagamentosService.savePagamentos(
        pedidoId, 
        pagamentosParaSalvar, 
        caixaId
      );

      if (response.success) {
        console.log('✅ Pagamentos salvos com sucesso:', response.data);
        
        // Recarregar dados do pedido para mostrar os pagamentos salvos
        await carregarDadosPedido();
        
        // Limpar seleções atuais
        setPagamentosSelecionados([]);
        setValoresPagamento({});
        
        // Passar dados de pagamento para o painel detalhes
        if (onFinalizarPagamento) {
          onFinalizarPagamento({ 
            pago: response.data.valores.valor_pago,
            restante: response.data.valores.valor_restante,
            troco: response.data.valores.valor_troco,
            situacao: response.data.pedido.situacao
          });
        }
      } else {
        console.error('❌ Erro ao salvar pagamentos:', response.message);
        // Ainda assim, passar os dados para o painel detalhes (modo offline)
        if (onFinalizarPagamento) {
          onFinalizarPagamento({ pago, restante, troco });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar pagamento:', error);
      // Em caso de erro, ainda passar os dados para o painel detalhes
      if (onFinalizarPagamento) {
        onFinalizarPagamento({ pago, restante, troco });
      }
    }
  };

  const handleAdicionarCliente = () => {
    setClienteTemporario(null); // Limpar seleção temporária
    setIsClienteModalOpen(true);
  };

  const handleClienteSelect = async (cliente) => {
    console.log('👤 Cliente selecionado:', cliente);
    setClienteSelecionado(cliente);
    setIsClienteModalOpen(false);
    
    // Salvar cliente_id no pedido
    if (pedidoId && cliente?.id) {
      try {
        console.log('💾 Salvando cliente_id no pedido:', { pedidoId, clienteId: cliente.id });
        
        const response = await pedidoService.atualizar(pedidoId, {
          cliente_id: cliente.id
        });
        
        if (response.success) {
          console.log('✅ Cliente salvo no pedido com sucesso:', response.data);
          
          // Atualizar pedidoAtual se estiver disponível
          if (pedidoAtual) {
            pedidoAtual.cliente_id = cliente.id;
            pedidoAtual.cliente_nome = cliente.nome;
          }
        } else {
          console.error('❌ Erro ao salvar cliente no pedido:', response.message);
        }
      } catch (error) {
        console.error('❌ Erro ao salvar cliente no pedido:', error);
      }
    } else {
      console.warn('⚠️ PedidoId ou cliente.id não encontrado:', { pedidoId, clienteId: cliente?.id });
    }
  };

  const handleCloseClienteModal = () => {
    setClienteTemporario(null); // Limpar seleção temporária
    setIsClienteModalOpen(false);
  };


  return (
    <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton 
            onClick={onBack} 
            isRound={true}
            size="small"
            iconSize={16}
          />
          <h2 className="text-xs sm:text-sm font-bold text-gray-800">Pagamentos</h2>
        </div>
      </div>

      {/* Listagem de Pagamentos em Cards */}
      <div className="flex-1 p-3 sm:p-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : pagamentos.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Nenhum pagamento cadastrado</p>
              <p className="text-sm">Adicione métodos de pagamento</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {pagamentos.map((pagamento) => (
                <div 
                  key={pagamento.id} 
                  className={`rounded-lg shadow-sm border p-2 transition-all duration-200 cursor-pointer group ${
                    isPagamentoSelecionado(pagamento)
                      ? 'bg-blue-100 border-blue-300 shadow-md'
                      : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                  }`}
                  onClick={() => handlePagamentoClick(pagamento)}
                >
                  <div className="text-center">
                    <h3 className={`text-xs font-medium transition-colors duration-200 ${
                      isPagamentoSelecionado(pagamento)
                        ? 'text-blue-700'
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      {pagamento.nome}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botão Adicionar Cliente */}
            <button
              onClick={handleAdicionarCliente}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 text-sm font-medium ${
                clienteSelecionado 
                  ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400" 
                  : "bg-white text-orange-600 border-orange-600 hover:bg-orange-50 hover:border-orange-700"
              }`}
            >
              {clienteSelecionado ? (
                <>
                  <User className="w-4 h-4" />
                  <span className="truncate">{clienteSelecionado.nome}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Cliente</span>
                </>
              )}
            </button>

            {/* Resumo do Pedido com Divisor de Conta */}
            <div className="mt-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Resumo do Pedido</h3>
                </div>

                {/* Conteúdo */}
                <div className="p-3 space-y-2">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total:</span>
                    <span className="text-base font-bold text-blue-600">
                      R$ {calcularTotal().toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                   {/* Pago e Restante/Troco */}
                   {(dadosPedido.valor_pago > 0 || calcularTotalPago() > 0) && (
                     <div className="space-y-1">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-500">Pago:</span>
                         <span className="text-xs text-gray-500">
                           R$ {calcularTotalPago().toFixed(2).replace('.', ',')}
                         </span>
                       </div>
                       {calcularRestante() > 0 && (
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-500">Restante:</span>
                           <span className="text-xs text-gray-500">
                             R$ {calcularRestante().toFixed(2).replace('.', ',')}
                           </span>
                         </div>
                       )}
                       {calcularTroco() > 0 && (
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-500">Troco:</span>
                           <span className="text-xs text-gray-500">
                             R$ {calcularTroco().toFixed(2).replace('.', ',')}
                           </span>
                         </div>
                       )}
                     </div>
                   )}

                  {/* Divisor de Conta */}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                          Dividir conta:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={quantidadePessoas || ''}
                          onChange={(e) => setQuantidadePessoas(parseInt(e.target.value) || 0)}
                          className="w-10 h-6 px-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs text-center"
                          placeholder="0"
                        />
                      </div>
                      
                      {/* Total por pessoa - só aparece se dividir conta > 0 */}
                      {quantidadePessoas > 0 && (
                        <div className="text-right">
                          <span className="text-xs font-medium text-gray-700">Total:</span>
                          <span className="text-sm font-bold text-gray-900 ml-1">
                            R$ {calcularValorPorPessoa().toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

             {/* Pagamentos Selecionados */}
             {pagamentosSelecionados.length > 0 && (
              <div className="mt-4 flex-1 flex flex-col">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">Formas de Pagamento</h4>
                  </div>

                  {/* Lista com altura limitada e rolagem interna */}
                  <div className="overflow-y-auto h-38 scrollbar-hide">
                     <div className="space-y-2 p-3">
                       {pagamentosSelecionados.map((pagamento) => (
                         <div 
                           key={pagamento.id} 
                           className={`rounded-lg border p-2 ${
                             pagamento.isSalvo 
                               ? 'bg-green-50 border-green-200' 
                               : 'bg-gray-50 border-gray-200'
                           }`}
                         >
                           <div className="flex items-center gap-2">
                             <div className="flex-1">
                               <div className="flex items-center gap-2">
                                 {pagamento.isSalvo && (
                                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 )}
                                 <span className={`text-xs font-medium ${
                                   pagamento.isSalvo ? 'text-green-900' : 'text-gray-900'
                                 }`}>
                                   {pagamento.nome}
                                 </span>
                               </div>
                             </div>
                             <div className="flex items-center gap-1">
                               <span className="text-xs text-gray-600">R$</span>
                               <input
                                 type="number"
                                 step="0.01"
                                 min="0"
                                 value={valoresPagamento[pagamento.id] || ''}
                                 onChange={(e) => handleValorChange(pagamento.id, e.target.value)}
                                 className={`w-16 px-1 py-1 border rounded text-xs text-right focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                   pagamento.isSalvo 
                                     ? 'border-green-300 bg-green-100' 
                                     : errosValores[pagamento.id]
                                     ? 'border-red-400 bg-red-50'
                                     : 'border-gray-300'
                                 }`}
                                 placeholder="0,00"
                                 title={valoresLimitados[pagamento.id] ? 'Valor limitado ao restante disponível' : ''}
                               />
                               <CloseButton
                                 onClick={() => handleRemoverPagamento(pagamento.id)}
                                 variant="minimal"
                                 className="w-5 h-5"
                               />
                             </div>
                           </div>
                           
                           {/* Mensagem de erro */}
                           {errosValores[pagamento.id] && (
                             <div className="mt-1 text-xs text-red-600">
                               {errosValores[pagamento.id]}
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer com Botão Finalizar Pagamento */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex-shrink-0">
        <AddButton
          text="Finalizar Pagamento"
          onClick={handleFinalizarPagamento}
          fullWidth={true}
          showIcon={true}
          size="sm"
          disabled={!podeFinalizarPagamento()}
          className={`${
            podeFinalizarPagamento()
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700'
              : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
          }`}
        />
      </div>

      {/* Modal de Seleção de Cliente */}
      <BaseModal
        isOpen={isClienteModalOpen}
        onClose={handleCloseClienteModal}
        onSave={() => {
          // Confirmar a seleção temporária
          if (clienteTemporario) {
            handleClienteSelect(clienteTemporario);
          }
        }}
        title="Selecionar Cliente"
        description="Escolha um cliente para o pedido"
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <ListClientes
          selectedCliente={clienteTemporario}
          onClienteSelect={(cliente) => {
            // Armazenar temporariamente o cliente selecionado
            setClienteTemporario(cliente);
          }}
        />
      </BaseModal>
    </div>
  );
};

export default PaymentsPanel;

