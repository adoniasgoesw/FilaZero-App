import React, { useState } from 'react';
import { Home, Clock, ChefHat, Truck, Settings, Zap, LogOut } from 'lucide-react';
import { logout } from '../../services/auth';
import ConfirmDialog from '../elements/ConfirmDialog';

const Sidebar = ({ currentPage, onNavigate, isManagementPage = false }) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'historic', icon: Clock, label: 'Histórico' },
    { id: 'kitchen', icon: ChefHat, label: 'Cozinha' },
    { id: 'delivery', icon: Truck, label: 'Delivery' },
    { id: 'config', icon: Settings, label: 'Ajustes' }
  ];

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleCancelLogout = () => {
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
      {/* Sidebar para telas médias e grandes - oculto em mobile */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-white border-r border-gray-200 flex-col items-center py-6 z-[110] shadow-lg">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Zap className="text-white" size={24} />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 w-full items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600 shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }
                `}
                title={item.label}
              >
                <Icon size={20} />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Botão de Logout */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative text-gray-500 hover:bg-red-100 hover:text-red-600"
            title="Sair"
          >
            <LogOut size={20} />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Sair
            </div>
          </button>
        </div>
      </div>

      {/* Footer para mobile - oculto em telas médias e grandes e em páginas de gestão */}
      {!isManagementPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[110]">
          <div className="flex items-center justify-around py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-0 flex-1
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={item.label}
                >
                  <Icon 
                    size={24} 
                    className={`
                      transition-colors duration-200
                      ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ConfirmDialog para Logout */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
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
    </>
  );
};

export default Sidebar;