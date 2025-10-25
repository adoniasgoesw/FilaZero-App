// Configuração da API baseada no ambiente
const getApiUrl = () => {
  // Verifica se está em produção (Vercel, Netlify, etc.)
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Produção - usar API do Render
    return 'https://filazero-sistema-de-gestao.onrender.com/api';
  } else {
    // Desenvolvimento - usar localhost ou variável de ambiente
    return import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
  }
};

export const API_URL = getApiUrl();

// Função para testar conexão com a API
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    return {
      success: true,
      data,
      apiUrl: API_URL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      apiUrl: API_URL
    };
  }
};

// Função para testar conexão com o banco de dados
export const testDbConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/test-db`);
    const data = await response.json();
    return {
      success: true,
      data,
      apiUrl: API_URL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      apiUrl: API_URL
    };
  }
};

// Funções de API para Clientes
export const createClient = async (clientData) => {
  try {
    const response = await fetch(`${API_URL}/client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const getClients = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/client/${estabelecimentoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const response = await fetch(`${API_URL}/client/${clientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const deleteClient = async (clientId) => {
  try {
    const response = await fetch(`${API_URL}/client/${clientId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Funções de API para Usuários
export const getUsers = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/users/${estabelecimentoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Funções de API para Pagamentos
export const getPayments = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/payments/${estabelecimentoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await fetch(`${API_URL}/payment/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const response = await fetch(`${API_URL}/payment/${paymentId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const togglePaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`${API_URL}/payment/${paymentId}/toggle`, {
      method: 'PUT',
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao alternar status do pagamento:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Funções de API para Pontos de Atendimento
export const criarConfiguracaoPadraoPontosAtendimento = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/pontos-atendimento/padrao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estabelecimento_id: estabelecimentoId }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar configuração padrão:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const buscarConfiguracaoPontosAtendimento = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/pontos-atendimento/${estabelecimentoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

export const atualizarConfiguracaoPontosAtendimento = async (estabelecimentoId, configData) => {
  try {
    // 1. Atualizar configuração
    const response = await fetch(`${API_URL}/pontos-atendimento/${estabelecimentoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });
    
    const data = await response.json();
    
    // 2. Se a configuração foi salva com sucesso, sincronizar pontos
    if (data.success) {
      console.log('✅ Configuração salva, sincronizando pontos...');
      
      // Importar o serviço de atendimento dinamicamente para evitar dependência circular
      const { default: atendimentoService } = await import('./atendimentoService.js');
      const syncResult = await atendimentoService.sincronizarPontos(estabelecimentoId);
      
      if (syncResult.success) {
        console.log('✅ Pontos sincronizados:', syncResult.data);
        return {
          ...data,
          syncData: syncResult.data
        };
      } else {
        console.warn('⚠️ Configuração salva, mas erro na sincronização:', syncResult.message);
        return {
          ...data,
          syncWarning: syncResult.message
        };
      }
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para buscar caixa aberto
export const buscarCaixaAberto = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/caixa/status/${estabelecimentoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar caixa aberto:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para criar pedido
export const criarPedido = async (pedidoData) => {
  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para excluir pedidos por atendimento_id
export const excluirPedidosPorAtendimento = async (atendimentoId) => {
  try {
    const response = await fetch(`${API_URL}/pedidos/atendimento/${atendimentoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao excluir pedidos:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para salvar itens do pedido
export const salvarItensPedido = async (pedidoId, itens, valorTotal, nomePedido = '') => {
  try {
    const response = await fetch(`${API_URL}/itens-pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pedido_id: pedidoId,
        itens: itens,
        valor_total: valorTotal,
        nome_pedido: nomePedido
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao salvar itens do pedido:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para buscar itens do pedido
export const buscarItensPedido = async (pedidoId) => {
  try {
    const response = await fetch(`${API_URL}/itens-pedido/pedido/${pedidoId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar itens do pedido:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para excluir itens do pedido por pedido_id
export const excluirItensPedido = async (pedidoId) => {
  try {
    const response = await fetch(`${API_URL}/itens-pedido/pedido/${pedidoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao excluir itens do pedido:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};

// Função para salvar itens e atualizar pedido (nova funcionalidade)
export const salvarItensEAtualizarPedido = async (pedidoId, itens) => {
  try {
    const response = await fetch(`${API_URL}/itens-pedido/save-and-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pedido_id: pedidoId,
        itens: itens
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao salvar itens e atualizar pedido:', error);
    return { success: false, message: 'Erro de conexão' };
  }
};


export default API_URL;
