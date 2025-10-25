import db from '../config/db.js';

class PedidosController {
  // Criar novo pedido (POST /pedidos)
  async create(req, res) {
    try {
      const { 
        atendimento_id, 
        cliente_id = 16, // Cliente genérico (não selecionado)
        caixa_id, 
        usuario_id, 
        pagamento_id = 23, // Pagamento genérico (não selecionado)
        canal = 'PDV',
        situacao = 'aberto',
        valor_total = 0,
        valor_pago = 0,
        desconto = 0,
        acrescimos = 0,
        valor_restante = 0,
        valor_troco = 0
      } = req.body;

      // Validações obrigatórias
      if (!atendimento_id || !caixa_id || !usuario_id) {
        return res.status(400).json({
          success: false,
          message: 'Atendimento ID, Caixa ID e Usuário ID são obrigatórios'
        });
      }

      // Gerar código sequencial por caixa (DESABILITADO POR ENQUANTO)
      // const ultimoPedido = await db.query(
      //   'SELECT codigo FROM pedidos WHERE caixa_id = $1 ORDER BY id DESC LIMIT 1',
      //   [caixa_id]
      // );
      
      // let proximoCodigo = '01';
      // if (ultimoPedido.rows.length > 0) {
      //   const ultimoCodigo = ultimoPedido.rows[0].codigo;
      //   const numeroAtual = parseInt(ultimoCodigo);
      //   proximoCodigo = String(numeroAtual + 1).padStart(2, '0');
      // }
      
      const proximoCodigo = null; // Código desabilitado por enquanto

      // Criar novo pedido
      const novoPedido = await db.query(
        `INSERT INTO pedidos (
          atendimento_id, cliente_id, caixa_id, usuario_id, pagamento_id, canal, 
          codigo, situacao, valor_total, valor_pago, desconto, 
          acrescimos, valor_restante, valor_troco
        ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [
          atendimento_id, cliente_id, caixa_id, usuario_id, pagamento_id, canal,
          proximoCodigo, situacao, valor_total, valor_pago, desconto,
          acrescimos, valor_restante, valor_troco
        ]
      );

      console.log('✅ Pedido criado:', novoPedido.rows[0]);

      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: novoPedido.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar pedidos por atendimento (GET /pedidos/atendimento/:atendimento_id)
  async getByAtendimento(req, res) {
    try {
      const { atendimento_id } = req.params;

      // Buscar o pedido mais recente (aberto) do atendimento
      const pedido = await db.query(
        'SELECT * FROM pedidos WHERE atendimento_id = $1 AND situacao = $2 ORDER BY criado_em DESC LIMIT 1',
        [atendimento_id, 'aberto']
      );

      res.status(200).json({
        success: true,
        message: 'Pedido encontrado com sucesso',
        data: {
          pedido: pedido.rows[0] || null
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar pedido (PUT /pedidos/:id)
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Construir query dinamicamente baseada nos campos fornecidos
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar'
        });
      }

      values.push(id); // ID como último parâmetro

      const pedidoAtualizado = await db.query(
        `UPDATE pedidos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (pedidoAtualizado.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pedido atualizado com sucesso',
        data: pedidoAtualizado.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Deletar pedido (DELETE /pedidos/:id)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const pedidoExcluido = await db.query(
        'DELETE FROM pedidos WHERE id = $1 RETURNING *',
        [id]
      );

      if (pedidoExcluido.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pedido excluído com sucesso',
        data: pedidoExcluido.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao excluir pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Deletar pedidos por atendimento_id (DELETE /pedidos/atendimento/:atendimento_id)
  async deleteByAtendimento(req, res) {
    try {
      const { atendimento_id } = req.params;

      const pedidosExcluidos = await db.query(
        'DELETE FROM pedidos WHERE atendimento_id = $1 RETURNING *',
        [atendimento_id]
      );

      res.status(200).json({
        success: true,
        message: `${pedidosExcluidos.rows.length} pedido(s) excluído(s) com sucesso`,
        data: {
          pedidosExcluidos: pedidosExcluidos.rows,
          quantidade: pedidosExcluidos.rows.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao excluir pedidos por atendimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Garantir ou criar pedido para atendimento (POST /pedidos/ensure)
  async ensurePedido(req, res) {
    try {
      const { 
        atendimento_id, 
        cliente_id = 16, 
        caixa_id, 
        usuario_id, 
        pagamento_id = 23, 
        canal = 'PDV',
        situacao = 'aberto'
      } = req.body;

      // Validações obrigatórias
      if (!atendimento_id || !caixa_id || !usuario_id) {
        return res.status(400).json({
          success: false,
          message: 'Atendimento ID, Caixa ID e Usuário ID são obrigatórios'
        });
      }

      console.log(`🔍 Verificando pedido para atendimento: ${atendimento_id}`);

      // Buscar pedido existente com status 'aberto' ou 'pendente'
      const pedidoExistente = await db.query(
        `SELECT * FROM pedidos 
         WHERE atendimento_id = $1 
         AND situacao IN ('aberto', 'pendente') 
         ORDER BY criado_em DESC 
         LIMIT 1`,
        [atendimento_id]
      );

      if (pedidoExistente.rows.length > 0) {
        console.log(`✅ Pedido existente encontrado: ${pedidoExistente.rows[0].id}`);
        return res.status(200).json({
          success: true,
          message: 'Pedido já existe',
          data: pedidoExistente.rows[0]
        });
      }

      // Gerar código sequencial por caixa
      const ultimoPedido = await db.query(
        'SELECT codigo FROM pedidos WHERE caixa_id = $1 ORDER BY id DESC LIMIT 1',
        [caixa_id]
      );
      
      let proximoCodigo = '01';
      if (ultimoPedido.rows.length > 0 && ultimoPedido.rows[0].codigo) {
        const ultimoCodigo = ultimoPedido.rows[0].codigo;
        const numeroAtual = parseInt(ultimoCodigo);
        proximoCodigo = String(numeroAtual + 1).padStart(2, '0');
      }

      console.log(`📋 Criando novo pedido com código: ${proximoCodigo}`);

      // Criar novo pedido
      const novoPedido = await db.query(
        `INSERT INTO pedidos (
          atendimento_id, cliente_id, caixa_id, usuario_id, pagamento_id, canal, 
          codigo, situacao, valor_total, valor_pago, desconto, 
          acrescimos, valor_restante, valor_troco
        ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [
          atendimento_id, cliente_id, caixa_id, usuario_id, pagamento_id, canal,
          proximoCodigo, situacao, 0, 0, 0, 0, 0, 0
        ]
      );

      console.log('✅ Pedido criado:', novoPedido.rows[0]);

      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: novoPedido.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao garantir/criar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar pedido aberto com itens (GET /pedidos/atendimento/:atendimento_id/aberto)
  async getPedidoAbertoComItens(req, res) {
    try {
      const { atendimento_id } = req.params;

      console.log(`🔍 Buscando pedido aberto para atendimento: ${atendimento_id}`);

      // Buscar pedido aberto
      const pedido = await db.query(
        `SELECT * FROM pedidos 
         WHERE atendimento_id = $1 
         AND situacao IN ('aberto', 'pendente') 
         ORDER BY criado_em DESC 
         LIMIT 1`,
        [atendimento_id]
      );

      if (pedido.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum pedido aberto encontrado',
          data: {
            pedido: null,
            itens: []
          }
        });
      }

      const pedidoData = pedido.rows[0];

      // Buscar itens do pedido
      const itens = await db.query(
        `SELECT ip.*, p.nome as produto_nome, p.preco as produto_preco
         FROM itens_pedido ip
         LEFT JOIN produtos p ON ip.produto_id = p.id
         WHERE ip.pedido_id = $1
         ORDER BY ip.id ASC`,
        [pedidoData.id]
      );

      console.log(`📦 Pedido encontrado: ${pedidoData.id} com ${itens.rows.length} itens`);

      res.status(200).json({
        success: true,
        message: 'Pedido aberto encontrado',
        data: {
          pedido: pedidoData,
          itens: itens.rows
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar pedido aberto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PedidosController();
