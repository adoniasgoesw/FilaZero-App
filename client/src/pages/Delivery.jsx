import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';

const Delivery = () => {
  const navigate = useNavigate();
  const currentPage = 'delivery';

  const handleNavigate = (page) => {
    if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
      navigate(`/${page}`);
    } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
      navigate(`/${page}`);
    } else {
      navigate('/home');
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className="md:ml-20 pb-16 md:pb-0">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Delivery</h1>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedidos para Entrega</h2>
            <p className="text-gray-600">
              Acompanhe e gerencie os pedidos de delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
