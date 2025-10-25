import express from 'express';
import PedidosPagamentosController from '../controllers/pedidosPagamentosController.js';

const router = express.Router();

// Salvar pagamentos de um pedido
router.post('/save', PedidosPagamentosController.savePagamentos);

// Buscar pagamentos de um pedido
router.get('/:pedido_id', PedidosPagamentosController.getPagamentosByPedido);

// Excluir pagamentos de um pedido
router.delete('/:pedido_id', PedidosPagamentosController.deletePagamentosByPedido);

// Excluir um pagamento específico por ID
router.delete('/item/:id', PedidosPagamentosController.deletePagamentoById);

export default router;
