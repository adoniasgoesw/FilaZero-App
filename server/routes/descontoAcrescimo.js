import express from 'express';
import DescontoAcrescimoController from '../controllers/descontoAcrescimoController.js';

const router = express.Router();

// Buscar desconto atual de um pedido
router.get('/pedidos/:pedidoId/desconto', DescontoAcrescimoController.buscarDesconto);

// Buscar acréscimo atual de um pedido
router.get('/pedidos/:pedidoId/acrescimo', DescontoAcrescimoController.buscarAcrescimo);

// Aplicar desconto a um pedido
router.put('/pedidos/:pedidoId/desconto', DescontoAcrescimoController.aplicarDesconto);

// Aplicar acréscimo a um pedido
router.put('/pedidos/:pedidoId/acrescimo', DescontoAcrescimoController.aplicarAcrescimo);

// Remover desconto de um pedido
router.delete('/pedidos/:pedidoId/desconto', DescontoAcrescimoController.removerDesconto);

// Remover acréscimo de um pedido
router.delete('/pedidos/:pedidoId/acrescimo', DescontoAcrescimoController.removerAcrescimo);

export default router;
