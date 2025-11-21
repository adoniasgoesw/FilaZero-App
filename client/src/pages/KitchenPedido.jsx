import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import BackButton from '../components/buttons/Back';
import Notification from '../components/elements/Notification';
import { Clock, CheckCircle, ChefHat, AlertCircle } from 'lucide-react';

const KitchenPedido = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const currentPage = 'kitchen';
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  // Dados fictícios de pedidos
  const pedidosFicticios = {
    1: {
      id: 1,
      codigo: '001',
      mesa: 'MESA 5',
      nome_ponto: 'Mesa VIP',
      status: 'pendente'
    },
    2: {
      id: 2,
      codigo: '002',
      mesa: 'MESA 12',
      nome_ponto: 'Mesa Família',
      status: 'pendente'
    },
    3: {
      id: 3,
      codigo: '003',
      mesa: 'BALCÃO 3',
      nome_ponto: 'Balcão',
      status: 'aguardando'
    },
    4: {
      id: 4,
      codigo: '004',
      mesa: 'MESA 8',
      nome_ponto: 'Mesa Casal',
      status: 'em_preparo'
    },
    5: {
      id: 5,
      codigo: '005',
      mesa: 'MESA 15',
      nome_ponto: 'Mesa Grande',
      status: 'em_preparo'
    }
  };

  // Dados fictícios de itens
  const itensFicticios = {
    1: [
      { id: 1, produto_nome: 'Hambúrguer Artesanal', quantidade: 2, valor_unitario: 25.90, valor_total: 51.80, status: 'pendente', descricao: 'Sem cebola' },
      { id: 2, produto_nome: 'Batata Frita Grande', quantidade: 1, valor_unitario: 15.00, valor_total: 15.00, status: 'pendente', descricao: null },
      { id: 3, produto_nome: 'Refrigerante 500ml', quantidade: 2, valor_unitario: 6.50, valor_total: 13.00, status: 'pendente', descricao: 'Coca-Cola' },
      { id: 4, produto_nome: 'Sobremesa Brownie', quantidade: 1, valor_unitario: 12.90, valor_total: 12.90, status: 'pendente', descricao: null }
    ],
    2: [
      { id: 5, produto_nome: 'Pizza Margherita Grande', quantidade: 1, valor_unitario: 45.00, valor_total: 45.00, status: 'pendente', descricao: null },
      { id: 6, produto_nome: 'Pizza Calabresa Grande', quantidade: 1, valor_unitario: 48.00, valor_total: 48.00, status: 'pendente', descricao: 'Borda recheada' },
      { id: 7, produto_nome: 'Refrigerante 1L', quantidade: 2, valor_unitario: 8.00, valor_total: 16.00, status: 'pendente', descricao: 'Pepsi' },
      { id: 8, produto_nome: 'Salada Caesar', quantidade: 2, valor_unitario: 18.50, valor_total: 37.00, status: 'pendente', descricao: null },
      { id: 9, produto_nome: 'Água Mineral', quantidade: 2, valor_unitario: 4.00, valor_total: 8.00, status: 'pendente', descricao: null },
      { id: 10, produto_nome: 'Sobremesa Tiramisu', quantidade: 1, valor_unitario: 16.90, valor_total: 16.90, status: 'pendente', descricao: null }
    ],
    3: [
      { id: 11, produto_nome: 'X-Burger', quantidade: 1, valor_unitario: 18.00, valor_total: 18.00, status: 'pendente', descricao: null },
      { id: 12, produto_nome: 'Batata Frita Média', quantidade: 1, valor_unitario: 12.00, valor_total: 12.00, status: 'pendente', descricao: null },
      { id: 13, produto_nome: 'Suco Natural', quantidade: 1, valor_unitario: 8.50, valor_total: 8.50, descricao: 'Laranja', status: 'pendente' }
    ],
    4: [
      { id: 14, produto_nome: 'Risotto de Camarão', quantidade: 1, valor_unitario: 65.00, valor_total: 65.00, status: 'em_preparo', descricao: null },
      { id: 15, produto_nome: 'Salada Verde', quantidade: 1, valor_unitario: 22.00, valor_total: 22.00, status: 'pendente', descricao: null },
      { id: 16, produto_nome: 'Vinho Tinto', quantidade: 1, valor_unitario: 85.00, valor_total: 85.00, status: 'finalizado', descricao: 'Taça' },
      { id: 17, produto_nome: 'Pão de Alho', quantidade: 2, valor_unitario: 8.00, valor_total: 16.00, status: 'em_preparo', descricao: null },
      { id: 18, produto_nome: 'Sobremesa Petit Gateau', quantidade: 1, valor_unitario: 24.90, valor_total: 24.90, status: 'em_preparo', descricao: null }
    ],
    5: [
      { id: 19, produto_nome: 'Churrasco Misto', quantidade: 2, valor_unitario: 55.00, valor_total: 110.00, status: 'em_preparo', descricao: 'Bem passado' },
      { id: 20, produto_nome: 'Arroz e Feijão', quantidade: 4, valor_unitario: 8.00, valor_total: 32.00, status: 'finalizado', descricao: null },
      { id: 21, produto_nome: 'Farofa', quantidade: 2, valor_unitario: 6.00, valor_total: 12.00, status: 'finalizado', descricao: null },
      { id: 22, produto_nome: 'Salada Mista', quantidade: 2, valor_unitario: 15.00, valor_total: 30.00, status: 'em_preparo', descricao: null },
      { id: 23, produto_nome: 'Refrigerante 2L', quantidade: 2, valor_unitario: 10.00, valor_total: 20.00, status: 'finalizado', descricao: 'Guaraná' },
      { id: 24, produto_nome: 'Cerveja 600ml', quantidade: 3, valor_unitario: 12.00, valor_total: 36.00, status: 'em_preparo', descricao: 'Heineken' },
      { id: 25, produto_nome: 'Picanha na Chapa', quantidade: 1, valor_unitario: 75.00, valor_total: 75.00, status: 'em_preparo', descricao: 'Ao ponto' },
      { id: 26, produto_nome: 'Sobremesa Pudim', quantidade: 2, valor_unitario: 9.90, valor_total: 19.80, status: 'em_preparo', descricao: null }
    ]
  };

  const handleNavigate = (page) => {
    if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
      navigate(`/${page}`);
    } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
      navigate(`/${page}`);
    } else {
      navigate('/home');
    }
  };

  const carregarDadosFicticios = () => {
    const pedidoIdNum = parseInt(pedidoId);
    const pedidoFicticio = pedidosFicticios[pedidoIdNum];
    const itensFicticiosPedido = itensFicticios[pedidoIdNum] || [];

    if (pedidoFicticio) {
      setPedido(pedidoFicticio);
      setItens(itensFicticiosPedido);
    } else {
      // Se não encontrar, criar um pedido padrão
      setPedido({
        id: pedidoIdNum,
        codigo: String(pedidoIdNum).padStart(3, '0'),
        mesa: 'MESA ' + pedidoIdNum,
        nome_ponto: 'Mesa Padrão',
        status: 'pendente'
      });
      setItens([
        { id: 1, produto_nome: 'Item Exemplo', quantidade: 1, valor_unitario: 20.00, valor_total: 20.00, status: 'pendente', descricao: null }
      ]);
    }
  };

  useEffect(() => {
    carregarDadosFicticios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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
        return <AlertCircle className="w-4 h-4" />;
      case 'em_preparo':
        return <ChefHat className="w-4 h-4" />;
      case 'finalizado':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPedidoStatusColor = (status) => {
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

  const getPedidoStatusLabel = (status) => {
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

  const getPedidoStatusIcon = (status) => {
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

  const handleAtualizarStatusItem = (itemId, novoStatus) => {
    // Atualizar status localmente (dados fictícios)
    setItens(prevItens => 
      prevItens.map(item => 
        item.id === itemId 
          ? { ...item, status: novoStatus }
          : item
      )
    );
    setNotification({ message: 'Status do item atualizado com sucesso!', type: 'success' });
  };

  const handleAceitarPedido = () => {
    if (pedido?.status !== 'pendente') return;
    
    // Atualizar status localmente (dados fictícios)
    setPedido(prevPedido => ({ ...prevPedido, status: 'aguardando' }));
    setNotification({ message: 'Pedido aceito com sucesso!', type: 'success' });
  };

  const handleBack = () => {
    navigate('/kitchen');
  };

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="md:ml-20 flex-1 p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Pedido não encontrado</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div 
        className="md:ml-20 pb-16 md:pb-0"
        style={{
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="p-4 sm:p-6">
          {/* Header com botão voltar */}
          <div className="flex items-center gap-4 mb-6">
            <BackButton 
              onClick={handleBack}
              isRound={true}
              size="small"
              iconSize={16}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Detalhes do Pedido</h1>
          </div>

          {/* Card do Pedido */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
            {/* Informações do Pedido */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Pedido #{pedido.codigo || pedido.id}
                </h2>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">Mesa:</span> {pedido.mesa || 'N/A'}
                  </p>
                  {pedido.nome_ponto && (
                    <p className="text-sm sm:text-base text-gray-600">
                      <span className="font-semibold">Ponto:</span> {pedido.nome_ponto}
                    </p>
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold ${getPedidoStatusColor(pedido.status)}`}>
                {getPedidoStatusIcon(pedido.status)}
                {getPedidoStatusLabel(pedido.status)}
              </div>
            </div>

            {/* Botão Aceitar (só aparece se status for pendente) */}
            {pedido.status === 'pendente' && (
              <button
                onClick={handleAceitarPedido}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Aceitar Pedido
              </button>
            )}
          </div>

          {/* Lista de Itens */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Itens do Pedido</h3>
            
            {itens.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nenhum item encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Informações do Item */}
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                          {item.produto_nome || 'Produto'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>
                            <span className="font-semibold">Quantidade:</span> {item.quantidade}
                          </span>
                          <span>
                            <span className="font-semibold">Valor Unitário:</span> R$ {parseFloat(item.produto_preco || item.valor_unitario || 0).toFixed(2)}
                          </span>
                          <span>
                            <span className="font-semibold">Total:</span> R$ {parseFloat(item.valor_total || 0).toFixed(2)}
                          </span>
                        </div>
                        {item.descricao && (
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-semibold">Observações:</span> {item.descricao}
                          </p>
                        )}
                      </div>

                      {/* Status e Ações */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Status Atual */}
                        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {getStatusLabel(item.status)}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-wrap gap-2">
                          {item.status !== 'pendente' && (
                            <button
                              onClick={() => handleAtualizarStatusItem(item.id, 'pendente')}
                              className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors duration-200 text-xs font-semibold border border-yellow-300"
                            >
                              Pendente
                            </button>
                          )}
                          {item.status !== 'em_preparo' && (
                            <button
                              onClick={() => handleAtualizarStatusItem(item.id, 'em_preparo')}
                              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors duration-200 text-xs font-semibold border border-orange-300"
                            >
                              Em Preparo
                            </button>
                          )}
                          {item.status !== 'finalizado' && (
                            <button
                              onClick={() => handleAtualizarStatusItem(item.id, 'finalizado')}
                              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors duration-200 text-xs font-semibold border border-green-300"
                            >
                              Finalizado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default KitchenPedido;

