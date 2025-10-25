import express from 'express';
import FinalizarPedidoController from '../controllers/finalizarPedidoController.js';

const router = express.Router();

// Finalizar pedido
router.post('/', FinalizarPedidoController.finalizarPedido);

export default router;
