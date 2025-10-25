import db from '../config/db.js';
import { atualizarTotalVendas } from './caixasController.js';

class FinalizarPedidoController {
  async finalizarPedido(req, res) {
    const client = await db.connect();
    
    try {
      const { pedidoId, imprimir = false } = req.body;
      
      console.log('🔄 Iniciando finalização do pedido:', pedidoId);
      
      await client.query('BEGIN');
      
      // 1. Buscar dados do pedido
      const pedidoResult = await client.query(
        'SELECT * FROM pedidos WHERE id = $1',
        [pedidoId]
      );
      
      if (pedidoResult.rows.length === 0) {
        throw new Error('Pedido não encontrado');
      }
      
      const pedido = pedidoResult.rows[0];
      console.log('📋 Pedido encontrado:', pedido);
      
      // 2. Buscar itens do pedido
      const itensResult = await client.query(
        'SELECT * FROM itens_pedido WHERE pedido_id = $1',
        [pedidoId]
      );
      
      const itens = itensResult.rows;
      console.log('📦 Itens encontrados:', itens.length);
      
      // 3. Buscar pagamentos do pedido
      const pagamentosResult = await client.query(
        'SELECT * FROM pedidos_pagamentos WHERE pedido_id = $1',
        [pedidoId]
      );
      
      const pagamentos = pagamentosResult.rows;
      console.log('💳 Pagamentos encontrados:', pagamentos.length);
      
      // 4. Inserir pedido no histórico
      const pedidoHistoricoResult = await client.query(`
        INSERT INTO pedidos_historico (
          pedido_id, atendimento_id, valor_total, cliente_id, pagamento_id, 
          caixa_id, usuario_id, canal, codigo, situacao, desconto, acrescimos, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        pedido.id,
        pedido.atendimento_id,
        pedido.valor_total,
        pedido.cliente_id,
        pedido.pagamento_id,
        pedido.caixa_id,
        pedido.usuario_id,
        pedido.canal,
        pedido.codigo,
        'encerrado',
        pedido.desconto,
        pedido.acrescimos,
        'finalizado'
      ]);
      
      const pedidoHistoricoId = pedidoHistoricoResult.rows[0].id;
      console.log('✅ Pedido inserido no histórico:', pedidoHistoricoId);
      
      // 5. Inserir itens no histórico
      for (const item of itens) {
        await client.query(`
          INSERT INTO itens_pedido_historico (
            pedido_historico_id, produto_id, quantidade, valor_unitario, 
            valor_total, status, descricao
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          pedidoHistoricoId,
          item.produto_id,
          item.quantidade,
          item.valor_unitario,
          item.valor_total,
          'finalizado',
          item.descricao
        ]);
      }
      console.log('✅ Itens inseridos no histórico');
      
      // 6. Inserir pagamentos no histórico
      for (const pagamento of pagamentos) {
        await client.query(`
          INSERT INTO pedidos_pagamentos_historico (
            pedido_id, pagamento_id, valor_pago, caixa_id
          ) VALUES ($1, $2, $3, $4)
        `, [
          pedido.id,
          pagamento.pagamento_id,
          pagamento.valor_pago,
          pagamento.caixa_id
        ]);
      }
      console.log('✅ Pagamentos inseridos no histórico');
      
      // 7. Limpar tabelas originais
      await client.query('DELETE FROM pedidos_pagamentos WHERE pedido_id = $1', [pedidoId]);
      await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [pedidoId]);
      await client.query('DELETE FROM pedidos WHERE id = $1', [pedidoId]);
      console.log('🗑️ Tabelas originais limpas');
      
      // 8. Liberar ponto de atendimento
      await client.query(`
        UPDATE atendimentos 
        SET status = 'disponivel', nome_ponto = '' 
        WHERE id = $1
      `, [pedido.atendimento_id]);
      console.log('🔄 Ponto de atendimento liberado');
      
      await client.query('COMMIT');
      
      // Atualizar total_vendas do caixa
      try {
        await atualizarTotalVendas(pedido.caixa_id);
        console.log('💰 Total de vendas do caixa atualizado');
      } catch (error) {
        console.error('⚠️ Erro ao atualizar total_vendas:', error);
        // Não falhar a operação por causa disso
      }
      
      console.log('✅ Pedido finalizado com sucesso!');
      
      res.json({
        success: true,
        message: 'Pedido finalizado com sucesso!',
        data: {
          pedidoHistoricoId,
          imprimir,
          atendimentoId: pedido.atendimento_id
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao finalizar pedido:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao finalizar pedido: ' + error.message
      });
    } finally {
      client.release();
    }
  }
}

export default new FinalizarPedidoController();
