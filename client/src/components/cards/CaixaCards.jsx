import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Plus, Minus } from 'lucide-react';
import AddButton from '../buttons/Add';
import ConfirmDialog from '../elements/ConfirmDialog';
import { API_URL } from '../../services/api';
import { getUserData } from '../../services/auth';

const CaixaCards = ({ caixaData, onCaixaUpdate, onMovimentacaoAdded }) => {
  // Estados para diálogos de entrada e saída
  const [isEntradaDialogOpen, setIsEntradaDialogOpen] = useState(false);
  const [isSaidaDialogOpen, setIsSaidaDialogOpen] = useState(false);
  const [entradaDescricao, setEntradaDescricao] = useState('');
  const [entradaValor, setEntradaValor] = useState('');
  const [saidaDescricao, setSaidaDescricao] = useState('');
  const [saidaValor, setSaidaValor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const cards = [
    {
      title: 'Valor de Abertura',
      value: formatCurrency(caixaData?.valor_abertura),
      icon: DollarSign,
      iconColor: 'text-blue-600',
      hasAddButton: false
    },
    {
      title: 'Entradas',
      value: formatCurrency(caixaData?.entradas),
      icon: TrendingUp,
      iconColor: 'text-green-600',
      hasAddButton: true,
      buttonColor: 'green'
    },
    {
      title: 'Saídas',
      value: formatCurrency(caixaData?.saidas),
      icon: TrendingDown,
      iconColor: 'text-red-600',
      hasAddButton: true,
      buttonColor: 'red'
    },
    {
      title: 'Total de Vendas',
      value: formatCurrency(caixaData?.total_vendas),
      icon: ShoppingCart,
      iconColor: 'text-purple-600',
      hasAddButton: false
    }
  ];

  const handleAddClick = (type) => {
    console.log(`Adicionar ${type}`);
    if (type === 'entradas') {
      setIsEntradaDialogOpen(true);
    } else if (type === 'saídas') {
      setIsSaidaDialogOpen(true);
    }
  };

  // Funções para entrada
  const handleCancelEntrada = () => {
    setIsEntradaDialogOpen(false);
    setEntradaDescricao('');
    setEntradaValor('');
  };

  const handleConfirmEntrada = async () => {
    if (!entradaDescricao.trim() || !entradaValor.trim()) {
      alert('Por favor, preencha a descrição e o valor da entrada.');
      return;
    }

    const valor = parseFloat(entradaValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, digite um valor válido maior que zero.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = getUserData();
      const usuarioId = userData.userId || 1; // Fallback para ID 1 se não encontrar
      console.log('Adicionando entrada:', {
        caixa_id: caixaData?.id,
        tipo: 'entrada',
        descricao: entradaDescricao,
        valor: valor,
        usuario_id: usuarioId,
        userData: userData
      });

      const response = await fetch(`${API_URL}/movimentacoes-caixa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caixa_id: caixaData?.id,
          tipo: 'entrada',
          descricao: entradaDescricao,
          valor: valor,
          usuario_id: usuarioId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Fechar diálogo primeiro
        handleCancelEntrada();
        
        // Atualizar dados do caixa em tempo real
        if (onCaixaUpdate && result.data?.caixa) {
          onCaixaUpdate(result.data.caixa);
        }
        
        // Atualizar lista de movimentações em tempo real
        if (onMovimentacaoAdded) {
          onMovimentacaoAdded();
        }
        
        // Mostrar notificação de sucesso
        console.log(`✅ Entrada adicionada: ${entradaDescricao} - R$ ${valor.toFixed(2).replace('.', ',')}`);
      } else {
        alert(`Erro ao adicionar entrada: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error);
      alert('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para saída
  const handleCancelSaida = () => {
    setIsSaidaDialogOpen(false);
    setSaidaDescricao('');
    setSaidaValor('');
  };

  const handleConfirmSaida = async () => {
    if (!saidaDescricao.trim() || !saidaValor.trim()) {
      alert('Por favor, preencha a descrição e o valor da saída.');
      return;
    }

    const valor = parseFloat(saidaValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, digite um valor válido maior que zero.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = getUserData();
      const usuarioId = userData.userId || 1; // Fallback para ID 1 se não encontrar
      console.log('Adicionando saída:', {
        caixa_id: caixaData?.id,
        tipo: 'saida',
        descricao: saidaDescricao,
        valor: valor,
        usuario_id: usuarioId,
        userData: userData
      });

      const response = await fetch(`${API_URL}/movimentacoes-caixa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caixa_id: caixaData?.id,
          tipo: 'saida',
          descricao: saidaDescricao,
          valor: valor,
          usuario_id: usuarioId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Fechar diálogo primeiro
        handleCancelSaida();
        
        // Atualizar dados do caixa em tempo real
        if (onCaixaUpdate && result.data?.caixa) {
          onCaixaUpdate(result.data.caixa);
        }
        
        // Atualizar lista de movimentações em tempo real
        if (onMovimentacaoAdded) {
          onMovimentacaoAdded();
        }
        
        // Mostrar notificação de sucesso
        console.log(`✅ Saída adicionada: ${saidaDescricao} - R$ ${valor.toFixed(2).replace('.', ',')}`);
      } else {
        alert(`Erro ao adicionar saída: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar saída:', error);
      alert('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 min-w-0">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-2 md:p-4 hover:shadow-md transition-shadow duration-200 flex flex-col h-full min-w-0">
            {/* Header com ícone e botão */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 flex-shrink-0">
              <div className="p-0.5 sm:p-1 md:p-2 rounded-lg bg-gray-50">
                <IconComponent className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${card.iconColor}`} />
              </div>
              {card.hasAddButton && (
                <button
                  onClick={() => handleAddClick(card.title.toLowerCase())}
                  className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    card.buttonColor === 'green' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={`Adicionar ${card.title.toLowerCase()}`}
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Conteúdo principal - título e valor */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  {card.title}
                </p>
                <p className="text-xs sm:text-sm md:text-lg font-bold text-gray-900 truncate">
                  {card.value}
                </p>
              </div>
            </div>
            
            {/* Barra de progresso sutil */}
            <div className="mt-1.5 sm:mt-2 md:mt-3 w-full bg-gray-100 rounded-full h-1 flex-shrink-0">
              <div 
                className={`h-1 rounded-full ${
                  card.iconColor === 'text-blue-600' ? 'bg-blue-300' :
                  card.iconColor === 'text-green-600' ? 'bg-green-300' :
                  card.iconColor === 'text-red-600' ? 'bg-red-300' :
                  'bg-purple-300'
                }`}
                style={{ 
                  width: '100%',
                  opacity: 0.6
                }}
              ></div>
            </div>
          </div>
        );
      })}
      
      {/* ConfirmDialog para Entrada */}
      <ConfirmDialog
        isOpen={isEntradaDialogOpen}
        onClose={handleCancelEntrada}
        onConfirm={handleConfirmEntrada}
        title="Adicionar Entrada"
        message="Digite a descrição e o valor da entrada:"
        confirmText={isLoading ? "Salvando..." : "Salvar"}
        cancelText="Cancelar"
        type="success"
        customIcon={<TrendingUp />}
        customIconColor="green"
        customButtonColor="green"
        customContent={
          <div className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Entrada
                </label>
                <input
                  type="text"
                  value={entradaDescricao}
                  onChange={(e) => setEntradaDescricao(e.target.value)}
                  placeholder="Ex: Venda de produtos, recebimento de cliente..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Entrada (R$)
                </label>
                <input
                  type="text"
                  value={entradaValor}
                  onChange={(e) => setEntradaValor(e.target.value)}
                  placeholder="Ex: 50,00"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        }
      />

      {/* ConfirmDialog para Saída */}
      <ConfirmDialog
        isOpen={isSaidaDialogOpen}
        onClose={handleCancelSaida}
        onConfirm={handleConfirmSaida}
        title="Adicionar Saída"
        message="Digite a descrição e o valor da saída:"
        confirmText={isLoading ? "Salvando..." : "Salvar"}
        cancelText="Cancelar"
        type="error"
        customIcon={<TrendingDown />}
        customIconColor="red"
        customButtonColor="red"
        customContent={
          <div className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Saída
                </label>
                <input
                  type="text"
                  value={saidaDescricao}
                  onChange={(e) => setSaidaDescricao(e.target.value)}
                  placeholder="Ex: Compra de material, pagamento de fornecedor..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Saída (R$)
                </label>
                <input
                  type="text"
                  value={saidaValor}
                  onChange={(e) => setSaidaValor(e.target.value)}
                  placeholder="Ex: 25,50"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CaixaCards;
