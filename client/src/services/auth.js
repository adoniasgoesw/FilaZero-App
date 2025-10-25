// Serviço de autenticação e gerenciamento de sessão
export const AUTH_KEYS = {
  USER_ID: 'filaZero_userId',
  ESTABLISHMENT_ID: 'filaZero_establishmentId',
  USER_NAME: 'filaZero_userName',
  USER_EMAIL: 'filaZero_userEmail',
  USER_CPF: 'filaZero_userCPF',
  ESTABLISHMENT_NAME: 'filaZero_establishmentName',
  IS_LOGGED_IN: 'filaZero_isLoggedIn',
  WELCOME_SHOWN: 'filaZero_welcomeShown'
};

// Salvar dados do usuário após login/registro
export const saveUserData = (userData) => {
  try {
    localStorage.setItem(AUTH_KEYS.USER_ID, userData.userId || '');
    localStorage.setItem(AUTH_KEYS.ESTABLISHMENT_ID, userData.establishmentId || '');
    localStorage.setItem(AUTH_KEYS.USER_NAME, userData.userName || '');
    localStorage.setItem(AUTH_KEYS.USER_EMAIL, userData.userEmail || '');
    localStorage.setItem(AUTH_KEYS.USER_CPF, userData.userCPF || '');
    localStorage.setItem(AUTH_KEYS.ESTABLISHMENT_NAME, userData.establishmentName || '');
    localStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
    
    console.log('Dados do usuário salvos:', userData);
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    return false;
  }
};

// Recuperar dados do usuário
export const getUserData = () => {
  try {
    return {
      userId: localStorage.getItem(AUTH_KEYS.USER_ID) || '',
      establishmentId: localStorage.getItem(AUTH_KEYS.ESTABLISHMENT_ID) || '',
      userName: localStorage.getItem(AUTH_KEYS.USER_NAME) || '',
      userEmail: localStorage.getItem(AUTH_KEYS.USER_EMAIL) || '',
      userCPF: localStorage.getItem(AUTH_KEYS.USER_CPF) || '',
      establishmentName: localStorage.getItem(AUTH_KEYS.ESTABLISHMENT_NAME) || '',
      isLoggedIn: localStorage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true'
    };
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
    return {
      userId: '',
      establishmentId: '',
      userName: '',
      userEmail: '',
      userCPF: '',
      establishmentName: '',
      isLoggedIn: false
    };
  }
};

// Verificar se usuário está logado
export const isUserLoggedIn = () => {
  const userData = getUserData();
  return userData.isLoggedIn && userData.userId;
};

// Fazer logout
export const logout = () => {
  try {
    localStorage.removeItem(AUTH_KEYS.USER_ID);
    localStorage.removeItem(AUTH_KEYS.ESTABLISHMENT_ID);
    localStorage.removeItem(AUTH_KEYS.USER_NAME);
    localStorage.removeItem(AUTH_KEYS.USER_EMAIL);
    localStorage.removeItem(AUTH_KEYS.USER_CPF);
    localStorage.removeItem(AUTH_KEYS.ESTABLISHMENT_NAME);
    localStorage.removeItem(AUTH_KEYS.IS_LOGGED_IN);
    
    console.log('Usuário deslogado');
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

// Marcar card de boas-vindas como mostrado
export const markWelcomeAsShown = () => {
  try {
    localStorage.setItem(AUTH_KEYS.WELCOME_SHOWN, 'true');
    console.log('Card de boas-vindas marcado como mostrado');
    return true;
  } catch (error) {
    console.error('Erro ao marcar boas-vindas:', error);
    return false;
  }
};

// Verificar se card de boas-vindas já foi mostrado
export const hasWelcomeBeenShown = () => {
  try {
    return localStorage.getItem(AUTH_KEYS.WELCOME_SHOWN) === 'true';
  } catch (error) {
    console.error('Erro ao verificar boas-vindas:', error);
    return false;
  }
};

// Simular dados de usuário para teste (remover em produção)
export const simulateUserData = () => {
  return {
    userId: 'user_' + Date.now(),
    establishmentId: 'est_' + Date.now(),
    userName: 'Usuário Teste',
    userEmail: 'usuario@teste.com'
  };
};
