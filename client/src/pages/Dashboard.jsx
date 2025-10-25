import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import Historic from './Historic';
import Kitchen from './Kitchen';
import Delivery from './Delivery';
import Config from './Config';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    console.log('Dashboard - Navegando para:', page);
    setCurrentPage(page);
    
    // Para páginas de gestão, navegar para rotas específicas
    if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
      console.log('Dashboard - Navegando para gestão:', page);
      navigate(`/${page}`);
    } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
      console.log('Dashboard - Navegando para página:', page);
      navigate(`/${page}`);
    } else if (page === 'home') {
      console.log('Dashboard - Já está na home, apenas atualizando estado');
      // Não navegar, apenas atualizar o estado
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage currentPage={currentPage} onNavigate={handleNavigate} />;
      case 'historic':
        return <Historic currentPage={currentPage} onNavigate={handleNavigate} />;
      case 'kitchen':
        return <Kitchen currentPage={currentPage} onNavigate={handleNavigate} />;
      case 'delivery':
        return <Delivery currentPage={currentPage} onNavigate={handleNavigate} />;
      case 'config':
        return <Config currentPage={currentPage} onNavigate={handleNavigate} />;
      default:
        return <HomePage currentPage={currentPage} onNavigate={handleNavigate} />;
    }
  };

  return renderPage();
};

export default Dashboard;

