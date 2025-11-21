import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import Notification from '../components/elements/Notification';
import ListPedidos from '../components/lists/ListPedidos';
import cozinhaService from '../services/cozinhaService';
import { Clock, CheckCircle, ChefHat, AlertCircle } from 'lucide-react';

const Kitchen = () => {
  const navigate = useNavigate();
  const currentPage = 'kitchen';
  const [pedidos, setPedidos] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  // Dados fictícios para teste
  const [pedidosFicticios] = useState([
    {
      id: 1,
      codigo: '001',
      mesa: 'MESA 5',
      nome_ponto: 'Mesa VIP',
      status: 'pendente',
      total_itens: 4,
      itens_pendentes: 4,
      itens_em_preparo: 0,
      itens_finalizados: 0
    },
    {
      id: 2,
      codigo: '002',
      mesa: 'MESA 12',
      nome_ponto: 'Mesa Família',
      status: 'pendente',
      total_itens: 6,
      itens_pendentes: 6,
      itens_em_preparo: 0,
      itens_finalizados: 0
    },
    {
      id: 3,
      codigo: '003',
      mesa: 'BALCÃO 3',
      nome_ponto: 'Balcão',
      status: 'aguardando',
      total_itens: 3,
      itens_pendentes: 3,
      itens_em_preparo: 0,
      itens_finalizados: 0
    },
    {
      id: 4,
      codigo: '004',
      mesa: 'MESA 8',
      nome_ponto: 'Mesa Casal',
      status: 'em_preparo',
      total_itens: 5,
      itens_pendentes: 1,
      itens_em_preparo: 3,
      itens_finalizados: 1
    },
    {
      id: 5,
      codigo: '005',
      mesa: 'MESA 15',
      nome_ponto: 'Mesa Grande',
      status: 'em_preparo',
      total_itens: 8,
      itens_pendentes: 0,
      itens_em_preparo: 5,
      itens_finalizados: 3
    }
  ]);

  const handleNavigate = (page) => {
    if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
      navigate(`/${page}`);
    } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
      navigate(`/${page}`);
    } else {
      navigate('/home');
    }
  };

  const buscarPedidos = async () => {
    try {
      const response = await cozinhaService.buscarPedidosCozinha();
      if (response.success) {
        // Usar dados fictícios se não houver pedidos reais
        const pedidosReais = response.data.pedidos || [];
        setPedidos(pedidosReais.length > 0 ? pedidosReais : pedidosFicticios);
      } else {
        // Em caso de erro, usar dados fictícios para teste
        setPedidos(pedidosFicticios);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      // Em caso de erro, usar dados fictícios para teste
      setPedidos(pedidosFicticios);
    }
  };

  useEffect(() => {
    buscarPedidos();
    // Atualizar a cada 5 segundos
    const interval = setInterval(buscarPedidos, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'aguardando':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'em_preparo':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'finalizado':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aguardando':
        return 'Aguardando';
      case 'em_preparo':
        return 'Em Preparo';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="w-5 h-5" />;
      case 'aguardando':
        return <Clock className="w-5 h-5" />;
      case 'em_preparo':
        return <ChefHat className="w-5 h-5" />;
      case 'finalizado':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handlePedidoClick = (pedidoId) => {
    navigate(`/kitchen/pedido/${pedidoId}`);
  };

  const handleAceitarPedido = async (pedidoId, e) => {
    e.stopPropagation();
    try {
      const response = await cozinhaService.aceitarPedido(pedidoId);
      if (response.success) {
        setNotification({ message: 'Pedido aceito com sucesso!', type: 'success' });
        // Atualizar status localmente para dados fictícios
        setPedidos(prevPedidos => 
          prevPedidos.map(pedido => 
            pedido.id === pedidoId 
              ? { ...pedido, status: 'aguardando' }
              : pedido
          )
        );
        buscarPedidos();
      } else {
        setNotification({ message: response.message || 'Erro ao aceitar pedido', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      // Atualizar status localmente mesmo em caso de erro (para teste)
      setPedidos(prevPedidos => 
        prevPedidos.map(pedido => 
          pedido.id === pedidoId 
            ? { ...pedido, status: 'aguardando' }
            : pedido
        )
      );
      setNotification({ message: 'Pedido aceito (modo teste)', type: 'success' });
    }
  };

  // Separar pedidos por status
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosEmAndamento = pedidos.filter(p => p.status === 'aguardando' || p.status === 'em_preparo');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div 
        className="md:ml-20 pb-16 md:pb-0 overflow-hidden"
        style={{
          height: window.innerWidth <= 768 
            ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
            : '100vh',
          paddingBottom: window.innerWidth <= 768 
            ? 'calc(4rem + env(safe-area-inset-bottom, 0px))'
            : '0'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cozinha</h1>
          </div>

          {/* Conteúdo Principal - Dois Painéis */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 sm:p-6 overflow-hidden">
              {/* Painel 1: Pedidos Pendentes */}
              <div className="w-full md:w-1/2 lg:w-2/5 h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header do Painel */}
                <div className="flex-shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-lg font-bold text-gray-800">Pedidos Pendentes</h2>
                    <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {pedidosPendentes.length}
                    </span>
                  </div>
                </div>

                {/* Lista de Pedidos Pendentes */}
                <ListPedidos
                  pedidos={pedidosPendentes}
                  onPedidoClick={handlePedidoClick}
                  onAceitarPedido={handleAceitarPedido}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getStatusIcon={getStatusIcon}
                />
              </div>

              {/* Painel 2: Pedidos em Andamento */}
              <div className="w-full md:w-1/2 lg:w-3/5 h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header do Painel */}
                <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-800">Pedidos em Preparo</h2>
                    <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {pedidosEmAndamento.length}
                    </span>
                  </div>
                </div>

                {/* Lista de Pedidos em Andamento */}
                <ListPedidos
                  pedidos={pedidosEmAndamento}
                  onPedidoClick={handlePedidoClick}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getStatusIcon={getStatusIcon}
                />
              </div>
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

export default Kitchen;
