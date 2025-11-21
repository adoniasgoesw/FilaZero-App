import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ListBase from './ListBase';
import Status from '../buttons/Status';
import Edit from '../buttons/Edit';
import Delete from '../buttons/Delete';
import Notification from '../elements/Notification';
import { Clock, Users, DollarSign, CheckCircle, User, Coffee, ClipboardList, Lock, Unlock, Hand } from 'lucide-react';
import atendimentoService from '../../services/atendimentoService';
import { buscarConfiguracaoPontosAtendimento } from '../../services/api';

const ListPontosAtendimento = ({ 
  estabelecimentoId,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [pontoDisponivelClicado, setPontoDisponivelClicado] = useState(null);
  const atualizarListaRef = useRef();
  const [configuracao, setConfiguracao] = useState(null);


  // Função para atualizar a lista de pontos (apenas da tabela atendimentos)
  const atualizarLista = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    console.log('🔄 Atualizando lista de pontos...');
    console.log('Estabelecimento ID:', estabelecimentoId);
    
    try {
      // Buscar configuração de pontos de atendimento
      const responseConfig = await buscarConfiguracaoPontosAtendimento(estabelecimentoId);
      if (responseConfig.success) {
        setConfiguracao(responseConfig.data);
      }
      
      // Buscar pontos diretamente da tabela atendimentos
      const responseAtendimentos = await atendimentoService.listarPorEstabelecimento(estabelecimentoId);
      
      if (responseAtendimentos.success) {
        // Converter dados da API para o formato do frontend
        const pontosFormatados = responseAtendimentos.data.atendimentos.map(ponto => {
          // Determinar tipo e ajustar identificador para exibição
          let tipo = 'mesa';
          let identificadorExibicao = ponto.identificador;
          
          if (ponto.identificador.includes('MESA')) {
            tipo = 'mesa';
          } else if (ponto.identificador.includes('BALCÃO')) {
            tipo = 'balcao';
          } else {
            tipo = 'comanda';
            // Manter o identificador original (sempre deve ser COMANDA)
            identificadorExibicao = ponto.identificador;
          }
          
          return {
            id: ponto.id,
            identificador: identificadorExibicao,
            tipo: tipo,
            nome_pedido: (ponto.status === 'disponivel' || ponto.status === 'aberto') ? '' : (ponto.nome_ponto || 'Aguardando cliente'),
            valor_total: ponto.valor_total || 0,
            tempo_atividade: ponto.tempo_atividade || '0min',
            status: ponto.status,
            criado_em: ponto.criado_em,
            atualizado_em: ponto.atualizado_em
          };
        });
        
        // Filtrar pontos baseado na configuração
        const pontosFiltrados = pontosFormatados.filter(ponto => {
          if (!responseConfig.success || !responseConfig.data) {
            return true; // Se não houver configuração, mostrar todos
          }
          
          const config = responseConfig.data;
          
          // Verificar se o tipo está habilitado na configuração
          if (ponto.tipo === 'balcao' && !config.atendimento_balcao) {
            return false;
          }
          if (ponto.tipo === 'mesa' && !config.atendimento_mesas) {
            return false;
          }
          if (ponto.tipo === 'comanda' && !config.atendimento_comandas) {
            return false;
          }
          
          return true;
        });
        
        // Deduplicar pontos baseado no identificador único
        const pontosUnicos = pontosFiltrados.reduce((acc, ponto) => {
          const chave = `${ponto.identificador}_${ponto.tipo}`;
          if (!acc[chave]) {
            acc[chave] = ponto;
          } else {
            // Se já existe, manter o mais recente (com base na data de atualização)
            const existente = acc[chave];
            const dataExistente = new Date(existente.atualizado_em || existente.criado_em);
            const dataNovo = new Date(ponto.atualizado_em || ponto.criado_em);
            
            if (dataNovo > dataExistente) {
              acc[chave] = ponto;
            }
          }
          return acc;
        }, {});
        
        const pontosDeduplicados = Object.values(pontosUnicos);
        
        // Ordenar pontos: BALCÕES primeiro, depois MESAS/COMANDA em ordem sequencial
        const pontosOrdenados = pontosDeduplicados.sort((a, b) => {
          // 1. BALCÕES sempre primeiro, independente do status
          if (a.tipo === 'balcao' && b.tipo !== 'balcao') {
            return -1; // BALCÃO vem antes
          }
          if (a.tipo !== 'balcao' && b.tipo === 'balcao') {
            return 1; // BALCÃO vem antes
          }
          
          // 2. Se ambos são BALCÕES, ordenar por número
          if (a.tipo === 'balcao' && b.tipo === 'balcao') {
            const numeroA = parseInt(a.identificador.replace(/\D/g, '')) || 0;
            const numeroB = parseInt(b.identificador.replace(/\D/g, '')) || 0;
            return numeroA - numeroB;
          }
          
          // 3. Para MESAS e COMANDA, ordenar por tipo primeiro
          const tipoOrder = { 'mesa': 0, 'comanda': 1 };
          const tipoDiff = (tipoOrder[a.tipo] || 2) - (tipoOrder[b.tipo] || 2);
          
          if (tipoDiff !== 0) {
            return tipoDiff;
          }
          
          // 4. Se mesmo tipo, ordenar por número em ordem crescente (independente do status)
          const numeroA = parseInt(a.identificador.replace(/\D/g, '')) || 0;
          const numeroB = parseInt(b.identificador.replace(/\D/g, '')) || 0;
          return numeroA - numeroB;
        });
        
        setPontos(pontosOrdenados);
        console.log('✅ Pontos atualizados (da tabela atendimentos):', pontosOrdenados);
        console.log('📊 Total de pontos únicos:', pontosOrdenados.length);
        console.log('🔍 Pontos deduplicados:', pontosDeduplicados.length);
      } else {
        console.warn('API de atendimentos não disponível');
        setPontos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar lista:', error);
      setPontos([]);
    }
  }, [estabelecimentoId]);

  // Armazenar referência da função
  atualizarListaRef.current = atualizarLista;

  // Função para navegar para o ponto de atendimento
  const handlePontoClick = async (ponto) => {
    console.log('Tentando acessar ponto:', ponto);
    
    // Verificar se o ponto está em atendimento
    if (ponto.status === 'em_atendimento') {
      console.log('❌ Ponto em atendimento, acesso bloqueado');
      // Mostrar notificação de aviso
      setNotification({ message: 'Este ponto está sendo atendido por outro usuário. Tente novamente mais tarde.', type: 'warning' });
      return;
    }
    
    // Se o ponto está disponível, mostrar mensagem de "toque para abrir"
    if (ponto.status === 'disponivel') {
      if (pontoDisponivelClicado === ponto.id) {
        // Segundo clique - abrir o ponto e atualizar status
        console.log('✅ Segundo clique - Abrindo ponto e atualizando status:', ponto);
        setPontoDisponivelClicado(null);
        
        // Atualizar status para 'aberto'
        try {
          const response = await atendimentoService.atualizarStatus(ponto.id, 'aberto');
          if (response.success) {
            console.log('✅ Status atualizado para aberto');
            // Atualizar a lista para refletir a mudança
            atualizarLista();
          } else {
            console.error('❌ Erro ao atualizar status:', response.message);
            setNotification({ message: 'Erro ao abrir ponto: ' + response.message, type: 'error' });
          }
        } catch (error) {
          console.error('❌ Erro ao atualizar status:', error);
          setNotification({ message: 'Erro ao abrir ponto', type: 'error' });
        }
        
        // Usar o identificador completo do ponto
        navigate(`/ponto-atendimento/${ponto.identificador}`);
      } else {
        // Primeiro clique - mostrar mensagem
        console.log('👆 Primeiro clique - Mostrando mensagem de toque para abrir');
        setPontoDisponivelClicado(ponto.id);
        
        // Limpar após 3 segundos se não houver segundo clique
        setTimeout(() => {
          setPontoDisponivelClicado(null);
        }, 3000);
      }
      return;
    }
    
    // Para outros status (aberto, ocupado), abrir diretamente
    console.log('✅ Navegando para ponto:', ponto);
    // Usar o identificador completo do ponto
    navigate(`/ponto-atendimento/${ponto.identificador}`);
  };


  useEffect(() => {
    const carregarPontos = async () => {
      if (!estabelecimentoId) return;
      
      setLoading(true);
      try {
        // Buscar configuração de pontos de atendimento
        const responseConfig = await buscarConfiguracaoPontosAtendimento(estabelecimentoId);
        if (responseConfig.success) {
          setConfiguracao(responseConfig.data);
        }
        
        // Buscar pontos diretamente da tabela atendimentos
        const responseAtendimentos = await atendimentoService.listarPorEstabelecimento(estabelecimentoId);
        
        if (responseAtendimentos.success) {
          // Converter dados da API para o formato do frontend
          const pontosFormatados = responseAtendimentos.data.atendimentos.map(ponto => {
            // Determinar tipo e ajustar identificador para exibição
            let tipo = 'mesa';
            let identificadorExibicao = ponto.identificador;
            
            if (ponto.identificador.includes('MESA')) {
              tipo = 'mesa';
            } else if (ponto.identificador.includes('BALCÃO')) {
              tipo = 'balcao';
          } else {
            tipo = 'comanda';
            // Manter o identificador original (sempre deve ser COMANDA)
            identificadorExibicao = ponto.identificador;
          }
            
            return {
              id: ponto.id,
              identificador: identificadorExibicao,
              tipo: tipo,
              nome_pedido: (ponto.status === 'disponivel' || ponto.status === 'aberto') ? '' : (ponto.nome_ponto || 'Aguardando cliente'),
              valor_total: ponto.valor_total || 0,
              tempo_atividade: ponto.tempo_atividade || '0min',
              status: ponto.status,
              criado_em: ponto.criado_em,
              atualizado_em: ponto.atualizado_em
            };
          });
          
          // Filtrar pontos baseado na configuração
          const pontosFiltrados = pontosFormatados.filter(ponto => {
            if (!responseConfig.success || !responseConfig.data) {
              return true; // Se não houver configuração, mostrar todos
            }
            
            const config = responseConfig.data;
            
            // Verificar se o tipo está habilitado na configuração
            if (ponto.tipo === 'balcao' && !config.atendimento_balcao) {
              return false;
            }
            if (ponto.tipo === 'mesa' && !config.atendimento_mesas) {
              return false;
            }
            if (ponto.tipo === 'comanda' && !config.atendimento_comandas) {
              return false;
            }
            
            return true;
          });
          
          // Ordenar pontos: BALCÕES primeiro, depois MESAS/COMANDA em ordem sequencial
          const pontosOrdenados = pontosFiltrados.sort((a, b) => {
            // 1. BALCÕES sempre primeiro, independente do status
            if (a.tipo === 'balcao' && b.tipo !== 'balcao') {
              return -1; // BALCÃO vem antes
            }
            if (a.tipo !== 'balcao' && b.tipo === 'balcao') {
              return 1; // BALCÃO vem antes
            }
            
            // 2. Se ambos são BALCÕES, ordenar por número
            if (a.tipo === 'balcao' && b.tipo === 'balcao') {
              const numeroA = parseInt(a.identificador.replace(/\D/g, '')) || 0;
              const numeroB = parseInt(b.identificador.replace(/\D/g, '')) || 0;
              return numeroA - numeroB;
            }
            
            // 3. Para MESAS e COMANDA, ordenar por tipo primeiro
            const tipoOrder = { 'comanda': 0, 'mesa': 1 };
            const tipoDiff = (tipoOrder[a.tipo] || 2) - (tipoOrder[b.tipo] || 2);
            
            if (tipoDiff !== 0) {
              return tipoDiff;
            }
            
            // 4. Se mesmo tipo, ordenar por número em ordem crescente (independente do status)
            const numeroA = parseInt(a.identificador.replace(/\D/g, '')) || 0;
            const numeroB = parseInt(b.identificador.replace(/\D/g, '')) || 0;
            return numeroA - numeroB;
          });
          
          setPontos(pontosOrdenados);
          console.log('✅ Pontos carregados (da tabela atendimentos):', pontosOrdenados);
        } else {
          console.warn('API de atendimentos não disponível');
          setPontos([]);
        }
      } catch (error) {
        console.error('Erro ao carregar pontos:', error);
        setPontos([]);
      } finally {
        setLoading(false);
      }
    };

    carregarPontos();
  }, [estabelecimentoId]);

  // Expor função de atualização para o componente pai via callback
  useEffect(() => {
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh(atualizarLista);
    }
  }, [onRefresh, atualizarLista]);


  // Atualizar lista automaticamente a cada 30 segundos para manter tempo de atividade atualizado
  useEffect(() => {
    const interval = setInterval(() => {
      atualizarLista();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [atualizarLista]);


  const getStatusInfo = (status) => {
    switch (status) {
      case 'disponivel':
        return { 
          text: 'Disponível', 
          color: 'bg-slate-100 text-slate-700',
          icon: <CheckCircle className="w-3 h-3" />,
          cardBorder: 'border-slate-200',
          cardBg: 'bg-white',
          cardShadow: 'shadow-sm'
        };
      case 'aberto':
        return { 
          text: 'Aberto', 
          color: 'bg-blue-100 text-blue-800',
          icon: <Unlock className="w-3 h-3" />,
          cardBorder: 'border-blue-400',
          cardBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
          cardShadow: 'shadow-lg shadow-blue-200/60'
        };
      case 'ocupado':
      case 'ocupada':
        return { 
          text: 'Ocupada', 
          color: 'bg-emerald-100 text-emerald-800',
          icon: <Users className="w-3 h-3" />,
          cardBorder: 'border-emerald-400',
          cardBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
          cardShadow: 'shadow-lg shadow-emerald-200/60'
        };
      case 'em_atendimento':
        return { 
          text: 'Em Atendimento', 
          color: 'bg-violet-100 text-violet-800',
          icon: <Lock className="w-3 h-3" />,
          cardBorder: 'border-violet-400',
          cardBg: 'bg-gradient-to-br from-violet-100 to-violet-50',
          cardShadow: 'shadow-lg shadow-violet-200/60'
        };
      default:
        return { 
          text: 'Desconhecido', 
          color: 'bg-gray-50 text-gray-700',
          icon: <CheckCircle className="w-3 h-3" />,
          cardBorder: 'border-gray-200',
          cardBg: 'bg-white',
          cardShadow: 'shadow-sm'
        };
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'mesa':
        return <Coffee className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />;
      case 'comanda':
        return <ClipboardList className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />;
      case 'balcao':
        return <Users className="w-3 h-3 md:w-4 md:h-4 text-violet-600" />;
      default:
        return <Coffee className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />;
    }
  };


  if (pontos.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📍</div>
          <p className="text-gray-600 font-medium">Nenhum ponto de atendimento configurado</p>
          <p className="text-gray-500 text-sm">Configure balcões, mesas e comandas nas configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid de Cards de Pontos de Atendimento */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
         {pontos.map((ponto) => {
           const statusInfo = getStatusInfo(ponto.status);
           return (
             <div 
               key={ponto.id} 
               onClick={() => handlePontoClick(ponto)}
               className={`${statusInfo.cardBg} border ${statusInfo.cardBorder} rounded-lg md:rounded-xl ${statusInfo.cardShadow} p-3 md:p-5 transition-all duration-300 min-h-[100px] md:min-h-[160px] flex flex-col backdrop-blur-sm ${
                 ponto.status === 'em_atendimento' 
                   ? 'cursor-not-allowed opacity-75' 
                   : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1'
               }`}
             >
             {/* Header do Card */}
             <div className="flex items-center justify-between mb-1 md:mb-3">
               <div className="flex items-center space-x-1 md:space-x-2 min-w-0 flex-1">
                 <div className="flex-shrink-0">
                   {getTipoIcon(ponto.tipo)}
                 </div>
                 <div className="min-w-0 flex-1">
                   <h3 className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                     {ponto.identificador}
                   </h3>
                 </div>
               </div>
               <div className="flex-shrink-0 ml-1">
                 <span className={`inline-flex items-center justify-center w-6 h-6 md:w-auto md:h-auto md:space-x-1 px-1 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-medium ${statusInfo.color} backdrop-blur-sm`}>
                   {statusInfo.icon}
                   <span className="hidden md:inline">{statusInfo.text}</span>
                 </span>
               </div>
             </div>

             {/* Conteúdo do Card - Ocupa o espaço restante */}
             <div className="flex flex-col justify-between flex-1">
               {ponto.status === 'disponivel' && pontoDisponivelClicado === ponto.id ? (
                 // Mostrar mensagem "Toque para abrir" quando clicado
                 <div className="flex flex-col items-center justify-center flex-1 space-y-1 md:space-y-2">
                   <Hand className="w-5 h-5 md:w-8 md:h-8 text-gray-400" />
                   <p className="text-xs md:text-sm font-medium text-gray-500 text-center">
                     Toque para abrir
                   </p>
                 </div>
               ) : (
                 // Conteúdo normal do card
                 <div className="flex flex-col space-y-1 md:space-y-3">
                   <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                     <User className="w-3 h-3 md:w-3 md:h-3 text-gray-500 flex-shrink-0" />
                     <p className="text-xs md:text-sm font-medium text-gray-500 italic truncate min-w-0">{ponto.nome_pedido || 'Aguardando'}</p>
                   </div>
                   <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                     <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-green-600 flex-shrink-0" />
                     <span className="font-medium truncate">R$ {ponto.valor_total.toFixed(2).replace('.', ',')}</span>
                   </div>
                   <div className="flex items-center space-x-1 md:space-x-2 text-xs text-gray-500">
                     <Clock className="w-3 h-3 md:w-3 md:h-3 flex-shrink-0" />
                     <span className="truncate">{ponto.tempo_atividade}</span>
                   </div>
                 </div>
               )}
             </div>
           </div>
           );
         })}
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

export default ListPontosAtendimento;
