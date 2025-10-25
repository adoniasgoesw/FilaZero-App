import db from '../config/db.js';

class PedidosPagamentosController {
  // Salvar pagamentos de um pedido (POST /pedidos-pagamentos/save)
  async savePagamentos(req, res) {
    try {
      const { pedido_id, pagamentos, caixa_id } = req.body;

      // Validações obrigatórias
      if (!pedido_id || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pedido ID, lista de pagamentos e caixa ID são obrigatórios'
        });
      }

      if (!caixa_id) {
        return res.status(400).json({
          success: false,
          message: 'Caixa ID é obrigatório'
        });
      }

      console.log(`💳 Salvando ${pagamentos.length} pagamentos para pedido ${pedido_id}`);

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // 1. Excluir pagamentos existentes do pedido
        await db.query('DELETE FROM pedidos_pagamentos WHERE pedido_id = $1', [pedido_id]);
        console.log('🗑️ Pagamentos anteriores excluídos');

        // 2. Calcular totais
        let valorTotalPago = 0;
        const pagamentosInseridos = [];

        // 3. Inserir novos pagamentos
        for (const pagamento of pagamentos) {
          const { pagamento_id, valor_pago } = pagamento;
          
          if (!pagamento_id || !valor_pago || valor_pago <= 0) {
            throw new Error(`Pagamento inválido: ${JSON.stringify(pagamento)}`);
          }

          const novoPagamento = await db.query(
            `INSERT INTO pedidos_pagamentos (pedido_id, pagamento_id, valor_pago, caixa_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [pedido_id, pagamento_id, valor_pago, caixa_id]
          );

          pagamentosInseridos.push(novoPagamento.rows[0]);
          valorTotalPago += parseFloat(valor_pago);
        }

        console.log(`✅ ${pagamentosInseridos.length} pagamentos salvos`);

        // 4. Buscar dados do pedido para calcular valores
        const pedidoResult = await db.query(
          'SELECT valor_total, desconto, acrescimos FROM pedidos WHERE id = $1',
          [pedido_id]
        );

        if (pedidoResult.rows.length === 0) {
          throw new Error('Pedido não encontrado');
        }

        const pedido = pedidoResult.rows[0];
        const valorTotalPedido = parseFloat(pedido.valor_total) || 0;
        const desconto = parseFloat(pedido.desconto) || 0;
        const acrescimo = parseFloat(pedido.acrescimos) || 0;
        
        // Valor total considerando desconto e acréscimo
        const valorTotalComDescontoAcrescimo = valorTotalPedido - desconto + acrescimo;

        // 5. Calcular valores finais
        const valorTroco = Math.max(0, valorTotalPago - valorTotalComDescontoAcrescimo);
        const valorPagoReal = valorTotalPago - valorTroco; // Valor realmente pago (sem troco)
        const valorRestante = Math.max(0, valorTotalComDescontoAcrescimo - valorPagoReal);

        console.log('💰 Valores calculados:', {
          valorTotalPedido,
          desconto,
          acrescimo,
          valorTotalComDescontoAcrescimo,
          valorTotalPago,
          valorPagoReal,
          valorRestante,
          valorTroco
        });

        // 6. Atualizar valores na tabela pedidos_pagamentos (remover troco)
        if (valorTroco > 0) {
          // Calcular proporção de cada pagamento
          const proporcaoTotal = valorTotalPago;
          const valorRealTotal = valorPagoReal;
          
          for (const pagamento of pagamentosInseridos) {
            const proporcaoPagamento = parseFloat(pagamento.valor_pago) / proporcaoTotal;
            const valorRealPagamento = valorRealTotal * proporcaoPagamento;
            
            await db.query(
              'UPDATE pedidos_pagamentos SET valor_pago = $1 WHERE id = $2',
              [valorRealPagamento, pagamento.id]
            );
          }
          
          console.log('✅ Valores dos pagamentos atualizados (removido troco)');
        }

        // 7. Atualizar pedido com os valores de pagamento
        const pedidoAtualizado = await db.query(
          `UPDATE pedidos 
           SET valor_pago = $1, valor_restante = $2, valor_troco = $3, situacao = $4
           WHERE id = $5 
           RETURNING *`,
          [
            valorPagoReal, // Valor realmente pago (sem troco)
            valorRestante,
            valorTroco,
            valorRestante > 0 ? 'aberto' : 'pago', // Se tem restante, fica aberto, senão pago
            pedido_id
          ]
        );

        console.log(`✅ Pedido atualizado: ${pedidoAtualizado.rows[0].situacao}`);

        // Confirmar transação
        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Pagamentos salvos com sucesso',
          data: {
            pedido: pedidoAtualizado.rows[0],
            pagamentos: pagamentosInseridos,
            valores: {
              valor_total: valorTotalComDescontoAcrescimo,
              valor_pago: valorPagoReal,
              valor_restante: valorRestante,
              valor_troco: valorTroco
            }
          }
        });

      } catch (error) {
        // Reverter transação em caso de erro
        await db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('❌ Erro ao salvar pagamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar pagamentos de um pedido (GET /pedidos-pagamentos/:pedido_id)
  async getPagamentosByPedido(req, res) {
    try {
      const { pedido_id } = req.params;

      if (!pedido_id) {
        return res.status(400).json({
          success: false,
          message: 'Pedido ID é obrigatório'
        });
      }

      const result = await db.query(
        `SELECT pp.*, p.nome as pagamento_nome, p.status as pagamento_status
         FROM pedidos_pagamentos pp
         JOIN pagamentos p ON pp.pagamento_id = p.id
         WHERE pp.pedido_id = $1
         ORDER BY pp.criado_em ASC`,
        [pedido_id]
      );

      res.json({
        success: true,
        data: {
          pagamentos: result.rows
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir pagamentos de um pedido (DELETE /pedidos-pagamentos/:pedido_id)
  async deletePagamentosByPedido(req, res) {
    try {
      const { pedido_id } = req.params;

      if (!pedido_id) {
        return res.status(400).json({
          success: false,
          message: 'Pedido ID é obrigatório'
        });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Excluir pagamentos
        await db.query('DELETE FROM pedidos_pagamentos WHERE pedido_id = $1', [pedido_id]);

        // Resetar valores do pedido
        await db.query(
          `UPDATE pedidos 
           SET valor_pago = 0, valor_restante = valor_total, valor_troco = 0, situacao = 'aberto'
           WHERE id = $1`,
          [pedido_id]
        );

        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Pagamentos excluídos com sucesso'
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('❌ Erro ao excluir pagamentos do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir um pagamento específico por ID (DELETE /pedidos-pagamentos/item/:id)
  async deletePagamentoById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do pagamento é obrigatório'
        });
      }

      // Excluir pagamento específico
      await db.query('DELETE FROM pedidos_pagamentos WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Pagamento excluído com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao excluir pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PedidosPagamentosController();
