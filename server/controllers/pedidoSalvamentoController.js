import db from '../config/db.js';

class PedidoSalvamentoController {
  // Fluxo completo de salvamento de pedido (POST /pedido-salvamento/save)
  async savePedidoCompleto(req, res) {
    try {
      const { 
        atendimento_id, 
        itens, 
        cliente_id = 16, 
        caixa_id, 
        usuario_id, 
        pagamento_id = 23, 
        canal = 'PDV' 
      } = req.body;

      // Validações obrigatórias
      if (!atendimento_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Atendimento ID e lista de itens são obrigatórios'
        });
      }

      if (!caixa_id || !usuario_id) {
        return res.status(400).json({
          success: false,
          message: 'Caixa ID e Usuário ID são obrigatórios'
        });
      }

      console.log(`💾 Iniciando salvamento completo para atendimento: ${atendimento_id}`);
      console.log(`📦 Itens a salvar: ${itens.length}`);

      // ✅ PASSO 1: Garantir ou criar o Pedido vinculado ao Atendimento
      console.log('🔄 PASSO 1: Garantindo pedido...');
      
      let pedido;
      
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
        pedido = pedidoExistente.rows[0];
        console.log(`✅ Pedido existente encontrado: ${pedido.id}`);
      } else {
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
            proximoCodigo, 'aberto', 0, 0, 0, 0, 0, 0
          ]
        );

        pedido = novoPedido.rows[0];
        console.log(`✅ Novo pedido criado: ${pedido.id}`);
      }

      // ✅ PASSO 2: Salvar os ITENS do pedido
      console.log('🔄 PASSO 2: Salvando itens...');
      
      // Primeiro, excluir todos os itens existentes do pedido para evitar duplicação
      await db.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [pedido.id]);
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
          [pedido.id, item.produto_id, item.quantidade, item.valor_unitario, item.descricao]
        );
        itensInseridos.push(novoItem.rows[0]);
      }

      console.log(`✅ ${itensInseridos.length} itens salvos`);

      // ✅ PASSO 3: Atualizar valores totais do pedido
      console.log('🔄 PASSO 3: Atualizando valores totais...');
      
      const pedidoAtualizado = await db.query(
        'UPDATE pedidos SET valor_total = $1 WHERE id = $2 RETURNING *',
        [valorTotalCalculado, pedido.id]
      );

      console.log(`💰 Valor total do pedido atualizado: R$ ${valorTotalCalculado.toFixed(2)}`);

      // ✅ PASSO 4: Atualizar o status do atendimento para ocupada
      console.log('🔄 PASSO 4: Atualizando status do atendimento...');
      
      const atendimentoAtualizado = await db.query(
        'UPDATE atendimentos SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['ocupada', atendimento_id]
      );

      console.log(`✅ Atendimento ${atendimento_id} atualizado para status: ocupada`);

      // Resposta final
      res.status(200).json({
        success: true,
        message: 'Pedido salvo com sucesso',
        data: {
          pedido: pedidoAtualizado.rows[0],
          atendimento: atendimentoAtualizado.rows[0],
          itens: itensInseridos,
          valor_total: valorTotalCalculado,
          quantidade_itens: itensInseridos.length,
          codigo_pedido: pedido.codigo
        }
      });

    } catch (error) {
      console.error('❌ Erro no salvamento completo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Carregar pedido aberto com itens (GET /pedido-salvamento/atendimento/:atendimento_id)
  async loadPedidoAberto(req, res) {
    try {
      const { atendimento_id } = req.params;

      console.log(`🔍 Carregando pedido aberto para atendimento: ${atendimento_id}`);

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
        message: 'Pedido aberto carregado com sucesso',
        data: {
          pedido: pedidoData,
          itens: itens.rows
        }
      });

    } catch (error) {
      console.error('❌ Erro ao carregar pedido aberto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PedidoSalvamentoController();





