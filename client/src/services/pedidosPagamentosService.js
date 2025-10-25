import { API_URL } from './api.js';

class PedidosPagamentosService {
  // Salvar pagamentos de um pedido
  async savePagamentos(pedidoId, pagamentos, caixaId) {
    try {
      const response = await fetch(`${API_URL}/pedidos-pagamentos/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedido_id: pedidoId,
          pagamentos: pagamentos,
          caixa_id: caixaId
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao salvar pagamentos:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Buscar pagamentos de um pedido
  async getPagamentosByPedido(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos-pagamentos/${pedidoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos do pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Excluir pagamentos de um pedido
  async deletePagamentosByPedido(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos-pagamentos/${pedidoId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao excluir pagamentos do pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Excluir um pagamento específico por ID
  async deletePagamentoById(pagamentoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos-pagamentos/item/${pagamentoId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }
}

export default new PedidosPagamentosService();
