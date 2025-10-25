import React from 'react';
import { Users, UserCheck, CreditCard, Tag, Package } from 'lucide-react';

const ClientCard = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-32 h-32 min-[430px]:w-40 min-[430px]:h-40 sm:w-48 sm:h-48 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-2 min-[430px]:p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 min-[430px]:w-8 min-[430px]:h-8 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-1 min-[430px]:mb-2 sm:mb-4 group-hover:bg-blue-100 transition-colors duration-200">
        <Users className="text-blue-600" size={14} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-tight">Cliente</h3>
        <p className="text-xs text-gray-500 leading-tight font-normal">Gerenciar clientes e informações</p>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-1 right-1 min-[430px]:top-2 min-[430px]:right-2 sm:top-4 sm:right-4 w-1 h-1 min-[430px]:w-1.5 min-[430px]:h-1.5 sm:w-2 sm:h-2 bg-blue-300 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
    </div>
  );
};

const UsuariosCard = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-32 h-32 min-[430px]:w-40 min-[430px]:h-40 sm:w-48 sm:h-48 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-2 min-[430px]:p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 min-[430px]:w-8 min-[430px]:h-8 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center mb-1 min-[430px]:mb-2 sm:mb-4 group-hover:bg-green-100 transition-colors duration-200">
        <UserCheck className="text-green-600" size={14} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-tight">Usuários</h3>
        <p className="text-xs text-gray-500 leading-tight font-normal">Gerenciar cargos e atendentes</p>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-green-300 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
    </div>
  );
};

const PagamentosCard = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-32 h-32 min-[430px]:w-40 min-[430px]:h-40 sm:w-48 sm:h-48 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-2 min-[430px]:p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 min-[430px]:w-8 min-[430px]:h-8 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-1 min-[430px]:mb-2 sm:mb-4 group-hover:bg-purple-100 transition-colors duration-200">
        <CreditCard className="text-purple-600" size={14} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-tight">Pagamentos</h3>
        <p className="text-xs text-gray-500 leading-tight font-normal">Gerenciar formas de pagamento</p>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
    </div>
  );
};

const CategoriasCard = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-32 h-32 min-[430px]:w-40 min-[430px]:h-40 sm:w-48 sm:h-48 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-2 min-[430px]:p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 min-[430px]:w-8 min-[430px]:h-8 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-1 min-[430px]:mb-2 sm:mb-4 group-hover:bg-orange-100 transition-colors duration-200">
        <Tag className="text-orange-600" size={14} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-tight">Categorias</h3>
        <p className="text-xs text-gray-500 leading-tight font-normal">Organizar produtos por categoria</p>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-orange-300 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
    </div>
  );
};

const ProdutosCard = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-32 h-32 min-[430px]:w-40 min-[430px]:h-40 sm:w-48 sm:h-48 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-2 min-[430px]:p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 min-[430px]:w-8 min-[430px]:h-8 sm:w-12 sm:h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-1 min-[430px]:mb-2 sm:mb-4 group-hover:bg-indigo-100 transition-colors duration-200">
        <Package className="text-indigo-600" size={14} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-tight">Produtos</h3>
        <p className="text-xs text-gray-500 leading-tight font-normal">Gerenciar catálogo de produtos</p>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-300 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
    </div>
  );
};

export { ClientCard, UsuariosCard, PagamentosCard, CategoriasCard, ProdutosCard };

