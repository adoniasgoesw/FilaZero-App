import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isUserLoggedIn, getUserData } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedIn = isUserLoggedIn();
        const userData = getUserData();
        
        if (loggedIn && userData.userId) {
          setIsAuthenticated(true);
          
          // Se estiver na página de login/register e já estiver logado, redirecionar para home
          if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
            navigate('/home', { replace: true });
          }
        } else {
          setIsAuthenticated(false);
          
          // Se estiver em uma página protegida e não estiver logado, redirecionar para login
          const protectedPaths = ['/home', '/historic', '/kitchen', '/delivery', '/config', '/clients', '/users', '/payments', '/categories', '/products', '/caixas'];
          if (protectedPaths.some(path => location.pathname.startsWith(path))) {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado e estiver em página protegida, não renderizar nada (já redirecionou)
  const protectedPaths = ['/home', '/historic', '/kitchen', '/delivery', '/config', '/clients', '/users', '/payments', '/categories', '/products', '/caixas'];
  if (!isAuthenticated && protectedPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return children;
};

export default ProtectedRoute;