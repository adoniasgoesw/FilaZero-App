import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import SearchBar from '../../components/layouts/SearchBar';
import ListCaixas from '../../components/lists/ListCaixas';
import Notification from '../../components/elements/Notification';

const Caixas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const refreshListRef = useRef();
  
  // Estados para notificação
  const [notification, setNotification] = useState(null);

  const handleBack = () => {
    navigate('/config');
  };

  // Função para capturar a referência de refresh
  const handleRefreshRef = (refreshFn) => {
    refreshListRef.current = refreshFn;
  };

  // Função para atualizar a lista
  const refreshList = () => {
    if (refreshListRef.current) {
      refreshListRef.current();
    }
  };

  const handleCaixaClick = (caixa) => {
    console.log('Detalhes do caixa:', caixa);
    // Aqui você pode implementar a lógica para mostrar detalhes do caixa
    showNotification(`Visualizando detalhes do caixa de ${caixa.data_abertura}`, 'info');
  };

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="caixas" onNavigate={(page) => {
        if (['clients', 'users', 'payments', 'categories', 'products', 'caixas'].includes(page)) {
          navigate(`/${page}`);
        } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
          navigate(`/${page}`);
        } else {
          navigate('/home');
        }
      }} isManagementPage={true} />
      
      {/* Conteúdo da página - Caixa 2 */}
      <div className="flex-1 md:ml-20 h-screen flex flex-col overflow-hidden">
        {/* Caixa 1 - Header: Botão voltar e barra de pesquisa */}
        <div className="flex items-center gap-4 p-4 sm:p-6 bg-white flex-shrink-0">
          <BackButton onClick={handleBack} isRound={true} />
          <div className="flex-1">
            <SearchBar 
              placeholder="Buscar caixas..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Caixa 2 - Listagem de caixas (com scroll) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <ListCaixas 
              onCaixaClick={handleCaixaClick}
              onRefresh={handleRefreshRef}
            />
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={closeNotification}
      />
    </div>
  );
};

export default Caixas;





