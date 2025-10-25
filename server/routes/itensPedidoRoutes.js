import express from 'express';
import itensPedidoController from '../controllers/itensPedidoController.js';

const router = express.Router();

// POST /itens-pedido - Criar itens do pedido
router.post('/', itensPedidoController.create);

// GET /itens-pedido/pedido/:pedido_id - Buscar itens por pedido
router.get('/pedido/:pedido_id', itensPedidoController.getByPedido);

// PUT /itens-pedido/:id - Atualizar item do pedido
router.put('/:id', itensPedidoController.update);

// DELETE /itens-pedido/:id - Excluir item do pedido
router.delete('/:id', itensPedidoController.delete);

// DELETE /itens-pedido/pedido/:pedido_id - Excluir todos os itens de um pedido
router.delete('/pedido/:pedido_id', itensPedidoController.deleteByPedido);

// POST /itens-pedido/save-and-update - Salvar itens e atualizar valor total do pedido
router.post('/save-and-update', itensPedidoController.saveAndUpdatePedido);

export default router;

