import express from 'express';
import PedidoController from '../controllers/PedidoController.js';

const router = express.Router();

// POST /api/pedidos - Criar ou buscar pedido
router.post('/', PedidoController.criarOuBuscarPedido);

// GET /api/pedidos/:id - Buscar pedido por ID
router.get('/:id', PedidoController.buscarPorId);

// GET /api/pedidos/atendimento/:atendimento_id - Buscar pedidos por atendimento
router.get('/atendimento/:atendimento_id', PedidoController.buscarPorAtendimento);

// PUT /api/pedidos/:id - Atualizar pedido
router.put('/:id', PedidoController.atualizar);

// DELETE /api/pedidos/:id - Deletar pedido
router.delete('/:id', PedidoController.deletar);

// DELETE /api/pedidos/:id/completo - Deletar pedido completo (pedido + itens + resetar ponto)
router.delete('/:id/completo', PedidoController.deletarCompleto);

export default router;


