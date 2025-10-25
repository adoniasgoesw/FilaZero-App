import express from 'express';
import pedidoSalvamentoController from '../controllers/pedidoSalvamentoController.js';

const router = express.Router();

// POST /pedido-salvamento/save - Fluxo completo de salvamento de pedido
router.post('/save', pedidoSalvamentoController.savePedidoCompleto);

// GET /pedido-salvamento/atendimento/:atendimento_id - Carregar pedido aberto com itens
router.get('/atendimento/:atendimento_id', pedidoSalvamentoController.loadPedidoAberto);

export default router;





