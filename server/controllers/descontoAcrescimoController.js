import { pool } from '../config/db.js';

class DescontoAcrescimoController {
  // Buscar desconto atual de um pedido
  async buscarDesconto(req, res) {
    const { pedidoId } = req.params;

    try {
      const query = 'SELECT desconto_original, desconto_tipo FROM pedidos WHERE id = $1';
      const result = await pool.query(query, [pedidoId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const pedido = result.rows[0];
      
      return res.status(200).json({
        success: true,
        data: {
          valor: pedido.desconto_original || '',
          tipo: pedido.desconto_tipo || 'percentage'
        }
      });

    } catch (error) {
      console.error('Erro ao buscar desconto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar acréscimo atual de um pedido
  async buscarAcrescimo(req, res) {
    const { pedidoId } = req.params;

    try {
      const query = 'SELECT acrescimo_original, acrescimo_tipo FROM pedidos WHERE id = $1';
      const result = await pool.query(query, [pedidoId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const pedido = result.rows[0];
      
      return res.status(200).json({
        success: true,
        data: {
          valor: pedido.acrescimo_original || '',
          tipo: pedido.acrescimo_tipo || 'percentage'
        }
      });

    } catch (error) {
      console.error('Erro ao buscar acréscimo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Aplicar desconto a um pedido
  async aplicarDesconto(req, res) {
    const { pedidoId } = req.params;
    const { valor, tipo } = req.body; // tipo: 'percentage' ou 'money'

    console.log('🔍 Debug aplicarDesconto:', { pedidoId, valor, tipo });

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
      const valorAtual = parseFloat(pedido.valor_total) || 0;
      
      // 2. Calcular o desconto
      let valorDesconto = 0;
      if (tipo === 'percentage') {
        const percentual = parseFloat(valor);
        valorDesconto = (valorAtual * percentual) / 100;
      } else {
        valorDesconto = parseFloat(valor);
      }

      // 3. Calcular novo total
      // Primeiro, reconstruir o subtotal original: valor_total + desconto - acrescimos
      const valorAcrescimos = parseFloat(pedido.acrescimos) || 0;
      const subtotalOriginal = valorAtual + valorDesconto - valorAcrescimos;
      // Depois, calcular o novo total: subtotal - novo_desconto + acrescimos
      const novoTotal = subtotalOriginal - valorDesconto + valorAcrescimos;

      // 4. Atualizar o pedido (salvar valor original e calculado)
      const updateQuery = `
        UPDATE pedidos 
        SET desconto = $1, valor_total = $2, desconto_original = $3, desconto_tipo = $4
        WHERE id = $5
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [
        valorDesconto, 
        novoTotal, 
        valor, 
        tipo, 
        pedidoId
      ]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Desconto aplicado com sucesso',
        data: {
          pedido: updateResult.rows[0],
          desconto: valorDesconto,
          descontoOriginal: valor,
          descontoTipo: tipo,
          totalAnterior: valorAtual,
          totalNovo: novoTotal
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao aplicar desconto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Aplicar acréscimo a um pedido
  async aplicarAcrescimo(req, res) {
    const { pedidoId } = req.params;
    const { valor, tipo } = req.body; // tipo: 'percentage' ou 'money'

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
      const valorAtual = parseFloat(pedido.valor_total) || 0;
      
      // 2. Calcular o acréscimo
      let valorAcrescimo = 0;
      if (tipo === 'percentage') {
        const percentual = parseFloat(valor);
        valorAcrescimo = (valorAtual * percentual) / 100;
      } else {
        valorAcrescimo = parseFloat(valor);
      }

      // 3. Calcular novo total
      // Primeiro, reconstruir o subtotal original: valor_total + desconto - acrescimos
      const valorDesconto = parseFloat(pedido.desconto) || 0;
      const subtotalOriginal = valorAtual + valorDesconto - valorAcrescimo;
      // Depois, calcular o novo total: subtotal - desconto + novo_acrescimo
      const novoTotal = subtotalOriginal - valorDesconto + valorAcrescimo;

      // 4. Atualizar o pedido (salvar valor original e calculado)
      const updateQuery = `
        UPDATE pedidos 
        SET acrescimos = $1, valor_total = $2, acrescimo_original = $3, acrescimo_tipo = $4
        WHERE id = $5
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [
        valorAcrescimo, 
        novoTotal, 
        valor, 
        tipo, 
        pedidoId
      ]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Acréscimo aplicado com sucesso',
        data: {
          pedido: updateResult.rows[0],
          acrescimo: valorAcrescimo,
          acrescimoOriginal: valor,
          acrescimoTipo: tipo,
          totalAnterior: valorAtual,
          totalNovo: novoTotal
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao aplicar acréscimo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Remover desconto de um pedido
  async removerDesconto(req, res) {
    const { pedidoId } = req.params;

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
      const valorAtual = parseFloat(pedido.valor_total) || 0;
      const valorDesconto = parseFloat(pedido.desconto) || 0;
      const valorAcrescimos = parseFloat(pedido.acrescimos) || 0;
      
      // 2. Calcular novo total (removendo o desconto)
      const novoTotal = valorAtual + valorDesconto;

      // 3. Atualizar o pedido (limpar desconto e campos originais)
      const updateQuery = `
        UPDATE pedidos 
        SET desconto = 0, valor_total = $1, desconto_original = NULL, desconto_tipo = NULL
        WHERE id = $2
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [novoTotal, pedidoId]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Desconto removido com sucesso',
        data: {
          pedido: updateResult.rows[0],
          descontoRemovido: valorDesconto,
          totalNovo: novoTotal
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao remover desconto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Remover acréscimo de um pedido
  async removerAcrescimo(req, res) {
    const { pedidoId } = req.params;

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
      const valorAtual = parseFloat(pedido.valor_total) || 0;
      const valorAcrescimo = parseFloat(pedido.acrescimos) || 0;
      
      // 2. Calcular novo total (removendo o acréscimo)
      const novoTotal = valorAtual - valorAcrescimo;

      // 3. Atualizar o pedido (limpar acréscimo e campos originais)
      const updateQuery = `
        UPDATE pedidos 
        SET acrescimos = 0, valor_total = $1, acrescimo_original = NULL, acrescimo_tipo = NULL
        WHERE id = $2
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [novoTotal, pedidoId]);

      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Acréscimo removido com sucesso',
        data: {
          pedido: updateResult.rows[0],
          acrescimoRemovido: valorAcrescimo,
          totalNovo: novoTotal
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erro ao remover acréscimo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new DescontoAcrescimoController();
