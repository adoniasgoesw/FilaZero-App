import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import Profile from '../components/cards/Profile';
import CardBase from '../components/cards/Base';
import { Users, UserCheck, CreditCard, Tag, Package, DollarSign } from 'lucide-react';

const Config = () => {
  const navigate = useNavigate();
  const currentPage = 'config';

  const handleCardClick = (page) => {
    console.log('Card clicado:', page);
    navigate(`/${page}`);
  };

  const handleNavigate = (page) => {
    if (['clients', 'users', 'payments', 'categories', 'products', 'caixas'].includes(page)) {
      navigate(`/${page}`);
    } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
navigate(`/${page}`);
    } else {
      navigate('/home');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Caixa 1 - Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Caixa 2 - Conteúdo Principal */}
      <div 
        className="md:ml-20 pb-16 md:pb-0"
        style={{
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="p-6 space-y-6">
          {/* Caixa 1 - Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ajustes</h1>
          </div>

          {/* Caixa 2 - Perfil */}
          <Profile />

          {/* Caixa 3 - Gestão */}
          <div>
            <div className="text-left mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Gestão</h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Card Cliente */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('clients')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Clientes</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Gerencie clientes do estabelecimento</p>
                </div>
              </CardBase>

              {/* Card Usuários */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('users')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                    <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Usuários</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Gerencie cargos e atendentes</p>
                </div>
              </CardBase>

              {/* Card Pagamentos */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('payments')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Pagamentos</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Gerencie formas de pagamento</p>
                </div>
              </CardBase>

              {/* Card Categorias */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('categories')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
                    <Tag className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Categorias</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Organize produtos por categoria</p>
                </div>
              </CardBase>

              {/* Card Produtos */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('products')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-2">
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Produtos</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Gerencie catálogo de produtos</p>
                </div>
              </CardBase>
            </div>
          </div>

          {/* Caixa 4 - Administração */}
          <div>
            <div className="text-left mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Administração</h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Card Caixas */}
              <CardBase className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square" onClick={() => handleCardClick('caixas')}>
                <div className="flex flex-col items-center text-center h-full justify-center p-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                    <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                  </div>
                  <h3 className="text-xs lg:text-base font-semibold text-gray-800 mb-1">Caixas</h3>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight max-[400px]:hidden">Histórico de caixas</p>
                </div>
              </CardBase>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;

