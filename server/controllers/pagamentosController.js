import { pool } from '../config/db.js';

class PagamentosController {
  // Finalizar pagamento de um pedido
  async finalizarPagamento(req, res) {
    const { pedidoId } = req.params;
    const { pagamentoId, valorPago, caixaId } = req.body;

    console.log('🔍 Debug finalizarPagamento:', { pedidoId, pagamentoId, valorPago, caixaId });

    try {
      await pool.query('BEGIN');

      // 1. Buscar o pedido atual
      const pedidoQuery = 'SELECT * FROM pedidos WHERE id = $1';
      const pedidoResult = await pool.query(pedidoQuery, [pedidoId]);
      
      if (pedidoResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const pedido = pedidoResult.rows[0];
      const valorTotal = parseFloat(pedido.valor_total) || 0;
      const valorPagoAtual = parseFloat(pedido.valor_pago) || 0;
      const valorRestanteAtual = parseFloat(pedido.valor_restante) || 0;

      // 2. Calcular novos valores
      // O valorPago já vem como valor efetivo pago (sem troco) do frontend
      const novoValorPago = valorPagoAtual + parseFloat(valorPago);
      const novoValorRestante = valorTotal - novoValorPago;
      const valorTroco = novoValorRestante < 0 ? Math.abs(novoValorRestante) : 0;
      const valorRestanteFinal = novoValorRestante < 0 ? 0 : novoValorRestante;

      console.log('🧮 Cálculos de pagamento:', {
        valorTotal,
        valorPagoAtual,
        valorPagoNovo: parseFloat(valorPago),
        novoValorPago,
        novoValorRestante,
        valorTroco,
        valorRestanteFinal
      });

      // 3. Inserir na tabela pedidos_pagamentos
      const insertPagamentoQuery = `
        INSERT INTO pedidos_pagamentos (pedido_id, pagamento_id, valor_pago, caixa_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const pagamentoResult = await pool.query(insertPagamentoQuery, [
        pedidoId,
        pagamentoId,
        valorPago,
        caixaId
      ]);

      // 4. Atualizar a tabela pedidos
      const updatePedidoQuery = `
        UPDATE pedidos 
        SET valor_pago = $1, valor_restante = $2, valor_troco = $3
        WHERE id = $4
        RETURNING *
      `;
      
      const pedidoAtualizado = await pool.query(updatePedidoQuery, [
        novoValorPago, // Usar valor efetivo pago (já calculado pelo frontend)
        valorRestanteFinal,
        valorTroco,
        pedidoId
      ]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Pagamento finalizado com sucesso',
        data: {
          pedido: pedidoAtualizado.rows[0],
          pagamento: pagamentoResult.rows[0],
          valores: {
            valorTotal,
            valorPagoAnterior: valorPagoAtual,
            valorPagoNovo: parseFloat(valorPago),
            valorPagoTotal: novoValorPago,
            valorRestante: valorRestanteFinal,
            valorTroco
          }
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao finalizar pagamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar pagamentos de um pedido
  async buscarPagamentosPedido(req, res) {
    const { pedidoId } = req.params;

    try {
      const query = `
        SELECT 
          pp.*,
          p.nome as pagamento_nome,
          p.tipo as pagamento_tipo
        FROM pedidos_pagamentos pp
        JOIN pagamentos p ON pp.pagamento_id = p.id
        WHERE pp.pedido_id = $1
        ORDER BY pp.criado_em DESC
      `;
      
      const result = await pool.query(query, [pedidoId]);
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao buscar pagamentos do pedido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Remover um pagamento específico
  async removerPagamento(req, res) {
    const { pedidoId, pagamentoId } = req.params;

    try {
      await pool.query('BEGIN');

      // 1. Buscar o pagamento a ser removido
      const pagamentoQuery = 'SELECT * FROM pedidos_pagamentos WHERE pedido_id = $1 AND id = $2';
      const pagamentoResult = await pool.query(pagamentoQuery, [pedidoId, pagamentoId]);
      
      if (pagamentoResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      const pagamentoRemovido = pagamentoResult.rows[0];
      const valorRemovido = parseFloat(pagamentoRemovido.valor_pago);

      // 2. Buscar o pedido atual
      const pedidoQuery = 'SELECT * FROM pedidos WHERE id = $1';
      const pedidoResult = await pool.query(pedidoQuery, [pedidoId]);
      const pedido = pedidoResult.rows[0];

      // 3. Recalcular valores do pedido
      const valorTotal = parseFloat(pedido.valor_total) || 0;
      const valorPagoAtual = parseFloat(pedido.valor_pago) || 0;
      const novoValorPago = valorPagoAtual - valorRemovido;
      const novoValorRestante = valorTotal - novoValorPago;
      const valorTroco = novoValorRestante < 0 ? Math.abs(novoValorRestante) : 0;
      const valorRestanteFinal = novoValorRestante < 0 ? 0 : novoValorRestante;

      // 4. Remover o pagamento
      await pool.query('DELETE FROM pedidos_pagamentos WHERE id = $1', [pagamentoId]);

      // 5. Atualizar o pedido
      const updatePedidoQuery = `
        UPDATE pedidos 
        SET valor_pago = $1, valor_restante = $2, valor_troco = $3
        WHERE id = $4
        RETURNING *
      `;
      
      const pedidoAtualizado = await pool.query(updatePedidoQuery, [
        novoValorPago,
        valorRestanteFinal,
        valorTroco,
        pedidoId
      ]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Pagamento removido com sucesso',
        data: {
          pedido: pedidoAtualizado.rows[0],
          valores: {
            valorTotal,
            valorPagoAnterior: valorPagoAtual,
            valorRemovido,
            valorPagoTotal: novoValorPago,
            valorRestante: valorRestanteFinal,
            valorTroco
          }
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao remover pagamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar formas de pagamento disponíveis
  async buscarFormasPagamento(req, res) {
    try {
      const query = 'SELECT * FROM pagamentos WHERE status = true ORDER BY nome';
      const result = await pool.query(query);
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar resumo de pagamentos de um pedido (pago, restante, troco)
  async buscarResumoPagamentos(req, res) {
    const { pedidoId } = req.params;

    try {
      // Buscar dados do pedido
      const pedidoQuery = 'SELECT valor_total, valor_pago, valor_restante, valor_troco FROM pedidos WHERE id = $1';
      const pedidoResult = await pool.query(pedidoQuery, [pedidoId]);
      
      if (pedidoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const pedido = pedidoResult.rows[0];
      
      return res.status(200).json({
        success: true,
        data: {
          valorTotal: parseFloat(pedido.valor_total) || 0,
          valorPago: parseFloat(pedido.valor_pago) || 0,
          valorRestante: parseFloat(pedido.valor_restante) || 0,
          valorTroco: parseFloat(pedido.valor_troco) || 0
        }
      });

    } catch (error) {
      console.error('Erro ao buscar resumo de pagamentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PagamentosController();
