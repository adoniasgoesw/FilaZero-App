import { API_URL } from './api';

class PedidoService {
  /**
   * Criar ou buscar pedido para um atendimento
   */
  async criarOuBuscarPedido(atendimentoId, usuarioId = null) {
    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          atendimento_id: atendimentoId,
          usuario_id: usuarioId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar/buscar pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar pedido por ID
   */
  async buscarPorId(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar pedidos por atendimento
   */
  async buscarPorAtendimento(atendimentoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/atendimento/${atendimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedidos por atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar pedido
   */
  async atualizar(pedidoId, updates) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Deletar pedido
   */
  async deletar(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Deletar pedido completo (pedido + itens + resetar ponto)
   */
  async deletarCompleto(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/completo`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar pedido completo:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}

export default new PedidoService();


