import { API_URL } from './api';

const finalizarPedidoService = {
  async finalizarPedido(pedidoId, imprimir = false) {
    try {
      console.log('🔄 Finalizando pedido:', { pedidoId, imprimir });
      
      const response = await fetch(`${API_URL}/finalizar-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidoId,
          imprimir
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Pedido finalizado com sucesso:', data);
        return data;
      } else {
        console.error('❌ Erro ao finalizar pedido:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  }
};

export default finalizarPedidoService;
