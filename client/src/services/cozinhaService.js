import { API_URL } from './api';

class CozinhaService {
  /**
   * Enviar pedido para a cozinha
   */
  async enviarParaCozinha(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/cozinha/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pedido_id: pedidoId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enviar pedido para cozinha:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar pedidos na cozinha
   */
  async buscarPedidosCozinha() {
    try {
      const response = await fetch(`${API_URL}/cozinha/pedidos`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedidos da cozinha:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar pedido da cozinha por ID com itens
   */
  async buscarPedidoComItens(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/cozinha/pedidos/${pedidoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido da cozinha:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Aceitar pedido na cozinha (muda status para aguardando)
   */
  async aceitarPedido(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/cozinha/pedidos/${pedidoId}/aceitar`, {
        method: 'PUT'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar status de um item do pedido
   */
  async atualizarStatusItem(itemId, status) {
    try {
      const response = await fetch(`${API_URL}/cozinha/itens/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status do item:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar status do pedido
   */
  async atualizarStatusPedido(pedidoId, status) {
    try {
      const response = await fetch(`${API_URL}/cozinha/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}

export default new CozinhaService();

