import { useState, useEffect } from 'react';
import { getUserData, isUserLoggedIn } from '../services/auth.js';

export const useAuth = () => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const user = getUserData();
        const loggedIn = isUserLoggedIn();
        
        setUserData(user);
        setIsLoggedIn(loggedIn);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        setUserData(null);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const updateUserData = (newUserData) => {
    setUserData(newUserData);
    setIsLoggedIn(true);
  };

  const clearUserData = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return {
    userData,
    isLoggedIn,
    isLoading,
    updateUserData,
    clearUserData
  };
};
