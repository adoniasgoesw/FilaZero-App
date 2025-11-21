import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import Sidebar from '../components/layouts/Sidebar';
import SearchBar from '../components/layouts/SearchBar';
import ConfigButton from '../components/buttons/Config';
import CardBase from '../components/cards/Base';
import CloseButton from '../components/buttons/Close';
import BaseModal from '../components/modals/Base';
import FormConfig from '../components/forms/FormConfig';
import ListPontosAtendimento from '../components/lists/ListPontosAtendimento';
import CaixaWarning from '../components/elements/CaixaWarning';
import { getUserData, hasWelcomeBeenShown, markWelcomeAsShown } from '../services/auth';
import ConfirmDialog from '../components/elements/ConfirmDialog';
import { API_URL } from '../services/api';

const HomePage = ({ currentPage, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const userNameFromUrl = urlParams.get('name');
  
  // Usar dados do sistema de autenticação
  const userData = getUserData();
  const userName = userNameFromUrl || userData.userName || 'Usuário';
  
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const formConfigRef = useRef(null);
  const refreshListaPontosRef = useRef(() => {});
  const [isCaixaDialogOpen, setIsCaixaDialogOpen] = useState(false);
  const [caixaStatus, setCaixaStatus] = useState('loading'); // 'loading' | 'aberto' | 'fechado' | 'nenhum_caixa'
  const [showCaixaWarning, setShowCaixaWarning] = useState(false);
  const [caixaWithWarning, setCaixaWithWarning] = useState(null);

  useEffect(() => {
    // Mostrar card de boas-vindas apenas se:
    // 1. Veio do registro (tem nome na URL)
    // 2. Card de boas-vindas ainda não foi mostrado
    // 3. Usuário está logado
    if (userNameFromUrl && !hasWelcomeBeenShown() && userData.isLoggedIn) {
      setShowWelcomeCard(true);
    }
  }, [userNameFromUrl, userData.isLoggedIn]);

  const handleCloseWelcome = () => {
    setShowWelcomeCard(false);
    // Marcar card de boas-vindas como mostrado para nunca mais aparecer
    markWelcomeAsShown();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseWelcome();
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Pesquisando:', term);
  };

  const handleConfigClick = () => {
    setIsConfigModalOpen(true);
  };

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false);
  };

  const handleOpenNewCaixa = () => {
    setShowCaixaWarning(false);
    setCaixaWithWarning(null);
    // Aqui você pode implementar a lógica para abrir um novo caixa
    console.log('Abrir novo caixa');
  };

  const handleCancelCaixaWarning = () => {
    setShowCaixaWarning(false);
    setCaixaWithWarning(null);
  };

  // Simular estabelecimentoId (em produção viria do contexto de autenticação)
  useEffect(() => {
    setEstabelecimentoId(7); // ID que existe no banco de dados
  }, []);

  // Função auxiliar para processar caixas abertos
  const processarCaixasAbertos = (caixasAbertos) => {
    // Usar lógica real para verificar se o caixa tem mais de 24h
    const agora = new Date();
    for (const caixa of caixasAbertos) {
      const dataAbertura = new Date(caixa.data_abertura);
      const diffMs = agora - dataAbertura;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      console.log('Caixa ID:', caixa.id);
      console.log('Data de abertura:', dataAbertura);
      console.log('Horas abertas:', diffHours);
      
      if (diffHours >= 24) {
        setCaixaWithWarning(caixa);
        setShowCaixaWarning(true);
        break; // Mostrar apenas o primeiro caixa com problema
      }
    }
  };

  // Função para verificar caixas abertos há mais de 24 horas
  const checkForOldCaixas = async () => {
    if (!estabelecimentoId) return;
    
    try {
      // Buscar caixas abertos
      const response = await fetch(`${API_URL}/caixas/abertos/${estabelecimentoId}`);
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        // Se for 404, o endpoint não existe, então não fazer nada (silenciosamente)
        if (response.status === 404) {
          // Endpoint não existe, não é um erro crítico
          return;
        }
        // Para outros erros HTTP, tentar parsear JSON apenas se o content-type for JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json();
            if (result.success && result.data?.caixas?.length > 0) {
              processarCaixasAbertos(result.data.caixas);
            }
          } catch (parseError) {
            console.error('Erro ao processar resposta JSON:', parseError);
          }
        }
        return;
      }
      
      // Resposta OK, tentar parsear JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        
        if (result.success && result.data?.caixas?.length > 0) {
          processarCaixasAbertos(result.data.caixas);
        }
      }
    } catch (error) {
      // Se o erro for de parsing JSON (como quando recebe HTML), apenas logar silenciosamente
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        // Endpoint pode não existir ou retornar HTML, não é um erro crítico
        return;
      } else {
        // Outros erros de rede podem ser logados, mas não são críticos
        console.error('Erro ao verificar caixas antigos:', error);
      }
    }
  };

  // Verificar caixas antigos quando o estabelecimentoId estiver disponível
  useEffect(() => {
    if (estabelecimentoId) {
      checkForOldCaixas();
    }
  }, [estabelecimentoId]);

  // Verificar status do caixa ao entrar na Home
  useEffect(() => {
    const checkCaixaStatus = async () => {
      if (!estabelecimentoId) return;
      try {
        const response = await fetch(`${API_URL}/caixa/status/${estabelecimentoId}`);
        const result = await response.json();
        if (result.success) {
          setCaixaStatus(result.data.status);
          // Abrir diálogo quando caixa estiver fechado ou inexistente
          if (result.data.status !== 'aberto') {
            setIsCaixaDialogOpen(true);
          }
        } else {
          setCaixaStatus('fechado');
          setIsCaixaDialogOpen(true);
        }
      } catch (err) {
        setCaixaStatus('fechado');
        setIsCaixaDialogOpen(true);
      }
    };
    checkCaixaStatus();
  }, [estabelecimentoId]);

  const handleConfirmAbrirCaixa = () => {
    setIsCaixaDialogOpen(false);
    navigate('/historic?openCaixaModal=true');
  };

  // Expor função de atualização globalmente
  useEffect(() => {
    window.atualizarListaPontos = () => {
      if (refreshListaPontosRef.current) {
        refreshListaPontosRef.current();
      }
    };
    
    // Limpar função quando componente desmontar
    return () => {
      delete window.atualizarListaPontos;
    };
  }, []);

  const shouldShowMainContent = !(isCaixaDialogOpen && caixaStatus !== 'aberto');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content (hidden when caixa dialog is open) */}
      {shouldShowMainContent && (
        <div className="md:ml-20 pb-16 md:pb-0">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              {/* Home Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Home className="text-blue-600" size={24} />
              </div>
              
              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar 
                  placeholder="Pesquisar pedidos, clientes, produtos..."
                  onSearch={handleSearch}
                />
              </div>
              
              {/* Config Button */}
              <ConfigButton onClick={handleConfigClick} />
            </div>
            
            {/* Content Area - Pontos de Atendimento */}
            <div className="space-y-6">
              {/* Lista de Pontos de Atendimento */}
              {estabelecimentoId && (
                <ListPontosAtendimento
                  estabelecimentoId={estabelecimentoId}
                  onRefresh={(callback) => {
                    refreshListaPontosRef.current = callback;
                  }}
                />
              )}
              
              {/* Resultado da Pesquisa */}
              {searchTerm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Pesquisando por:</strong> "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card de Boas-vindas */}
      {showWelcomeCard && (
        <div 
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={handleOverlayClick}
        >
          <div className="relative bg-white rounded-2xl max-w-md w-full mx-auto" style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            animation: 'slideIn 0.4s ease-out'
          }}>
            {/* Close Button */}
            <button
              onClick={handleCloseWelcome}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group z-[70]"
            >
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            {/* Card Content */}
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              {/* Welcome Message */}
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Bem-vindo, {userName}! 😊
              </h1>
              
              {/* Success Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                🎉 Conta criada com sucesso!
              </div>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8">
                Sua conta foi criada com sucesso no <span className="font-semibold text-indigo-600">FilaZero</span>! Agora você tem acesso completo ao sistema de gestão de filas.
              </p>
              
              {/* Action Button */}
              <button
                onClick={handleCloseWelcome}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
                <span>Começar a usar o FilaZero</span>
              </button>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full opacity-80"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-pink-400 rounded-full opacity-60"></div>
          </div>
        </div>
      )}

      {/* Dialog: Caixa Fechado na Home */}
      <ConfirmDialog
        isOpen={isCaixaDialogOpen && caixaStatus !== 'aberto'}
        onClose={() => setIsCaixaDialogOpen(false)}
        onConfirm={handleConfirmAbrirCaixa}
        title={caixaStatus === 'fechado' ? 'Caixa fechado' : 'Nenhum caixa aberto'}
        message={
          caixaStatus === 'fechado'
            ? 'O caixa está fechado. Abra um novo caixa para iniciar o expediente.'
            : 'Não há caixa aberto. Abra um novo caixa para iniciar o expediente.'
        }
        confirmText="Abrir novo caixa"
        cancelText="Agora não"
        type="warning"
        isHomePage={true}
      />

      {/* Modal de Configurações */}
      <BaseModal 
        isOpen={isConfigModalOpen} 
        onClose={handleCloseConfigModal}
        onSave={() => {
          console.log('Salvando configurações do ponto de atendimento...');
          if (formConfigRef.current) {
            formConfigRef.current.submit();
          }
        }}
        title="Configurações"
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormConfig ref={formConfigRef} onSuccess={() => {
          // Atualizar a lista de pontos de atendimento imediatamente
          refreshListaPontosRef.current();
          handleCloseConfigModal();
        }} />
      </BaseModal>

      {/* Aviso de caixa aberto há mais de 24 horas */}
      {showCaixaWarning && caixaWithWarning && (
        <CaixaWarning
          caixa={caixaWithWarning}
          onOpenNewCaixa={handleOpenNewCaixa}
          onCancel={handleCancelCaixaWarning}
        />
      )}
    </div>
  );
};

export default HomePage;