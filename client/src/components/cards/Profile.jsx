import React, { useState } from 'react';
import { User, Building, CreditCard, Briefcase, LogOut } from 'lucide-react';
import CardBase from './Base';
import ConfirmDialog from '../elements/ConfirmDialog';
import CancelButton from '../buttons/Cancel';
import { getUserData, logout } from '../../services/auth';

const Profile = () => {
  const userData = getUserData();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Função para formatar CPF
  const formatCPF = (cpf) => {
    if (!cpf || cpf === 'Não informado') return cpf;
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    // Aplica a máscara XXX.XXX.XXX-XX
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Usar função de logout do serviço de autenticação
    logout();
    
    // Redirecionar para login
    window.location.href = '/login';
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="space-y-3">
      {/* Título da Seção */}
      <div className="text-left">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Perfil</h2>
        <div className="w-10 sm:w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
      </div>

      {/* Card do Perfil */}
      <CardBase className="max-w-md">
        <div className="space-y-3">
          {/* Header com Estabelecimento */}
          <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building className="text-gray-600" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium">Estabelecimento</p>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight break-words">
                {userData.establishmentName || 'Não informado'}
              </h3>
            </div>
          </div>

          {/* Dados do Usuário em Linha */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
            {/* Nome */}
            <div className="text-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-1">
                <User className="text-blue-600 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Nome</p>
              <p className="text-xs font-semibold text-gray-800 leading-tight break-words sm:text-sm" style={{ fontSize: '10px' }}>
                {userData.userName || 'Não informado'}
              </p>
            </div>

            {/* CPF */}
            <div className="text-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-green-50 rounded-md flex items-center justify-center mx-auto mb-1">
                <CreditCard className="text-green-600 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-xs text-gray-500 font-medium">CPF</p>
              <p className="text-xs font-semibold text-gray-800 leading-tight sm:text-sm" style={{ fontSize: '10px' }}>
                {formatCPF(userData.userCPF) || 'Não informado'}
              </p>
            </div>

            {/* Cargo */}
            <div className="text-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-orange-50 rounded-md flex items-center justify-center mx-auto mb-1">
                <Briefcase className="text-orange-600 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Cargo</p>
              <p className="text-xs font-semibold text-gray-800 leading-tight break-words sm:text-sm" style={{ fontSize: '10px' }}>
                Administrador
              </p>
            </div>
          </div>

          {/* Botão de Logout */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </CardBase>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Confirmar saída"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
        type="confirm"
        customIcon={<LogOut />}
        customIconColor="blue"
        customButtonColor="blue"
      />
    </div>
  );
};

export default Profile;