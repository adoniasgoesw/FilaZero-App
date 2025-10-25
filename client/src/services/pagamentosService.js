import API_URL from '../config/api.js';

class PagamentosService {
  // Finalizar pagamento de um pedido
  async finalizarPagamento(pedidoId, pagamentoId, valorPago, caixaId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/pagamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pagamentoId, 
          valorPago: parseFloat(valorPago), 
          caixaId 
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao finalizar pagamento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar pagamentos de um pedido
  async buscarPagamentosPedido(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/pagamentos`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos do pedido:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Remover um pagamento específico
  async removerPagamento(pedidoId, pagamentoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/pagamentos/${pagamentoId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao remover pagamento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar formas de pagamento disponíveis
  async buscarFormasPagamento() {
    try {
      const response = await fetch(`${API_URL}/pagamentos`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar resumo de pagamentos de um pedido (pago, restante, troco)
  async buscarResumoPagamentos(pedidoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/resumo-pagamentos`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo de pagamentos:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}

export default new PagamentosService();
