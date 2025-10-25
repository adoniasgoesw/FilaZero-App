import pool from '../config/db.js';

class PedidoController {
  /**
   * Criar ou buscar pedido para um atendimento
   * Se não existir, cria um novo pedido
   * Se já existir, retorna o existente
   */
  async criarOuBuscarPedido(req, res) {
    const { atendimento_id, usuario_id } = req.body;

    console.log('=== CRIAR OU BUSCAR PEDIDO ===');
    console.log('Dados recebidos:', { atendimento_id, usuario_id });

    try {
      // Validar dados obrigatórios
      if (!atendimento_id) {
        console.log('❌ atendimento_id é obrigatório');
        return res.status(400).json({
          success: false,
          message: 'atendimento_id é obrigatório'
        });
      }

      // 1. Verificar se já existe um pedido para este atendimento
      console.log('🔍 Buscando pedido existente...');
      const buscarQuery = `
        SELECT * FROM pedidos 
        WHERE atendimento_id = $1
      `;
      
      console.log('Query:', buscarQuery);
      console.log('Parâmetros:', [atendimento_id]);
      
      const buscarResult = await pool.query(buscarQuery, [atendimento_id]);
      console.log('Resultado da busca:', buscarResult.rows);

      // 2. Se já existir, retornar o existente
      if (buscarResult.rows.length > 0) {
        const pedidoExistente = buscarResult.rows[0];
        console.log('✅ Pedido existente encontrado:', pedidoExistente);
        
        return res.status(200).json({
          success: true,
          message: 'Pedido existente retornado',
          data: {
            pedido: pedidoExistente
          }
        });
      }

      // 3. Buscar caixa aberto
      console.log('🔍 Buscando caixa aberto...');
      const caixaQuery = `
        SELECT * FROM caixas 
        WHERE status = true 
        ORDER BY data_abertura DESC 
        LIMIT 1
      `;
      
      const caixaResult = await pool.query(caixaQuery);
      console.log('Caixa encontrado:', caixaResult.rows);

      if (caixaResult.rows.length === 0) {
        console.log('❌ Nenhum caixa aberto encontrado');
        return res.status(400).json({
          success: false,
          message: 'Nenhum caixa aberto encontrado. Abra um caixa antes de criar pedidos.'
        });
      }

      const caixaAberto = caixaResult.rows[0];
      console.log('✅ Caixa aberto encontrado:', caixaAberto.id);

      // 4. Cliente e pagamento serão definidos posteriormente
      console.log('ℹ️ Cliente e pagamento serão definidos na finalização');
      const clienteId = 0; // Não associar a cliente específico
      const pagamentoId = 0; // Não associar a pagamento específico

      // 6. Criar novo pedido
      console.log('➕ Criando novo pedido...');
      const criarQuery = `
        INSERT INTO pedidos 
        (atendimento_id, status, caixa_id, usuario_id, canal, situacao, cliente_id, pagamento_id, valor_restante, criado_em)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const criarResult = await pool.query(criarQuery, [
        atendimento_id,
        'pendente',
        caixaAberto.id,
        usuario_id || null, // Usar ID real do usuário ou NULL
        'PDV',
        'aberto',
        clienteId, // cliente_id válido
        pagamentoId, // pagamento_id válido
        0.00  // valor_restante 0.00 (não NULL)
      ]);
      
      console.log('✅ Pedido criado:', criarResult.rows[0]);

      return res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: {
          pedido: criarResult.rows[0]
        }
      });

    } catch (error) {
      console.error('❌ Erro ao criar/buscar pedido:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar pedido por ID
   */
  async buscarPorId(req, res) {
    const { id } = req.params;

    try {
      const query = 'SELECT * FROM pedidos WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          pedido: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar pedidos por atendimento
   */
  async buscarPorAtendimento(req, res) {
    const { atendimento_id } = req.params;

    try {
      const query = 'SELECT * FROM pedidos WHERE atendimento_id = $1';
      const result = await pool.query(query, [atendimento_id]);

      return res.status(200).json({
        success: true,
        data: {
          pedidos: result.rows
        }
      });

    } catch (error) {
      console.error('Erro ao buscar pedidos por atendimento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Atualizar pedido
   */
  async atualizar(req, res) {
    const { id } = req.params;
    const updates = req.body;

    try {
      // Construir query dinamicamente
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar'
        });
      }

      const query = `
        UPDATE pedidos 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      values.push(id);
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pedido atualizado com sucesso',
        data: {
          pedido: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Deletar pedido
   */
  async deletar(req, res) {
    const { id } = req.params;

    try {
      const query = 'DELETE FROM pedidos WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pedido deletado com sucesso',
        data: {
          pedido: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Deletar pedido completo (pedido + itens + resetar ponto)
   */
  async deletarCompleto(req, res) {
    const { id } = req.params;

    try {
      console.log('=== DELETAR PEDIDO COMPLETO ===');
      console.log('Pedido ID:', id);

      // Iniciar transação
      await pool.query('BEGIN');

      // 1. Buscar o pedido e seu atendimento_id
      const pedidoQuery = 'SELECT * FROM pedidos WHERE id = $1';
      const pedidoResult = await pool.query(pedidoQuery, [id]);

      if (pedidoResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const pedido = pedidoResult.rows[0];
      const atendimentoId = pedido.atendimento_id;

      console.log('✅ Pedido encontrado:', pedido);
      console.log('Atendimento ID extraído:', atendimentoId);
      console.log('Tipo do atendimentoId:', typeof atendimentoId);

      // 2. Deletar todos os itens do pedido
      console.log('🗑️ Deletando itens do pedido...');
      const deleteItensQuery = 'DELETE FROM itens_pedido WHERE pedido_id = $1';
      const itensResult = await pool.query(deleteItensQuery, [id]);
      console.log('✅ Itens deletados:', itensResult.rowCount);

      // 3. Deletar o pedido
      console.log('🗑️ Deletando pedido...');
      const deletePedidoQuery = 'DELETE FROM pedidos WHERE id = $1';
      const pedidoDeleteResult = await pool.query(deletePedidoQuery, [id]);
      console.log('✅ Pedido deletado:', pedidoDeleteResult.rowCount);

      // 4. Resetar o ponto de atendimento diretamente
      console.log('🔄 Resetando ponto de atendimento...');
      console.log('Atendimento ID para resetar:', atendimentoId);
      
      const resetPontoQuery = `
        UPDATE atendimentos 
        SET nome_ponto = '', status = 'disponivel', criado_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      console.log('Query de reset:', resetPontoQuery);
      console.log('Parâmetros:', [atendimentoId]);
      
      const resetResult = await pool.query(resetPontoQuery, [atendimentoId]);
      console.log('✅ Ponto resetado:', resetResult.rows[0]);
      
      if (resetResult.rows.length === 0) {
        console.error('❌ ERRO: Nenhum ponto foi atualizado!');
        await pool.query('ROLLBACK');
        return res.status(500).json({
          success: false,
          message: 'Erro ao resetar ponto de atendimento'
        });
      }

      // Confirmar transação
      await pool.query('COMMIT');

      console.log('✅ Exclusão completa realizada com sucesso');

      return res.status(200).json({
        success: true,
        message: 'Pedido excluído com sucesso. Ponto de atendimento resetado.',
        data: {
          pedido: pedido,
          itensDeletados: itensResult.rowCount,
          pontoResetado: resetResult.rows[0]
        }
      });

    } catch (error) {
      // Reverter transação em caso de erro
      await pool.query('ROLLBACK');
      console.error('❌ Erro ao deletar pedido completo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PedidoController();
