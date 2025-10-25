import express from 'express';
import AtendimentoController from '../controllers/AtendimentoController.js';

const router = express.Router();

// POST /api/atendimentos - Criar ou buscar ponto de atendimento
router.post('/', AtendimentoController.criarOuBuscarPonto);

// GET /api/atendimentos/estabelecimento/:estabelecimento_id - Listar pontos por estabelecimento
router.get('/estabelecimento/:estabelecimento_id', AtendimentoController.listarPorEstabelecimento);

// GET /api/atendimentos/atualizado/:id - Buscar dados atualizados (para tempo real)
router.get('/atualizado/:id', AtendimentoController.buscarDadosAtualizados);

// GET /api/atendimentos/:id - Buscar ponto por ID
router.get('/:id', AtendimentoController.buscarPorId);

// GET /api/atendimentos/:identificador/:estabelecimento_id - Buscar por identificador
router.get('/:identificador/:estabelecimento_id', AtendimentoController.buscarPorIdentificador);

// PUT /api/atendimentos/:id/status - Atualizar status
router.put('/:id/status', AtendimentoController.atualizarStatus);

// PUT /api/atendimentos/:id/resetar - Resetar ponto (usado após exclusão de pedido)
router.put('/:id/resetar', AtendimentoController.resetarPonto);

// PUT /api/atendimentos/:id/nome-ponto - Atualizar nome do ponto
router.put('/:id/nome-ponto', AtendimentoController.atualizarNomePonto);

// DELETE /api/atendimentos/:id - Deletar ponto
router.delete('/:id', AtendimentoController.deletar);

// POST /api/atendimentos/sincronizar/:estabelecimentoId - Sincronizar pontos com configuração
router.post('/sincronizar/:estabelecimentoId', AtendimentoController.sincronizarPontos);

// POST /api/atendimentos/limpar-recriar/:estabelecimentoId - Limpar e recriar pontos
router.post('/limpar-recriar/:estabelecimentoId', AtendimentoController.limparERecriarPontos);

export default router;
