import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { History } from 'lucide-react';
import Sidebar from '../components/layouts/Sidebar';
import SearchBar from '../components/layouts/SearchBar';
import CaixaActionButton from '../components/buttons/CaixaAction';
import BaseModal from '../components/modals/Base';
import FormCaixa from '../components/forms/FormCaixa';
import FormCloseCaixa from '../components/forms/FormCloseCaixa';
import ListCaixas from '../components/lists/ListCaixas';
import CaixaCards from '../components/cards/CaixaCards';
import ListPedidosHistorico from '../components/lists/ListPedidosHistorico';
import ListPagamentosHistorico from '../components/lists/ListPagamentosHistorico';
import ListMovimentacoesCaixa from '../components/lists/ListMovimentacoesCaixa';
import { API_URL } from '../services/api';

const Historic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = 'historic';
  const [isCaixaModalOpen, setIsCaixaModalOpen] = useState(false);
  const [isCloseCaixaModalOpen, setIsCloseCaixaModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [caixaStatus, setCaixaStatus] = useState('loading'); // 'loading', 'aberto', 'fechado', 'nenhum_caixa'
  const [caixaData, setCaixaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');
  const formCaixaRef = useRef();
  const formCloseCaixaRef = useRef();
  const refreshMovimentacoesRef = useRef();

  const handleNavigate = (page) => {
    console.log('=== NAVEGAÇÃO ===');
    console.log('Página solicitada:', page);
    console.log('Estado loading:', loading);
    console.log('Estado caixaStatus:', caixaStatus);
    
    // Forçar parar loading se estiver ativo
    if (loading) {
      console.log('Parando loading...');
      setLoading(false);
    }
    
    // Navegação simples e direta
    try {
      switch (page) {
        case 'home':
          console.log('Navegando para home...');
          try {
            navigate('/home');
            // Fallback se navigate não funcionar
            setTimeout(() => {
              if (window.location.pathname !== '/home') {
                console.log('Fallback: usando window.location.href');
                window.location.href = '/home';
              }
            }, 100);
          } catch (error) {
            console.error('Erro no navigate, usando window.location.href:', error);
            window.location.href = '/home';
          }
          break;
        case 'historic':
          console.log('Navegando para historic...');
          navigate('/historic');
          break;
        case 'kitchen':
          console.log('Navegando para kitchen...');
          navigate('/kitchen');
          break;
        case 'delivery':
          console.log('Navegando para delivery...');
          navigate('/delivery');
          break;
        case 'config':
          console.log('Navegando para config...');
          navigate('/config');
          break;
        case 'clients':
          console.log('Navegando para clients...');
          navigate('/clients');
          break;
        case 'users':
          console.log('Navegando para users...');
          navigate('/users');
          break;
        case 'payments':
          console.log('Navegando para payments...');
          navigate('/payments');
          break;
        case 'categories':
          console.log('Navegando para categories...');
          navigate('/categories');
          break;
        case 'products':
          console.log('Navegando para products...');
          navigate('/products');
          break;
        default:
          console.log('Navegando para home (default)...');
          navigate('/home');
      }
      console.log('Navegação executada com sucesso');
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };


  // Verificar status do caixa
  const checkCaixaStatus = useCallback(async () => {
    try {
      console.log('checkCaixaStatus iniciado');
      setLoading(true);
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      
      console.log('Fazendo requisição para API...');
      const response = await fetch(`${API_URL}/caixa/status/${estabelecimentoId}`);
      const result = await response.json();
      
      console.log('Resposta da API:', result);
      
      if (result.success) {
        setCaixaStatus(result.data.status);
        setCaixaData(result.data.caixa);
        console.log('Status do caixa atualizado:', result.data.status);
      } else {
        console.error('Erro ao verificar status do caixa:', result.message);
        setCaixaStatus('fechado');
      }
    } catch (error) {
      console.error('Erro ao verificar status do caixa:', error);
      setCaixaStatus('fechado');
    } finally {
      setLoading(false);
      console.log('checkCaixaStatus finalizado');
    }
  }, []);


  const handleAddClick = () => {
    if (caixaStatus === 'aberto') {
      console.log('Abrir modal de fechar caixa');
      setIsCloseCaixaModalOpen(true);
    } else {
      console.log('Abrir novo caixa');
      setIsCaixaModalOpen(true);
    }
  };

  const handleCloseCaixaModal = () => {
    setIsCaixaModalOpen(false);
  };

  const handleCloseCloseCaixaModal = () => {
    setIsCloseCaixaModalOpen(false);
  };

  const handleCloseCaixaSuccess = async (caixaData) => {
    console.log('Caixa fechado com sucesso:', caixaData);
    // Recarregar status do caixa
    await checkCaixaStatus();
    setRefreshKey(prev => prev + 1);
    setIsCloseCaixaModalOpen(false);
  };

  // Função para atualizar dados do caixa em tempo real
  const handleCaixaUpdate = (updatedCaixaData) => {
    console.log('🔄 Atualizando dados do caixa:', updatedCaixaData);
    setCaixaData(updatedCaixaData);
  };

  // Função para atualizar total_vendas do caixa
  const atualizarTotalVendas = async () => {
    if (!caixaData?.id) return;
    
    try {
      const response = await fetch(`${API_URL}/caixa/${caixaData.id}/total-vendas`, {
        method: 'PUT'
      });
      const result = await response.json();
      
      if (result.success) {
        console.log('💰 Total de vendas atualizado:', result.data.total_vendas);
        setCaixaData(prev => ({
          ...prev,
          total_vendas: result.data.total_vendas
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar total_vendas:', error);
    }
  };

  const handleCaixaSuccess = async (caixaData) => {
    console.log('Caixa criado com sucesso:', caixaData);
    // Recarregar status do caixa
    await checkCaixaStatus();
    setRefreshKey(prev => prev + 1);
    setIsCaixaModalOpen(false);
  };

  // useEffect para verificar status do caixa ao carregar a página
  useEffect(() => {
    console.log('useEffect executado - verificando status do caixa');
    checkCaixaStatus();
  }, [checkCaixaStatus]);

  // useEffect para atualizar total_vendas quando o caixa estiver aberto
  useEffect(() => {
    if (caixaStatus === 'aberto' && caixaData?.id) {
      // Atualizar total_vendas imediatamente
      atualizarTotalVendas();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(atualizarTotalVendas, 30000);
      
      return () => clearInterval(interval);
    }
  }, [caixaStatus, caixaData?.id]);

  // useEffect para detectar parâmetro da URL e abrir modal automaticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const openCaixaModal = urlParams.get('openCaixaModal');
    
    if (openCaixaModal === 'true') {
      console.log('Parâmetro openCaixaModal detectado, abrindo modal automaticamente');
      // Aguardar um pouco para garantir que a página carregou
      setTimeout(() => {
        setIsCaixaModalOpen(true);
        // Limpar o parâmetro da URL
        navigate('/historic', { replace: true });
      }, 1000);
    }
  }, [location.search, navigate]);

  const handleCaixaClick = (caixa) => {
    console.log('Detalhes do caixa:', caixa);
    // Aqui você pode implementar a lógica para mostrar detalhes do caixa
  };

  const handlePedidoClick = (pedido) => {
    console.log('Pedido clicado:', pedido);
    // Implementar lógica para mostrar detalhes do pedido
  };

  const handlePagamentoClick = (pagamento) => {
    console.log('Pagamento clicado:', pagamento);
    // Implementar lógica para mostrar detalhes do pagamento
  };

  const handleMovimentacaoClick = (movimentacao) => {
    console.log('Movimentação clicada:', movimentacao);
    // Implementar lógica para mostrar detalhes da movimentação
  };

  // Função para atualizar movimentações em tempo real
  const handleMovimentacaoAdded = () => {
    if (refreshMovimentacoesRef.current) {
      refreshMovimentacoesRef.current(false); // false = sem loading
    }
  };

  // Função para capturar a referência de refresh das movimentações
  const handleMovimentacoesRefreshRef = (refreshFn) => {
    refreshMovimentacoesRef.current = refreshFn;
  };
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Conteúdo da página - Caixa 2 */}
      <div className="flex-1 md:ml-20 min-w-0">
        <div 
          className="flex flex-col overflow-hidden"
          style={{
            height: window.innerWidth <= 768 
              ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
              : window.innerWidth <= 1100 
                ? '90vh' 
                : '100vh',
            paddingBottom: window.innerWidth <= 768 
              ? 'calc(4rem + env(safe-area-inset-bottom, 0px))'
              : '0'
          }}
        >
          {/* Caixa 1 - Header: Ícone, barra de pesquisa e botão caixa */}
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 md:p-6 bg-white flex-shrink-0 min-w-0">
            {/* History Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl flex-shrink-0">
              <History className="text-blue-600" size={24} />
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <SearchBar 
                placeholder="Pesquisar no histórico de pedidos..."
              />
            </div>
            
            {/* Caixa Action Button */}
            <div className="flex-shrink-0">
              <CaixaActionButton 
                isOpen={caixaStatus === 'aberto'} 
                onClick={handleAddClick}
                disabled={loading}
              />
            </div>
          </div>

          {/* Caixa 2 - Conteúdo principal (cards e listagem) */}
          <div className="flex-1 px-3 sm:px-4 md:px-6 pt-0 pb-3 sm:pb-4 md:pb-6 overflow-hidden flex flex-col min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : caixaStatus === 'aberto' ? (
              // Caixa aberto - Header já acima, abaixo temos: caixa de cards, depois caixa de abas+lista
              <>
                {/* Segunda caixa: Cards */}
                <div className="flex-shrink-0 min-w-0">
                  <CaixaCards 
                    caixaData={caixaData} 
                    onCaixaUpdate={handleCaixaUpdate}
                    onMovimentacaoAdded={handleMovimentacaoAdded}
                  />
                </div>

                {/* Terceira caixa: Abas + Listagem */}
                <div className="mt-2 sm:mt-3 flex-1 overflow-hidden min-w-0 flex flex-col">
                  {/* Abas (transparentes, sem borda) */}
                  <div className="px-0 sm:px-0 md:px-0 py-2 bg-transparent flex-shrink-0 min-w-0">
                    <div className="flex space-x-1 overflow-x-auto scrollbar-hide justify-start">
                      <button
                        onClick={() => setActiveTab('pedidos')}
                        className={`px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          activeTab === 'pedidos'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Pedidos
                      </button>
                      <button
                        onClick={() => setActiveTab('pagamentos')}
                        className={`px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          activeTab === 'pagamentos'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Pagamentos
                      </button>
                      <button
                        onClick={() => setActiveTab('movimentacoes')}
                        className={`px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          activeTab === 'movimentacoes'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Movimentações
                      </button>
                    </div>
                  </div>

                  {/* Listagens (com borda, bg e overflow) */}
                  <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-full">
                      {activeTab === 'pedidos' && (
                        <ListPedidosHistorico onPedidoClick={handlePedidoClick} />
                      )}
                      {activeTab === 'pagamentos' && (
                        <ListPagamentosHistorico onPagamentoClick={handlePagamentoClick} />
                      )}
                      {activeTab === 'movimentacoes' && (
                        <ListMovimentacoesCaixa 
                          onMovimentacaoClick={handleMovimentacaoClick}
                          onRefresh={handleMovimentacoesRefreshRef}
                          caixaId={caixaData?.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Caixa fechado ou nenhum caixa - mostrar lista dentro de uma caixa única
              <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-4 min-w-0">
                <div className="flex-1 overflow-auto">
                  <ListCaixas key={refreshKey} onCaixaClick={handleCaixaClick} />
                </div>
              </div>
            )}
          </div>

          {/* Caixa 3 - Footer com espaçamento pequeno */}
          <div className="px-3 sm:px-4 md:px-6 py-1 bg-gray-50 flex-shrink-0">
            {/* Footer content - pode ser vazio ou ter informações */}
          </div>
        </div>
      </div>

      {/* Modal do FormCaixa */}
      <BaseModal 
        isOpen={isCaixaModalOpen} 
        onClose={handleCloseCaixaModal}
        onSave={() => {
          if (formCaixaRef.current) {
            formCaixaRef.current.submit();
          }
        }}
        title="Novo Caixa"
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormCaixa 
          ref={formCaixaRef}
          onSuccess={handleCaixaSuccess}
          onClose={handleCloseCaixaModal}
        />
      </BaseModal>

      {/* Modal do FormCloseCaixa */}
      <BaseModal 
        isOpen={isCloseCaixaModalOpen} 
        onClose={handleCloseCloseCaixaModal}
        onSave={() => {
          if (formCloseCaixaRef.current) {
            formCloseCaixaRef.current.submit();
          }
        }}
        title="Fechar Caixa"
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormCloseCaixa 
          ref={formCloseCaixaRef}
          onSuccess={handleCloseCaixaSuccess}
          onClose={handleCloseCloseCaixaModal}
          caixaData={caixaData}
        />
      </BaseModal>
    </div>
  );
};

export default Historic;
