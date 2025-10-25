import express from 'express';
import pagamentosController from '../controllers/pagamentosController.js';

const router = express.Router();

// Finalizar pagamento de um pedido
router.post('/pedidos/:pedidoId/pagamentos', pagamentosController.finalizarPagamento);

// Buscar pagamentos de um pedido
router.get('/pedidos/:pedidoId/pagamentos', pagamentosController.buscarPagamentosPedido);

// Remover um pagamento específico
router.delete('/pedidos/:pedidoId/pagamentos/:pagamentoId', pagamentosController.removerPagamento);

// Buscar formas de pagamento disponíveis
router.get('/pagamentos', pagamentosController.buscarFormasPagamento);

// Buscar resumo de pagamentos de um pedido (pago, restante, troco)
router.get('/pedidos/:pedidoId/resumo-pagamentos', pagamentosController.buscarResumoPagamentos);

export default router;
