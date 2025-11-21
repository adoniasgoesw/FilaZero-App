import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import DetailsPanel from '../../components/panels/DetailsPanel';
import ItemsPanel from '../../components/panels/ItemsPanel';
import PaymentsPanel from '../../components/panels/PaymentsPanel';
import Notification from '../../components/elements/Notification';
import atendimentoService from '../../services/atendimentoService';
import pedidoService from '../../services/pedidoService';
import { getUserData } from '../../services/auth';
import { salvarItensEAtualizarPedido, buscarItensPedido } from '../../services/api';
import pedidosPagamentosService from '../../services/pedidosPagamentosService';

const PontoAtendimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pontoAtendimento, setPontoAtendimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showPaymentsPanel, setShowPaymentsPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [pagamentosData, setPagamentosData] = useState({ pago: 0, restante: 0 });
  const [pedidoAtual, setPedidoAtual] = useState(null);
  
  // Função para atualizar pedido atual com logs
  const handlePedidoAtualizado = (novoPedido) => {
    console.log('📝 PedidoAtualizado chamado com:', novoPedido);
    setPedidoAtual(novoPedido);
  };
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [pedidoExcluido, setPedidoExcluido] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(false);
  const hasInitialized = useRef(false);

  // Reset do hasInitialized quando o ID mudar
  useEffect(() => {
    hasInitialized.current = false;
  }, [id]);

  // Recalcular restante sempre que pedidos mudarem
  useEffect(() => {
    // Calcular total baseado nos itens do frontend
    const total = pedidos.reduce((sum, pedido) => {
      const preco = parseFloat(pedido.preco) || 0;
      const quantidade = parseFloat(pedido.quantidade) || 0;
      return sum + (preco * quantidade);
    }, 0);
    
    const pago = pagamentosData.pago;
    const restante = Math.max(0, total - pago);
    
    setPagamentosData(prev => ({
      ...prev,
      restante: restante
    }));
    
    console.log('💰 Valores recalculados:', { total, pago, restante });
  }, [pedidos, pagamentosData.pago]);

  // Atualizar pedidoAtual quando o total mudar (usando useCallback para evitar loop)
  const atualizarPedidoAtual = useCallback(() => {
    if (pedidoAtual && pedidos.length > 0) {
      const total = pedidos.reduce((sum, pedido) => {
        const preco = parseFloat(pedido.preco) || 0;
        const quantidade = parseFloat(pedido.quantidade) || 0;
        return sum + (preco * quantidade);
      }, 0);
      
      const pago = pagamentosData.pago;
      const restante = Math.max(0, total - pago);
      
      // Só atualizar se o total mudou significativamente
      const totalAtual = pedidoAtual.valor_total || 0;
      if (Math.abs(total - totalAtual) > 0.01) {
        setPedidoAtual(prev => ({
          ...prev,
          valor_total: total,
          valor_restante: restante
        }));
        
        console.log('🔄 PedidoAtual atualizado:', { total, pago, restante });
      }
    }
  }, [pedidoAtual, pedidos, pagamentosData.pago]);

  useEffect(() => {
    atualizarPedidoAtual();
  }, [atualizarPedidoAtual]);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Função para carregar itens salvos do pedido
  const carregarItensPedido = useCallback(async (pedidoId) => {
    try {
      console.log('📦 Carregando itens do pedido:', pedidoId);
      
      const response = await buscarItensPedido(pedidoId);
      
      if (response.success && response.data.itens.length > 0) {
        console.log('✅ Itens carregados:', response.data.itens.length);
        
        // Converter itens do banco para o formato do frontend
        const itensFormatados = response.data.itens.map(item => ({
          id: item.produto_id, // Usar produto_id como ID para agrupamento
          item: item.produto_nome || 'Produto',
          quantidade: item.quantidade,
          quantidadeSalva: item.quantidade, // Rastrear quantidade salva
          preco: parseFloat(item.valor_unitario),
          total: parseFloat(item.valor_total),
          observacoes: item.descricao || '',
          salvo: true // Marca como salvo no banco
        }));
        
        setPedidos(itensFormatados);
        console.log('🛒 Itens adicionados ao carrinho:', itensFormatados);
      } else {
        console.log('ℹ️ Nenhum item encontrado para este pedido');
        setPedidos([]); // Limpar itens se não houver nenhum
      }
    } catch (error) {
      console.error('❌ Erro ao carregar itens do pedido:', error);
    }
  }, []);

  // Função para criar ou buscar pedido automaticamente
  const criarOuBuscarPedido = useCallback(async (atendimentoId) => {
    try {
      console.log('🛒 Criando/buscando pedido para atendimento:', atendimentoId);
      
      // Pegar ID do usuário usando o sistema de autenticação correto
      const userData = getUserData();
      let usuarioId = null;
      
      if (userData.isLoggedIn && userData.userId) {
        usuarioId = userData.userId;
        console.log('👤 Usuário logado (ID correto):', usuarioId);
      } else {
        console.warn('⚠️ Usuário não está logado ou ID não encontrado');
      }
      
      const response = await pedidoService.criarOuBuscarPedido(atendimentoId, usuarioId);
      
      if (response.success) {
        console.log('✅ Pedido carregado:', response.data.pedido);
        setPedidoAtual(response.data.pedido);
        
        // Carregar itens salvos do pedido
        await carregarItensPedido(response.data.pedido.id);
      } else {
        console.error('❌ Erro ao criar/buscar pedido:', response.message);
      }
    } catch (error) {
      console.error('❌ Erro ao criar/buscar pedido:', error);
    }
  }, [carregarItensPedido]);

  // Carregar dados do ponto de atendimento
  useEffect(() => {
    // Evitar execução dupla no React Strict Mode
    if (hasInitialized.current) {
      console.log('🔄 PontoAtendimento já inicializado, pulando...');
      return;
    }
    
    hasInitialized.current = true;
    let isMounted = true; // Flag para evitar race conditions
    
    const carregarPontoAtendimento = async () => {
      setLoading(true);
      try {
        const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
        // O id já vem completo da URL (ex: "MESA 1", "COMANDA 1", "BALCÃO 1")
        // Não adicionar prefixo, usar diretamente
        const identificador = id;
        
        console.log('🔄 Carregando ponto de atendimento:', identificador);
        
        // Criar ou buscar ponto de atendimento
        const response = await atendimentoService.criarOuBuscarPonto(
          estabelecimentoId,
          identificador
        );
        
        // Verificar se o componente ainda está montado
        if (!isMounted) return;
        
        if (response.success) {
          const ponto = response.data.atendimento;
          // Determinar tipo baseado no identificador
          let tipo = 'mesa';
          if (ponto.identificador.includes('BALCÃO')) {
            tipo = 'balcao';
          } else if (ponto.identificador.includes('COMANDA')) {
            tipo = 'comanda';
          }
          
          setPontoAtendimento({
            id: ponto.id,
            identificador: ponto.identificador, // Usar o identificador correto do banco
            tipo: tipo,
            status: ponto.status,
            nome_ponto: ponto.nome_ponto,
            criado_em: ponto.criado_em,
            atualizado_em: ponto.atualizado_em,
            tempo_atividade: ponto.tempo_atividade
          });
          
          // Se o status for 'em_atendimento', atualizar a listagem de pontos
          if (ponto.status === 'em_atendimento') {
            console.log('✅ Ponto em atendimento! Atualizando listagem...');
            // Notificar o componente pai para atualizar a listagem
            if (window.atualizarListaPontos) {
              window.atualizarListaPontos();
            }
          }

          // Criar ou buscar pedido automaticamente
          await criarOuBuscarPedido(ponto.id);
        } else {
          console.error('Erro ao carregar ponto de atendimento:', response.message);
          
          // Se for erro 409 (conflito), tentar buscar o ponto existente
          if (response.message && response.message.includes('Já existe um ponto')) {
            console.log('🔄 Tentando buscar ponto existente...');
            const buscarResponse = await atendimentoService.buscarPorIdentificador(identificador, estabelecimentoId);
            
            if (buscarResponse.success && isMounted) {
              const ponto = buscarResponse.data.atendimento;
              // Determinar tipo baseado no identificador
              let tipo = 'mesa';
              if (ponto.identificador.includes('BALCÃO')) {
                tipo = 'balcao';
              } else if (ponto.identificador.includes('COMANDA')) {
                tipo = 'comanda';
              }
              
              setPontoAtendimento({
                id: ponto.id,
                identificador: ponto.identificador,
                tipo: tipo,
                status: ponto.status,
                nome_ponto: ponto.nome_ponto,
                criado_em: ponto.criado_em,
                atualizado_em: ponto.atualizado_em,
                tempo_atividade: ponto.tempo_atividade
              });
              
              // Atualizar status para em_atendimento apenas se não estiver disponível
              if (ponto.status !== 'disponivel') {
                await atendimentoService.atualizarStatus(ponto.id, 'em_atendimento');
              }
              
              // Criar ou buscar pedido automaticamente
              await criarOuBuscarPedido(ponto.id);
            } else if (isMounted) {
              // Fallback para mock em caso de erro
              // Determinar tipo baseado no identificador
              let tipo = 'mesa';
              if (id.includes('BALCÃO')) {
                tipo = 'balcao';
              } else if (id.includes('COMANDA')) {
                tipo = 'comanda';
              }
              
              const mockPonto = {
                id: id,
                identificador: id, // Usar id diretamente, já vem completo
                tipo: tipo,
                status: 'disponivel'
              };
              setPontoAtendimento(mockPonto);
            }
          } else if (isMounted) {
            // Fallback para mock em caso de erro
            // Determinar tipo baseado no identificador
            let tipo = 'mesa';
            if (id.includes('BALCÃO')) {
              tipo = 'balcao';
            } else if (id.includes('COMANDA')) {
              tipo = 'comanda';
            }
            
            const mockPonto = {
              id: id,
              identificador: id, // Usar id diretamente, já vem completo
              tipo: tipo,
              status: 'disponivel'
            };
            setPontoAtendimento(mockPonto);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar ponto de atendimento:', error);
        if (isMounted) {
          // Fallback para mock em caso de erro
          // Determinar tipo baseado no identificador
          let tipo = 'mesa';
          if (id.includes('BALCÃO')) {
            tipo = 'balcao';
          } else if (id.includes('COMANDA')) {
            tipo = 'comanda';
          }
          
          const mockPonto = {
            id: id,
            identificador: id, // Usar id diretamente, já vem completo
            tipo: tipo,
            status: 'disponivel'
          };
          setPontoAtendimento(mockPonto);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarPontoAtendimento();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id, criarOuBuscarPedido]);

  // Função para restaurar status anterior quando sair da página
  const restaurarStatusAnterior = useCallback(async () => {
    console.log('🔄 Verificando se deve restaurar status:', {
      pontoId: pontoAtendimento?.id,
      pedidoExcluido: pedidoExcluido,
      pedidoFinalizado: pedidoFinalizado,
      pedidosCount: pedidos.length
    });
    
    if (!pontoAtendimento?.id || pedidoExcluido || pedidoFinalizado) {
      console.log('⏭️ Pulando restauração de status - pedido foi excluído/finalizado ou ponto não existe');
      return;
    }
    
    try {
      // Se o pedido foi finalizado ou excluído, restaurar para 'disponivel'
      // Se não foi finalizado nem excluído, verificar se há itens:
      // - Se há itens: 'ocupado'
      // - Se não há itens: 'aberto'
      let statusParaRestaurar = 'disponivel';
      
      if (!pedidoFinalizado && !pedidoExcluido) {
        // Verificar se há itens no pedido
        const temItens = pedidos && pedidos.length > 0;
        statusParaRestaurar = temItens ? 'ocupado' : 'aberto';
      }
      
      await atendimentoService.atualizarStatus(pontoAtendimento.id, statusParaRestaurar);
      console.log(`✅ Status restaurado para ${statusParaRestaurar}`);
      
      // Atualizar listagem
      if (window.atualizarListaPontos) {
        window.atualizarListaPontos();
      }
    } catch (error) {
      console.error('Erro ao restaurar status:', error);
    }
  }, [pontoAtendimento?.id, pedidoExcluido, pedidoFinalizado, pedidos]);


  // Restaurar status quando o componente for desmontado (usuário sair)
  useEffect(() => {
    return () => {
      restaurarStatusAnterior();
    };
  }, [restaurarStatusAnterior]);

  const handleBack = async () => {
    // Restaurar status antes de sair (apenas se o pedido não foi excluído)
    if (!pedidoExcluido) {
      await restaurarStatusAnterior();
    }
    
    if (isMobile && showDetailsPanel) {
      // Em mobile, se estiver no painel detalhes, volta para o painel itens
      setShowDetailsPanel(false);
    } else {
      // Em desktop ou se estiver no painel itens, volta para home
      navigate('/home');
    }
  };

  const handleInfoClick = () => {
    // Em mobile, alterna para o painel detalhes
    if (isMobile) {
      setShowDetailsPanel(true);
    }
  };

  const handleAddPayment = async () => {
    // Verificar se há itens não salvos para salvar antes de abrir o painel de pagamentos
    const itensNaoSalvos = pedidos.filter(pedido => !pedido.salvo);
    
    if (itensNaoSalvos.length > 0) {
      console.log('💾 Salvando itens antes de abrir painel de pagamentos:', itensNaoSalvos);
      
      try {
        // Converter itens para o formato esperado pela API
        const itensParaSalvar = pedidos.map(pedido => ({
          produto_id: pedido.id, // ID do produto
          quantidade: pedido.quantidade || 1,
          valor_unitario: parseFloat(pedido.preco || 0),
          descricao: null
        }));

        const response = await salvarItensEAtualizarPedido(pedidoAtual.id, itensParaSalvar);
        
        if (response.success) {
          console.log('✅ Itens salvos com sucesso antes de abrir pagamentos');
          
          // Marcar todos os itens como salvos
          setPedidos(prevPedidos => 
            prevPedidos.map(item => ({
              ...item,
              salvo: true
            }))
          );
          
          // Atualizar a listagem de pontos para refletir o status "ocupada"
          if (window.atualizarListaPontos) {
            console.log('🔄 Atualizando lista de pontos após salvar itens...');
            setTimeout(() => {
              window.atualizarListaPontos();
            }, 1000);
          }
        } else {
          console.error('❌ Erro ao salvar itens:', response.message);
          setNotification({ message: 'Erro ao salvar itens: ' + response.message, type: 'error' });
          return; // Não abrir painel de pagamentos se houve erro
        }
      } catch (error) {
        console.error('❌ Erro ao salvar itens:', error);
        setNotification({ message: 'Erro ao salvar itens. Tente novamente.', type: 'error' });
        return; // Não abrir painel de pagamentos se houve erro
      }
    }
    
    // Abrir painel de pagamentos
    setShowPaymentsPanel(true);
  };

  const handlePedidoExcluido = () => {
    console.log('🚫 Pedido excluído - marcando flag para não restaurar status');
    setPedidoExcluido(true);
  };

  const handlePedidoFinalizado = () => {
    console.log('✅ Pedido finalizado - marcando flag para não restaurar status');
    setPedidoFinalizado(true);
  };

  const handleBackFromPayments = () => {
    setShowPaymentsPanel(false);
  };

  // Função para calcular total do pedido
  const calcularTotalPedido = useCallback(() => {
    return pedidos.reduce((total, pedido) => {
      const preco = parseFloat(pedido.preco) || 0;
      const quantidade = parseFloat(pedido.quantidade) || 0;
      return total + (preco * quantidade);
    }, 0);
  }, [pedidos]);

  const handleFinalizarPagamento = (dadosPagamento) => {
    console.log('💰 Dados de pagamento recebidos:', dadosPagamento);
    
    // Atualizar dados de pagamento
    setPagamentosData({
      pago: dadosPagamento.pago,
      restante: dadosPagamento.restante
    });
    
    // Atualizar pedidoAtual com os novos valores de pagamento
    if (pedidoAtual) {
      setPedidoAtual(prev => ({
        ...prev,
        valor_pago: dadosPagamento.pago,
        valor_restante: dadosPagamento.restante,
        valor_troco: dadosPagamento.troco || 0,
        situacao: dadosPagamento.situacao || prev.situacao
      }));
    }
    
    // Mostrar notificação de sucesso
    if (dadosPagamento.situacao === 'pago') {
      setNotification({ 
        message: 'Pagamento finalizado com sucesso! Pedido pago.', 
        type: 'success' 
      });
    } else {
      setNotification({ 
        message: 'Pagamento parcial realizado!', 
        type: 'success' 
      });
    }
    
    setShowPaymentsPanel(false);
  };

  // Função para carregar dados do pedido do banco
  const carregarDadosPedidoCompleto = useCallback(async () => {
    if (!pedidoAtual?.id) return;

    try {
      console.log('📦 Carregando dados completos do pedido:', pedidoAtual.id);
      
      // Carregar pagamentos salvos
      const responsePagamentos = await pedidosPagamentosService.getPagamentosByPedido(pedidoAtual.id);
      
      if (responsePagamentos.success) {
        console.log('✅ Pagamentos carregados:', responsePagamentos.data.pagamentos);
        
        // Calcular totais dos pagamentos salvos
        const totalPago = responsePagamentos.data.pagamentos.reduce((total, pag) => 
          total + (parseFloat(pag.valor_pago) || 0), 0
        );
        
        // Calcular total do pedido
        const totalPedido = calcularTotalPedido();
        
        // Atualizar dados de pagamento
        setPagamentosData({
          pago: totalPago,
          restante: Math.max(0, totalPedido - totalPago)
        });
        
        // Atualizar pedidoAtual com dados do banco
        setPedidoAtual(prev => ({
          ...prev,
          valor_pago: totalPago,
          valor_restante: Math.max(0, totalPedido - totalPago),
          valor_troco: Math.max(0, totalPago - totalPedido)
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do pedido:', error);
    }
  }, [pedidoAtual?.id, calcularTotalPedido]);

  // Carregar dados do pedido quando o pedidoAtual mudar
  useEffect(() => {
    if (pedidoAtual?.id) {
      carregarDadosPedidoCompleto();
    }
  }, [pedidoAtual?.id, carregarDadosPedidoCompleto]);

  const handleItemsPanelBack = async () => {
    // Restaurar status antes de sair
    await restaurarStatusAnterior();
    // Botão voltar do painel itens sempre volta para home
    navigate('/home');
  };

  const handleAddToPedido = (itemPedido) => {
    setPedidos(prevPedidos => {
      // Buscar item existente pelo ID do produto (salvo ou temporário)
      const index = prevPedidos.findIndex(p => p.id === itemPedido.id);
      
      if (index !== -1) {
        // Item já existe - incrementar quantidade
        const updated = [...prevPedidos];
        const existing = updated[index];
        const novaQuantidade = (existing.quantidade || 0) + 1;
        const preco = existing.preco || itemPedido.preco || 0;
        
        updated[index] = {
          ...existing,
          quantidade: novaQuantidade,
          quantidadeSalva: existing.quantidadeSalva || 0, // Preservar quantidade salva
          total: novaQuantidade * preco,
          salvo: false // Marca como temporário ao modificar
        };
        
        console.log('➕ Item adicionado (existente):', updated[index]);
        return updated;
      } else {
        // Item não existe - adicionar novo com quantidade 1
        const preco = itemPedido.preco || 0;
        const novoItem = {
          ...itemPedido,
          quantidade: 1,
          total: preco,
          salvo: false // Marca como temporário
        };
        
        console.log('➕ Item adicionado (novo):', novoItem);
        return [...prevPedidos, novoItem];
      }
    });
  };

  const handleCancelItems = () => {
    // Remove apenas itens temporários (não salvos)
    setPedidos(prevPedidos => 
      prevPedidos.filter(item => item.salvo === true)
    );
    
    // Voltar para a página home
    navigate('/home');
  };

  const handleDeleteItem = (itemId) => {
    setPedidos(prevPedidos => {
      const index = prevPedidos.findIndex(p => p.id === itemId);
      if (index === -1) return prevPedidos;
      
      const updated = [...prevPedidos];
      const item = updated[index];
      const novaQuantidade = (item.quantidade || 0) - 1;
      const preco = item.preco || 0;
      
      if (novaQuantidade > 0) {
        // Ainda há quantidade - decrementar
        updated[index] = {
          ...item,
          quantidade: novaQuantidade,
          quantidadeSalva: item.quantidadeSalva || 0, // Preservar quantidade salva
          total: novaQuantidade * preco,
          salvo: false // Marca como temporário ao modificar
        };
        
        console.log('➖ Item removido (decrementado):', updated[index]);
        return updated;
      } else {
        // Quantidade chegou a zero - remover item
        console.log('➖ Item removido (completamente):', item);
        return updated.filter(p => p.id !== itemId);
      }
    });
  };

  const handleSaveItems = async () => {
    if (!pedidoAtual || pedidos.length === 0) {
      console.warn('⚠️ Nenhum pedido ou itens para salvar');
      return;
    }

    try {
      console.log('💾 Salvando itens do pedido:', pedidos);
      
      // Converter itens para o formato esperado pela API
      const itensParaSalvar = pedidos.map(pedido => ({
        produto_id: pedido.id, // ID do produto
        quantidade: pedido.quantidade || 1,
        valor_unitario: parseFloat(pedido.preco || 0),
        descricao: null
      }));

      const response = await salvarItensEAtualizarPedido(pedidoAtual.id, itensParaSalvar);
      
      if (response.success) {
        console.log('✅ Itens salvos com sucesso:', response.data);
        
        // Marcar todos os itens como salvos e zerar contadores
        setPedidos(prevPedidos => 
          prevPedidos.map(item => ({
            ...item,
            salvo: true
          }))
        );
        
        // Atualizar a listagem de pontos para refletir o status "ocupada"
        if (window.atualizarListaPontos) {
          console.log('🔄 Atualizando lista de pontos após salvar itens...');
          // Aguardar um pouco para garantir que o banco foi atualizado
          setTimeout(() => {
            console.log('🔄 Executando atualização da lista...');
            window.atualizarListaPontos();
          }, 2000); // Aumentar tempo para 2 segundos
        } else {
          console.warn('⚠️ Função window.atualizarListaPontos não encontrada');
        }
        
        // Tentar usar função de atualização forçada também
        if (window.forcarAtualizacaoLista) {
          setTimeout(() => {
            console.log('🔄 Executando atualização forçada...');
            window.forcarAtualizacaoLista();
          }, 3000);
        }
        
        // Mostrar mensagem de sucesso e voltar para home
        setNotification({ message: 'Pedido salvo com sucesso', type: 'success' });
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        console.error('❌ Erro ao salvar itens:', response.message);
        setNotification({ message: 'Erro ao salvar itens: ' + response.message, type: 'error' });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar itens:', error);
      setNotification({ message: 'Erro ao salvar itens. Tente novamente.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentPage="config" 
          isManagementPage={true}
          onNavigate={(page) => {
            if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
              navigate(`/${page}`);
            } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
              navigate(`/${page}`);
            } else {
              navigate('/home');
            }
          }} 
        />
        
        <div className="flex-1 md:ml-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Esquerda */}
      <Sidebar 
        currentPage="home" 
        isManagementPage={true}
        onNavigate={(page) => {
          if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
            navigate(`/${page}`);
          } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
            navigate(`/${page}`);
          } else {
            navigate('/home');
          }
        }} 
      />
      
      {/* Conteúdo Principal - Direita */}
      <div className="flex-1 md:ml-20 p-2 sm:p-3 z-100 overflow-hidden h-screen">
        <div className="h-full flex flex-col md:flex-row gap-2 sm:gap-3 overflow-hidden max-h-full">
          {/* Painel Detalhes/Pagamentos - Responsivo */}
          <div className={`w-full md:w-[40%] lg:w-[30%] h-full ${isMobile && !showDetailsPanel ? 'hidden' : ''}`}>
            {showPaymentsPanel ? (
              <PaymentsPanel 
                onBack={handleBackFromPayments}
                onFinalizarPagamento={handleFinalizarPagamento}
                estabelecimentoId={7}
                pedidos={pedidos}
                pedidoId={pedidoAtual?.id}
                caixaId={pedidoAtual?.caixa_id || 1}
                pedidoAtual={pedidoAtual}
              />
            ) : (
              <DetailsPanel 
                pontoAtendimento={pontoAtendimento}
                onBack={handleBack}
                pedidos={pedidos}
                onDeleteItem={handleDeleteItem}
                onAddPayment={handleAddPayment}
                pagamentosData={pagamentosData}
                pedidoAtual={pedidoAtual}
                onPedidoExcluido={handlePedidoExcluido}
                onPedidoAtualizado={handlePedidoAtualizado}
                onPedidoFinalizado={handlePedidoFinalizado}
                onSaveItems={handleSaveItems}
              />
            )}
          </div>

          {/* Painel Itens - Responsivo */}
          <div className={`w-full md:w-[60%] lg:w-[70%] h-full ${isMobile && showDetailsPanel ? 'hidden' : ''} ${showPaymentsPanel ? 'opacity-50 pointer-events-none' : ''}`}>
            <ItemsPanel 
              pontoAtendimento={pontoAtendimento}
              onInfoClick={handleInfoClick}
              isMobile={isMobile}
              onBack={handleItemsPanelBack}
              estabelecimentoId={7}
              onAddToPedido={handleAddToPedido}
              pedidos={pedidos}
              onSaveItems={handleSaveItems}
              onCancelItems={handleCancelItems}
              isBalcao={pontoAtendimento?.identificador?.includes('BALCÃO')}
            />
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default PontoAtendimento;