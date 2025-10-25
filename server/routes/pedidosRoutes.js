import express from 'express';
import pedidosController from '../controllers/pedidosController.js';

const router = express.Router();

// POST /pedidos - Criar novo pedido
router.post('/', pedidosController.create);

// GET /pedidos/atendimento/:atendimento_id - Buscar pedidos por atendimento
router.get('/atendimento/:atendimento_id', pedidosController.getByAtendimento);

// PUT /pedidos/:id - Atualizar pedido
router.put('/:id', pedidosController.update);

// DELETE /pedidos/:id - Excluir pedido
router.delete('/:id', pedidosController.delete);

// DELETE /pedidos/atendimento/:atendimento_id - Excluir pedidos por atendimento
router.delete('/atendimento/:atendimento_id', pedidosController.deleteByAtendimento);

// POST /pedidos/ensure - Garantir ou criar pedido para atendimento
router.post('/ensure', pedidosController.ensurePedido);

// GET /pedidos/atendimento/:atendimento_id/aberto - Buscar pedido aberto com itens
router.get('/atendimento/:atendimento_id/aberto', pedidosController.getPedidoAbertoComItens);

export default router;
