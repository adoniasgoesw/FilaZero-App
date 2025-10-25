import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../buttons/Back';
import { ChevronDown, ChevronUp, Pencil, Save, X, Percent, DollarSign, AlertTriangle } from 'lucide-react';
import Action from '../buttons/Action';
import SaveButton from '../buttons/Save';
import CloseButton from '../buttons/Close';
import ListPedido from '../lists/ListPedido';
import ListValores from '../lists/ListValores';
import Discount from '../buttons/Discount';
import Increase from '../buttons/Increase';
import Kitchen from '../buttons/Kitchen';
import Print from '../buttons/Print';
import Delete from '../buttons/Delete';
import AddButton from '../buttons/Add';
import ConfirmDialog from '../elements/ConfirmDialog';
import Notification from '../elements/Notification';
import atendimentoService from '../../services/atendimentoService';
import pedidoService from '../../services/pedidoService';
import descontoAcrescimoService from '../../services/descontoAcrescimoService';
import finalizarPedidoService from '../../services/finalizarPedidoService';

const DetailsPanel = ({ pontoAtendimento, onBack, pedidos = [], onDeleteItem, onAddPayment, pagamentosData = { pago: 0, restante: 0 }, pedidoAtual = null, onPedidoExcluido = null, onPedidoAtualizado = null, onPedidoFinalizado = null, onSaveItems = null }) => {
  const navigate = useNavigate();
  const [nomePedido, setNomePedido] = useState(pontoAtendimento?.nome_ponto || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempNomePedido, setTempNomePedido] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isIncreaseDialogOpen, setIsIncreaseDialogOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [increaseValue, setIncreaseValue] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' ou 'money'
  const [increaseType, setIncreaseType] = useState('percentage'); // 'percentage' ou 'money'
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [isFinalizarDialogOpen, setIsFinalizarDialogOpen] = useState(false);
  const [isExitConfirmDialogOpen, setIsExitConfirmDialogOpen] = useState(false);

  // Nome do pedido poderá ser editado em fluxo futuro; por ora, ícone apenas

  // Função para verificar se há itens não salvos
  const hasUnsavedItems = () => {
    return pedidos.some(pedido => !pedido.salvo && pedido.quantidade > 0);
  };

  // Componente Action personalizado para tipos de desconto/acréscimo
  const TypeAction = ({ currentType, onTypeChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleTypeSelect = (type) => {
      onTypeChange(type);
      setIsOpen(false);
    };

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Botão Principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          <span>{currentType === 'percentage' ? '%' : 'R$'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-20 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => handleTypeSelect('percentage')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                %
              </button>
              <button
                onClick={() => handleTypeSelect('money')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                R$
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleDiscount = async () => {
    if (!pedidoAtual?.id) return;
    
    try {
      const response = await descontoAcrescimoService.buscarDesconto(pedidoAtual.id);
      if (response.success) {
        setDiscountValue(response.data.valor || '');
        setDiscountType(response.data.tipo || 'percentage');
      } else {
        setDiscountValue('');
        setDiscountType('percentage');
      }
    } catch (error) {
      console.error('Erro ao buscar desconto:', error);
      setDiscountValue('');
      setDiscountType('percentage');
    }
    
    setIsDiscountDialogOpen(true);
  };

  const handleIncrease = async () => {
    if (!pedidoAtual?.id) return;
    
    try {
      const response = await descontoAcrescimoService.buscarAcrescimo(pedidoAtual.id);
      if (response.success) {
        setIncreaseValue(response.data.valor || '');
        setIncreaseType(response.data.tipo || 'percentage');
      } else {
        setIncreaseValue('');
        setIncreaseType('percentage');
      }
    } catch (error) {
      console.error('Erro ao buscar acréscimo:', error);
      setIncreaseValue('');
      setIncreaseType('percentage');
    }
    
    setIsIncreaseDialogOpen(true);
  };

  const handleKitchen = () => {
    console.log('Enviar para cozinha');
  };

  const handlePrint = () => {
    console.log('Imprimir pedido');
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    
    // Marcar imediatamente que o pedido será excluído
    if (onPedidoExcluido) {
      onPedidoExcluido();
    }
    
    setIsDeleting(true);
    console.log('🗑️ Iniciando exclusão completa do pedido...');
    
    try {
      // Usar o pedido atual passado como prop
      if (!pedidoAtual) {
        setNotification({ message: 'Nenhum pedido encontrado para excluir', type: 'error' });
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        return;
      }

      console.log('📋 Pedido encontrado:', pedidoAtual);

      // Chamar o serviço de exclusão completa
      const response = await pedidoService.deletarCompleto(pedidoAtual.id);
      
      if (response.success) {
        console.log('✅ Pedido excluído com sucesso:', response);
        setNotification({ message: 'Pedido excluído com sucesso', type: 'success' });
        
        // Fechar o diálogo
        setIsDeleteDialogOpen(false);
        
        // Forçar atualização da lista antes de redirecionar
        if (window.atualizarListaPontos) {
          console.log('🔄 Forçando atualização da lista...');
          window.atualizarListaPontos();
        }
        
        // Redirecionar para a página Home após um pequeno delay para mostrar a notificação
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        console.error('❌ Erro ao excluir pedido:', response.message);
        setNotification({ message: 'Erro ao excluir pedido: ' + response.message, type: 'error' });
      }
    } catch (error) {
      console.error('❌ Erro ao excluir pedido:', error);
      setNotification({ message: 'Erro ao excluir pedido. Tente novamente.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  // Funções para desconto
  const handleConfirmDiscount = async () => {
    if (!pedidoAtual?.id) {
      setNotification({ message: 'Nenhum pedido encontrado para aplicar desconto', type: 'error' });
      return;
    }
    
    // Se o valor estiver vazio ou zero, remover desconto
    if (!discountValue.trim() || discountValue === '0' || discountValue === '0,00') {
      try {
        console.log('Removendo desconto:', { pedidoId: pedidoAtual.id });
        
        const response = await descontoAcrescimoService.removerDesconto(pedidoAtual.id);
        
        if (response.success) {
          setNotification({ 
            message: 'Desconto removido com sucesso!', 
            type: 'success' 
          });
          
          // Atualizar o pedido atual com os novos dados
          if (onPedidoAtualizado && response.data.pedido) {
            console.log('🔄 Atualizando pedidoAtual após remoção de desconto:', response.data.pedido);
            onPedidoAtualizado(response.data.pedido);
          }
          
          // Atualizar a lista de pedidos
          if (window.atualizarListaPontos) {
            window.atualizarListaPontos();
          }
        } else {
          setNotification({ message: response.message || 'Erro ao remover desconto', type: 'error' });
        }
      } catch (error) {
        console.error('Erro ao remover desconto:', error);
        setNotification({ message: 'Erro ao remover desconto. Tente novamente.', type: 'error' });
      }
    } else {
      // Aplicar desconto normalmente
      const value = parseFloat(discountValue);
      if (isNaN(value) || value <= 0) {
        setNotification({ message: 'Por favor, digite um valor válido', type: 'warning' });
        return;
      }
      
      try {
        console.log('Aplicando desconto:', { pedidoId: pedidoAtual.id, value, type: discountType });
        
        const response = await descontoAcrescimoService.aplicarDesconto(
          pedidoAtual.id, 
          value, 
          discountType
        );
        
        if (response.success) {
          setNotification({ 
            message: `Desconto de ${discountValue}${discountType === 'percentage' ? '%' : ' R$'} aplicado! Total: R$ ${response.data.totalNovo.toFixed(2)}`, 
            type: 'success' 
          });
          
          // Atualizar o pedido atual com os novos dados
          if (onPedidoAtualizado && response.data.pedido) {
            console.log('🔄 Atualizando pedidoAtual com novos dados (desconto):', response.data.pedido);
            onPedidoAtualizado(response.data.pedido);
          } else {
            console.log('⚠️ onPedidoAtualizado não disponível ou dados não encontrados (desconto)');
          }
          
          // Atualizar a lista de pedidos
          if (window.atualizarListaPontos) {
            window.atualizarListaPontos();
          }
        } else {
          setNotification({ message: response.message || 'Erro ao aplicar desconto', type: 'error' });
        }
      } catch (error) {
        console.error('Erro ao aplicar desconto:', error);
        setNotification({ message: 'Erro ao aplicar desconto. Tente novamente.', type: 'error' });
      }
    }
    
    setIsDiscountDialogOpen(false);
    setDiscountValue('');
  };

  const handleCancelDiscount = () => {
    setIsDiscountDialogOpen(false);
    setDiscountValue('');
  };

  // Funções para acréscimo
  const handleConfirmIncrease = async () => {
    if (!pedidoAtual?.id) {
      setNotification({ message: 'Nenhum pedido encontrado para aplicar acréscimo', type: 'error' });
      return;
    }
    
    // Se o valor estiver vazio ou zero, remover acréscimo
    if (!increaseValue.trim() || increaseValue === '0' || increaseValue === '0,00') {
      try {
        console.log('Removendo acréscimo:', { pedidoId: pedidoAtual.id });
        
        const response = await descontoAcrescimoService.removerAcrescimo(pedidoAtual.id);
        
        if (response.success) {
          setNotification({ 
            message: 'Acréscimo removido com sucesso!', 
            type: 'success' 
          });
          
          // Atualizar o pedido atual com os novos dados
          if (onPedidoAtualizado && response.data.pedido) {
            console.log('🔄 Atualizando pedidoAtual após remoção de acréscimo:', response.data.pedido);
            onPedidoAtualizado(response.data.pedido);
          }
          
          // Atualizar a lista de pedidos
          if (window.atualizarListaPontos) {
            window.atualizarListaPontos();
          }
        } else {
          setNotification({ message: response.message || 'Erro ao remover acréscimo', type: 'error' });
        }
      } catch (error) {
        console.error('Erro ao remover acréscimo:', error);
        setNotification({ message: 'Erro ao remover acréscimo. Tente novamente.', type: 'error' });
      }
    } else {
      // Aplicar acréscimo normalmente
      const value = parseFloat(increaseValue);
      if (isNaN(value) || value <= 0) {
        setNotification({ message: 'Por favor, digite um valor válido', type: 'warning' });
        return;
      }
      
      try {
        console.log('Aplicando acréscimo:', { pedidoId: pedidoAtual.id, value, type: increaseType });
        
        const response = await descontoAcrescimoService.aplicarAcrescimo(
          pedidoAtual.id, 
          value, 
          increaseType
        );
        
        if (response.success) {
          setNotification({ 
            message: `Acréscimo de ${increaseValue}${increaseType === 'percentage' ? '%' : ' R$'} aplicado! Total: R$ ${response.data.totalNovo.toFixed(2)}`, 
            type: 'success' 
          });
          
          // Atualizar o pedido atual com os novos dados
          if (onPedidoAtualizado && response.data.pedido) {
            console.log('🔄 Atualizando pedidoAtual com novos dados (acréscimo):', response.data.pedido);
            onPedidoAtualizado(response.data.pedido);
          } else {
            console.log('⚠️ onPedidoAtualizado não disponível ou dados não encontrados (acréscimo)');
          }
          
          // Atualizar a lista de pedidos
          if (window.atualizarListaPontos) {
            window.atualizarListaPontos();
          }
        } else {
          setNotification({ message: response.message || 'Erro ao aplicar acréscimo', type: 'error' });
        }
      } catch (error) {
        console.error('Erro ao aplicar acréscimo:', error);
        setNotification({ message: 'Erro ao aplicar acréscimo. Tente novamente.', type: 'error' });
      }
    }
    
    setIsIncreaseDialogOpen(false);
    setIncreaseValue('');
  };

  const handleCancelIncrease = () => {
    setIsIncreaseDialogOpen(false);
    setIncreaseValue('');
  };

  const handleSaveNomePedido = async () => {
    if (!tempNomePedido.trim()) {
      setNotification({ message: 'Por favor, digite um nome para o pedido', type: 'warning' });
      return;
    }

    if (!pontoAtendimento?.id) {
      setNotification({ message: 'Erro: ID do ponto de atendimento não encontrado', type: 'error' });
      return;
    }

    try {
      // Salvar no banco de dados
      const response = await atendimentoService.atualizarNomePonto(
        pontoAtendimento.id, 
        tempNomePedido.trim()
      );

      if (response.success) {
        // Atualizar estado local
        setNomePedido(tempNomePedido.trim());
        setIsEditingName(false);
        
        // Atualizar o ponto de atendimento com o novo nome
        if (pontoAtendimento) {
          pontoAtendimento.nome_ponto = tempNomePedido.trim();
        }
        
        console.log('✅ Nome do pedido salvo:', tempNomePedido.trim());
        setNotification({ message: 'Nome do pedido salvo com sucesso!', type: 'success' });
      } else {
        setNotification({ message: 'Erro ao salvar nome do pedido: ' + response.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao salvar nome do pedido:', error);
      setNotification({ message: 'Erro ao salvar nome do pedido. Tente novamente.', type: 'error' });
    }
  };

  const handleAddPayment = () => {
    if (onAddPayment) onAddPayment();
  };

  const handleFinalizarPedido = () => {
    setIsFinalizarDialogOpen(true);
  };


  const handleSalvarPedido = async () => {
    try {
      console.log('🔄 Finalizando pedido (sem imprimir)...', { pedidoAtual });
      
      if (!pedidoAtual?.id) {
        throw new Error('ID do pedido não encontrado');
      }
      
      // Chamar API para finalizar pedido
      const response = await finalizarPedidoService.finalizarPedido(pedidoAtual.id, false);
      
      if (response.success) {
        setNotification({ 
          message: 'Pedido finalizado com sucesso', 
          type: 'success' 
        });
        
        setIsFinalizarDialogOpen(false);
        
        // Notificar que o pedido foi finalizado
        if (onPedidoFinalizado) {
          onPedidoFinalizado();
        }
        
        // Redirecionar para home após um delay
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      setNotification({ 
        message: 'Erro ao finalizar pedido: ' + error.message, 
        type: 'error' 
      });
    }
  };

  // Funções para o diálogo de confirmação de saída
  const handleExitWithoutSaving = () => {
    setIsExitConfirmDialogOpen(false);
    onBack();
  };

  const handleSaveAndExit = async () => {
    try {
      // Salvar itens primeiro
      if (onSaveItems) {
        await onSaveItems();
      }
      
      // Fechar diálogo e sair
      setIsExitConfirmDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Erro ao salvar itens:', error);
      setNotification({ 
        message: 'Erro ao salvar itens: ' + error.message, 
        type: 'error' 
      });
    }
  };

  const handleImprimirSalvarPedido = async () => {
    try {
      console.log('🔄 Finalizando pedido (com impressão)...', { pedidoAtual });
      
      if (!pedidoAtual?.id) {
        throw new Error('ID do pedido não encontrado');
      }
      
      // Chamar API para finalizar pedido com impressão
      const response = await finalizarPedidoService.finalizarPedido(pedidoAtual.id, true);
      
      if (response.success) {
        setNotification({ 
          message: 'Pedido finalizado com sucesso', 
          type: 'success' 
        });
        
        setIsFinalizarDialogOpen(false);
        
        // Notificar que o pedido foi finalizado
        if (onPedidoFinalizado) {
          onPedidoFinalizado();
        }
        
        // Redirecionar para home após um delay
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Erro ao finalizar e imprimir pedido:', error);
      setNotification({ 
        message: 'Erro ao finalizar pedido: ' + error.message, 
        type: 'error' 
      });
    }
  };

  const handleCancelFinalizar = () => {
    setIsFinalizarDialogOpen(false);
  };

  // Verificar se o total está pago (valor_pago === valor_total)
  const isTotalPago = () => {
    // Calcular total atual do pedido
    const totalAtual = pedidos.reduce((sum, pedido) => {
      const preco = parseFloat(pedido.preco) || 0;
      const quantidade = parseFloat(pedido.quantidade) || 0;
      return sum + (preco * quantidade);
    }, 0);
    
    // Aplicar desconto e acréscimo se existirem
    let totalComDescontoAcrescimo = totalAtual;
    
    if (pedidoAtual) {
      const desconto = parseFloat(pedidoAtual.desconto) || 0;
      const acrescimo = parseFloat(pedidoAtual.acrescimos) || 0;
      totalComDescontoAcrescimo = totalAtual - desconto + acrescimo;
    }
    
    const valorPago = pagamentosData.pago || 0;
    const valorTotal = totalComDescontoAcrescimo;
    
    console.log('🔍 Verificação isTotalPago:', {
      valorPago,
      valorTotal,
      totalAtual,
      desconto: pedidoAtual?.desconto || 0,
      acrescimo: pedidoAtual?.acrescimos || 0,
      isPago: valorPago === valorTotal
    });
    
    // LÓGICA: Se valor pago é igual ao valor total, está pago
    return valorPago === valorTotal && valorPago > 0;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Verificar se precisa mostrar o botão de expansão (mais de 3 itens)
  const shouldShowExpandButton = pedidos.length > 3;


  return (
    <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col max-h-full">
      {/* Header - Voltar + Mesa à esquerda, Nome do Pedido (ícone) à direita */}
      <div className="relative border-b border-gray-200 flex-shrink-0 bg-white overflow-hidden">
        {/* Linha base com os botões e título, escondida quando editando */}
        <div className={`h-16 flex items-center justify-between p-3 sm:p-4 ${isEditingName ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Esquerda: Voltar + Mesa */}
          <div className="flex items-center gap-3">
            <BackButton 
              onClick={() => {
                // Verificar se há itens não salvos
                if (hasUnsavedItems()) {
                  setIsExitConfirmDialogOpen(true);
                } else {
                  onBack();
                }
              }} 
              isRound={true}
              size="small"
              iconSize={16}
            />
            <h2 className="text-xs sm:text-sm font-bold text-gray-800">
              {pontoAtendimento?.identificador || 'Ponto de Atendimento'}
            </h2>
          </div>

          {/* Direita: Botão Nome do Pedido (ícone somente) */}
          <div className={`flex-shrink-0 ${isEditingName ? 'hidden' : ''}`}>
            <button
              onClick={() => { setIsEditingName(true); setTempNomePedido(nomePedido); }}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-blue-600 border border-gray-300 flex items-center justify-center transition-all duration-200"
              title={nomePedido ? `Nome do pedido: ${nomePedido}` : 'Definir nome do pedido'}
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>

        {/* Gaveta de Edição - desliza da direita para a esquerda */}
        <div className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${isEditingName ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="p-3 sm:p-4">
            <div className="relative">
              <input
                type="text"
                value={tempNomePedido}
                onChange={(e) => setTempNomePedido(e.target.value)}
                placeholder="Digite o nome do pedido"
                className="w-full h-10 sm:h-10 text-sm border-2 border-gray-200 rounded-xl pl-3 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300"
              />
              {/* Ações dentro do input */}
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                <button
                  onClick={() => setIsEditingName(false)}
                  className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleSaveNomePedido}
                  className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  title="Salvar"
                >
                  <Save size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do Painel - Lista de Pedidos e Valores */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-3">
        <div className="relative">
          <ListPedido 
            pedidos={pedidos}
            onDeleteItem={onDeleteItem}
            isExpanded={isExpanded}
          />
          
          {/* Botão Flutuante - só aparece quando necessário */}
          {shouldShowExpandButton && (
            <button
              onClick={toggleExpanded}
              className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-10 animate-pulse hover:animate-none hover:scale-110"
              title={isExpanded ? "Contrair lista" : "Expandir lista"}
            >
              {isExpanded ? (
                <ChevronUp size={16} className="animate-bounce" />
              ) : (
                <ChevronDown size={16} className="animate-bounce" />
              )}
            </button>
          )}
        </div>
        
        {/* ListValores - escondido quando expandido */}
        {!isExpanded && (
          <ListValores 
            pedidos={pedidos} 
            pagamentosData={pagamentosData}
            pedidoAtual={pedidoAtual}
          />
        )}
      </div>

      {/* Footer com Botões de Ação - escondido quando expandido */}
      {!isExpanded && (
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex-shrink-0">
          <div className="space-y-4">
            {/* 5 Botões de Ação */}
            <div className="flex items-center justify-center gap-3">
              <Discount 
                onClick={handleDiscount}
                size="large"
              />
              <Increase 
                onClick={handleIncrease}
                size="large"
              />
              <Kitchen 
                onClick={handleKitchen}
                size="large"
              />
              <Print 
                onClick={handlePrint}
                size="large"
              />
              <Delete 
                onClick={handleDelete}
                size="large"
              />
            </div>
            
            {/* Botão Adicionar Pagamento / Finalizar Pedido */}
            <AddButton 
              text={isTotalPago() ? "Finalizar Pedido" : "Adicionar Pagamento"}
              onClick={isTotalPago() ? handleFinalizarPedido : handleAddPayment}
              fullWidth={true}
              showIcon={false}
              size="sm"
              className={isTotalPago() ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
            />
          </div>
        </div>
      )}

      {/* ConfirmDialog para deletar pedido */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Pedido"
        message="Tem certeza que deseja excluir este pedido?"
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        type="delete"
        customButtonColor="red"
        isLoading={isDeleting}
      />

      {/* ConfirmDialog para desconto */}
      <ConfirmDialog
        isOpen={isDiscountDialogOpen}
        onClose={handleCancelDiscount}
        onConfirm={handleConfirmDiscount}
        title="Gerenciar Desconto"
        message="Digite o valor do desconto ou deixe vazio para remover:"
        confirmText="Salvar"
        cancelText="Cancelar"
        type="warning"
        customIcon={<Percent />}
        customIconColor="green"
        customButtonColor="green"
        customContent={
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Digite o valor do desconto ou deixe vazio"
                className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              <TypeAction
                currentType={discountType}
                onTypeChange={setDiscountType}
              />
            </div>
          </div>
        }
      />

      {/* ConfirmDialog para acréscimo */}
      <ConfirmDialog
        isOpen={isIncreaseDialogOpen}
        onClose={handleCancelIncrease}
        onConfirm={handleConfirmIncrease}
        title="Gerenciar Acréscimo"
        message="Digite o valor do acréscimo ou deixe vazio para remover:"
        confirmText="Salvar"
        cancelText="Cancelar"
        type="info"
        customIcon={<DollarSign />}
        customIconColor="yellow"
        customButtonColor="yellow"
        customContent={
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={increaseValue}
                onChange={(e) => setIncreaseValue(e.target.value)}
                placeholder="Digite o valor do acréscimo ou deixe vazio"
                className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                autoFocus
              />
              <TypeAction
                currentType={increaseType}
                onTypeChange={setIncreaseType}
              />
            </div>
          </div>
        }
      />

      {/* ConfirmDialog para finalizar pedido */}
      <ConfirmDialog
        isOpen={isFinalizarDialogOpen}
        onClose={handleCancelFinalizar}
        isFinalizarPedido={true}
        title="Finalizar Pedido"
        message="Como você deseja finalizar o pedido?"
        onSalvar={handleSalvarPedido}
        onImprimirSalvar={handleImprimirSalvarPedido}
        salvarText="Finalizar"
        imprimirSalvarText="Finalizar e Imprimir"
        type="confirm"
      />

      {/* ConfirmDialog para sair com itens não salvos */}
      <ConfirmDialog
        isOpen={isExitConfirmDialogOpen}
        onClose={() => setIsExitConfirmDialogOpen(false)}
        onSalvar={handleExitWithoutSaving}
        onImprimirSalvar={handleSaveAndExit}
        isFinalizarPedido={true}
        title="Itens não salvos"
        message="Tem certeza que deseja sair? Os itens adicionados não serão salvos."
        salvarText="Sair"
        imprimirSalvarText="Salvar e Sair"
        type="warning"
        customIcon={<AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />}
        customIconColor="blue"
      />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default DetailsPanel;