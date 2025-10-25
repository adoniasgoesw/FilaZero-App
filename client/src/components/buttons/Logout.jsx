import React from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../../services/auth';

const LogoutButton = ({ className = "", size = 20 }) => {
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      // Redirecionar para login
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`p-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-105 ${className}`}
      title="Sair"
    >
      <LogOut size={size} />
    </button>
  );
};

export default LogoutButton;

