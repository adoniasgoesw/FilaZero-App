import db from '../config/db.js';

class ItensPedidoController {
  // Criar itens do pedido (POST /itens-pedido)
  async create(req, res) {
    try {
      const { pedido_id, itens, valor_total, nome_pedido } = req.body;

      // Validações obrigatórias
      if (!pedido_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pedido ID e lista de itens são obrigatórios'
        });
      }

      // Primeiro, excluir todos os itens existentes do pedido para evitar duplicação
      await db.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [pedido_id]);
      console.log('🗑️ Itens anteriores excluídos para evitar duplicação');

      // Agrupar itens por produto_id para evitar duplicação
      const itensAgrupados = {};
      let valorTotalCalculado = 0;
      
      itens.forEach(item => {
        const { produto_id, quantidade, valor_unitario, descricao = null } = item;
        const valorItem = quantidade * valor_unitario;
        valorTotalCalculado += valorItem;
        
        if (itensAgrupados[produto_id]) {
          // Se o produto já existe, somar a quantidade
          itensAgrupados[produto_id].quantidade += quantidade;
        } else {
          // Se é um produto novo, adicionar
          itensAgrupados[produto_id] = {
            produto_id,
            quantidade,
            valor_unitario,
            descricao
          };
        }
      });

      // Converter para array e inserir no banco
      const itensParaInserir = Object.values(itensAgrupados);
      const itensInseridos = [];

      for (const item of itensParaInserir) {
        const novoItem = await db.query(
          `INSERT INTO itens_pedido (
            pedido_id, produto_id, quantidade, valor_unitario, 
            status, descricao
          ) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            pedido_id,
            item.produto_id,
            item.quantidade,
            item.valor_unitario,
            'pendente',
            item.descricao
          ]
        );

        itensInseridos.push(novoItem.rows[0]);
      }

      // Buscar informações do pedido para gerar código sequencial
      const pedidoInfo = await db.query(
        'SELECT caixa_id FROM pedidos WHERE id = $1',
        [pedido_id]
      );

      if (pedidoInfo.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const caixaId = pedidoInfo.rows[0].caixa_id;

      // Gerar código sequencial para o caixa
      const ultimoCodigo = await db.query(
        `SELECT codigo FROM pedidos 
         WHERE caixa_id = $1 AND codigo IS NOT NULL 
         ORDER BY codigo DESC LIMIT 1`,
        [caixaId]
      );

      let proximoCodigo;
      if (ultimoCodigo.rows.length === 0) {
        proximoCodigo = '01';
      } else {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo);
        proximoCodigo = String(ultimoNumero + 1).padStart(2, '0');
      }

      // Atualizar pedido com valor total e código
      console.log('🔄 Atualizando pedido:', {
        pedido_id,
        valorTotalCalculado,
        proximoCodigo
      });
      
      const pedidoAtualizado = await db.query(
        `UPDATE pedidos 
         SET valor_total = $1, codigo = $2 
         WHERE id = $3 
         RETURNING *`,
        [valorTotalCalculado, proximoCodigo, pedido_id]
      );
      
      console.log('✅ Pedido atualizado:', pedidoAtualizado.rows[0]);

      // Se nome do pedido foi fornecido, atualizar atendimento
      if (nome_pedido && nome_pedido.trim() !== '') {
        const atendimentoInfo = await db.query(
          'SELECT atendimento_id FROM pedidos WHERE id = $1',
          [pedido_id]
        );

        if (atendimentoInfo.rows.length > 0) {
          await db.query(
            'UPDATE atendimentos SET nome_ponto = $1 WHERE id = $2',
            [nome_pedido.trim(), atendimentoInfo.rows[0].atendimento_id]
          );
          console.log('✅ Nome do pedido salvo:', nome_pedido);
        }
      }

      console.log('✅ Itens do pedido criados:', itensInseridos.length);
      console.log('✅ Valor total calculado:', valorTotalCalculado);
      console.log('✅ Código sequencial gerado:', proximoCodigo);

      res.status(201).json({
        success: true,
        message: `${itensInseridos.length} item(ns) do pedido criado(s) com sucesso`,
        data: {
          itens: itensInseridos,
          quantidade: itensInseridos.length,
          valor_total: valorTotalCalculado,
          codigo: proximoCodigo,
          pedido: pedidoAtualizado.rows[0]
        }
      });

    } catch (error) {
      console.error('❌ Erro ao criar itens do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar itens por pedido (GET /itens-pedido/pedido/:pedido_id)
  async getByPedido(req, res) {
    try {
      const { pedido_id } = req.params;

      const itens = await db.query(
        `SELECT 
          ip.*,
          p.nome as produto_nome,
          p.descricao as produto_descricao
         FROM itens_pedido ip
         LEFT JOIN produtos p ON ip.produto_id = p.id
         WHERE ip.pedido_id = $1 
         ORDER BY ip.id ASC`,
        [pedido_id]
      );

      res.status(200).json({
        success: true,
        message: 'Itens do pedido listados com sucesso',
        data: {
          itens: itens.rows
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar itens do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar item do pedido (PUT /itens-pedido/:id)
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

      const itemAtualizado = await db.query(
        `UPDATE itens_pedido SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (itemAtualizado.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item do pedido não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item do pedido atualizado com sucesso',
        data: itemAtualizado.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar item do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Deletar item do pedido (DELETE /itens-pedido/:id)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const itemExcluido = await db.query(
        'DELETE FROM itens_pedido WHERE id = $1 RETURNING *',
        [id]
      );

      if (itemExcluido.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item do pedido não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item do pedido excluído com sucesso',
        data: itemExcluido.rows[0]
      });

    } catch (error) {
      console.error('❌ Erro ao excluir item do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Deletar todos os itens de um pedido (DELETE /itens-pedido/pedido/:pedido_id)
  async deleteByPedido(req, res) {
    try {
      const { pedido_id } = req.params;

      const itensExcluidos = await db.query(
        'DELETE FROM itens_pedido WHERE pedido_id = $1 RETURNING *',
        [pedido_id]
      );

      res.status(200).json({
        success: true,
        message: `${itensExcluidos.rows.length} item(ns) do pedido excluído(s) com sucesso`,
        data: {
          itensExcluidos: itensExcluidos.rows,
          quantidade: itensExcluidos.rows.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao excluir itens do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Salvar itens e atualizar valor total do pedido (POST /itens-pedido/save-and-update)
  async saveAndUpdatePedido(req, res) {
    try {
      const { pedido_id, itens } = req.body;

      // Validações obrigatórias
      if (!pedido_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pedido ID e lista de itens são obrigatórios'
        });
      }

      console.log(`💾 Salvando ${itens.length} itens para pedido ${pedido_id}`);

      // Primeiro, excluir todos os itens existentes do pedido para evitar duplicação
      await db.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [pedido_id]);
      console.log('🗑️ Itens anteriores excluídos');

      // Agrupar itens por produto_id para evitar duplicação
      const itensAgrupados = {};
      let valorTotalCalculado = 0;
      
      itens.forEach(item => {
        const { produto_id, quantidade, valor_unitario, descricao = null } = item;
        const valorItem = quantidade * valor_unitario;
        valorTotalCalculado += valorItem;
        
        if (itensAgrupados[produto_id]) {
          // Se o produto já existe, somar a quantidade
          itensAgrupados[produto_id].quantidade += quantidade;
        } else {
          // Se é um produto novo, adicionar
          itensAgrupados[produto_id] = {
            produto_id,
            quantidade,
            valor_unitario,
            descricao
          };
        }
      });

      // Converter para array e inserir no banco
      const itensParaInserir = Object.values(itensAgrupados);
      const itensInseridos = [];

      for (const item of itensParaInserir) {
        const novoItem = await db.query(
          `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, valor_unitario, descricao) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [pedido_id, item.produto_id, item.quantidade, item.valor_unitario, item.descricao]
        );
        itensInseridos.push(novoItem.rows[0]);
      }

      console.log(`✅ ${itensInseridos.length} itens salvos`);

      // Atualizar valor total do pedido
      const pedidoAtualizado = await db.query(
        'UPDATE pedidos SET valor_total = $1 WHERE id = $2 RETURNING *',
        [valorTotalCalculado, pedido_id]
      );

      console.log(`💰 Valor total do pedido atualizado: R$ ${valorTotalCalculado.toFixed(2)}`);

      // Buscar atendimento_id do pedido primeiro
      const pedidoInfo = await db.query(
        'SELECT atendimento_id FROM pedidos WHERE id = $1',
        [pedido_id]
      );

      if (pedidoInfo.rows.length === 0) {
        console.error('❌ Pedido não encontrado:', pedido_id);
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      const atendimento_id = pedidoInfo.rows[0].atendimento_id;
      console.log(`🔍 Atendimento ID encontrado: ${atendimento_id}`);

      // Atualizar status do atendimento para 'ocupado'
      const atendimentoAtualizado = await db.query(
        `UPDATE atendimentos 
         SET status = $1, atualizado_em = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        ['ocupado', atendimento_id]
      );

      if (atendimentoAtualizado.rows.length > 0) {
        console.log(`✅ Atendimento atualizado para status: ocupado (ID: ${atendimentoAtualizado.rows[0].id})`);
      } else {
        console.warn('⚠️ Nenhum atendimento foi atualizado - verificar se o atendimento existe');
      }

      res.status(200).json({
        success: true,
        message: 'Itens salvos e pedido atualizado com sucesso',
        data: {
          itens: itensInseridos,
          pedido: pedidoAtualizado.rows[0],
          atendimento: atendimentoAtualizado.rows[0],
          valor_total: valorTotalCalculado,
          quantidade_itens: itensInseridos.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao salvar itens e atualizar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new ItensPedidoController();
