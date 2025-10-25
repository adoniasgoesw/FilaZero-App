import API_URL from '../config/api.js';

class DescontoAcrescimoService {
  // Buscar desconto atual de um pedido
  async buscarDesconto(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/desconto`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar desconto:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar acréscimo atual de um pedido
  async buscarAcrescimo(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/acrescimo`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar acréscimo:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Aplicar desconto a um pedido
  async aplicarDesconto(pedidoId, valor, tipo) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/desconto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor, tipo })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao aplicar desconto:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Aplicar acréscimo a um pedido
  async aplicarAcrescimo(pedidoId, valor, tipo) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/acrescimo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor, tipo })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao aplicar acréscimo:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Remover desconto de um pedido
  async removerDesconto(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/desconto`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao remover desconto:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Remover acréscimo de um pedido
  async removerAcrescimo(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/acrescimo`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao remover acréscimo:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}

export default new DescontoAcrescimoService();
