import pool from '../config/db.js';

// POST - Adicionar movimentação de caixa (entrada ou saída)
export const adicionarMovimentacao = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { caixa_id, tipo, descricao, valor, usuario_id } = req.body;

    // Validações obrigatórias
    if (!caixa_id || !tipo || !descricao || !valor || !usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validar tipo
    if (!['entrada', 'saida'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "entrada" ou "saida"'
      });
    }

    // Validar valor
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser um número maior que zero'
      });
    }

    console.log('💰 Adicionando movimentação:', { caixa_id, tipo, descricao, valor: valorNumerico, usuario_id });

    // Iniciar transação
    await client.query('BEGIN');

    try {
      // 1. Inserir movimentação na tabela movimentacoes_caixa
      const movimentacaoQuery = `
        INSERT INTO movimentacoes_caixa (caixa_id, tipo, descricao, valor, usuario_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const movimentacaoResult = await client.query(movimentacaoQuery, [
        caixa_id,
        tipo,
        descricao,
        valorNumerico,
        usuario_id
      ]);

      console.log('✅ Movimentação inserida:', movimentacaoResult.rows[0]);

      // 2. Atualizar total na tabela caixas
      const campoAtualizar = tipo === 'entrada' ? 'entradas' : 'saidas';
      const updateCaixaQuery = `
        UPDATE caixas 
        SET ${campoAtualizar} = ${campoAtualizar} + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const caixaResult = await client.query(updateCaixaQuery, [valorNumerico, caixa_id]);
      
      if (caixaResult.rows.length === 0) {
        throw new Error('Caixa não encontrado');
      }

      console.log('✅ Caixa atualizado:', caixaResult.rows[0]);

      // 3. Confirmar transação
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} adicionada com sucesso!`,
        data: {
          movimentacao: movimentacaoResult.rows[0],
          caixa: caixaResult.rows[0]
        }
      });

    } catch (error) {
      // Reverter transação em caso de erro
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao adicionar movimentação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// GET - Listar movimentações de caixa por estabelecimento
export const getMovimentacoesCaixa = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { estabelecimento_id } = req.params;

    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    // Buscar caixa aberto do estabelecimento
    const caixaQuery = `
      SELECT id FROM caixas 
      WHERE estabelecimento_id = $1 AND status = true
      ORDER BY data_abertura DESC 
      LIMIT 1
    `;
    
    const caixaResult = await client.query(caixaQuery, [estabelecimento_id]);
    
    if (caixaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum caixa aberto encontrado para este estabelecimento'
      });
    }
    
    const caixaId = caixaResult.rows[0].id;
    console.log('📦 Caixa aberto encontrado:', caixaId);

    // Buscar movimentações do caixa aberto
    const movimentacoesQuery = `
      SELECT 
        mc.*,
        u.nome_completo as usuario_nome
      FROM movimentacoes_caixa mc
      LEFT JOIN usuarios u ON mc.usuario_id = u.id
      WHERE mc.caixa_id = $1
      ORDER BY mc.criado_em DESC
    `;

    const movimentacoesResult = await client.query(movimentacoesQuery, [caixaId]);
    
    console.log('📊 Movimentações encontradas:', movimentacoesResult.rows.length);

    res.status(200).json({
      success: true,
      message: 'Movimentações recuperadas com sucesso!',
      data: {
        movimentacoes: movimentacoesResult.rows,
        caixa_id: caixaId
      }
    });

  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};