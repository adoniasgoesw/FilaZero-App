import pool from '../config/db.js';

// Criar complemento
export const createComplement = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      estabelecimento_id,
      nome,
      valor_venda,
      valor_custo
    } = req.body;

    // Validações obrigatórias
    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome do complemento é obrigatório'
      });
    }

    if (!valor_venda || valor_venda <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor de venda deve ser maior que zero'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoQuery = 'SELECT id FROM estabelecimentos WHERE id = $1 AND status = true';
    const estabelecimentoResult = await client.query(estabelecimentoQuery, [estabelecimento_id]);
    
    if (estabelecimentoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Verificar se já existe um complemento com o mesmo nome para o estabelecimento
    const complementoExistenteQuery = `
      SELECT id FROM complementos 
      WHERE estabelecimento_id = $1 AND nome = $2 AND status = true
    `;
    const complementoExistenteResult = await client.query(complementoExistenteQuery, [estabelecimento_id, nome]);
    
    if (complementoExistenteResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um complemento com este nome para este estabelecimento'
      });
    }

    // Inserir complemento no banco
    const insertQuery = `
      INSERT INTO complementos (
        estabelecimento_id, 
        nome, 
        valor_venda, 
        valor_custo, 
        status, 
        criado_em
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, nome, valor_venda, valor_custo, status, criado_em
    `;

    const values = [
      estabelecimento_id,
      nome,
      valor_venda,
      valor_custo || null,
      true // status sempre true para novos complementos
    ];

    const result = await client.query(insertQuery, values);
    const complemento = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Complemento criado com sucesso!',
      data: {
        complemento: {
          id: complemento.id,
          nome: complemento.nome,
          valor_venda: complemento.valor_venda,
          valor_custo: complemento.valor_custo,
          status: complemento.status,
          criado_em: complemento.criado_em
        }
      }
    });

  } catch (error) {
    console.error('Erro ao criar complemento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Buscar complementos
export const getComplements = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { estabelecimento_id } = req.params;

    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    const query = `
      SELECT id, nome, valor_venda, valor_custo, status, criado_em
      FROM complementos 
      WHERE estabelecimento_id = $1
      ORDER BY status DESC, criado_em DESC
    `;

    const result = await client.query(query, [estabelecimento_id]);

    res.status(200).json({
      success: true,
      message: 'Complementos recuperados com sucesso!',
      data: {
        complementos: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar complementos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Atualizar complemento
export const updateComplement = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      nome,
      valor_venda,
      valor_custo
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do complemento é obrigatório'
      });
    }

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome do complemento é obrigatório'
      });
    }

    if (!valor_venda || valor_venda <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor de venda deve ser maior que zero'
      });
    }

    // Verificar se o complemento existe
    const complementoQuery = 'SELECT id, nome FROM complementos WHERE id = $1';
    const complementoResult = await client.query(complementoQuery, [id]);
    
    if (complementoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    // Atualizar o complemento
    const updateQuery = `
      UPDATE complementos 
      SET 
        nome = $1,
        valor_venda = $2,
        valor_custo = $3
      WHERE id = $4
      RETURNING id, nome, valor_venda, valor_custo, status, criado_em
    `;

    const values = [
      nome,
      valor_venda,
      valor_custo || null,
      id
    ];

    const result = await client.query(updateQuery, values);
    const complementoAtualizado = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Complemento atualizado com sucesso!',
      data: {
        complemento: complementoAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar complemento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Alternar status do complemento
export const toggleComplementStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do complemento é obrigatório'
      });
    }

    // Verificar se o complemento existe
    const complementoQuery = 'SELECT id, nome, status FROM complementos WHERE id = $1';
    const complementoResult = await client.query(complementoQuery, [id]);
    
    if (complementoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    const complemento = complementoResult.rows[0];
    const novoStatus = !complemento.status;

    // Alterar o status do complemento
    const updateQuery = `
      UPDATE complementos 
      SET status = $1
      WHERE id = $2
      RETURNING id, nome, status
    `;

    const result = await client.query(updateQuery, [novoStatus, id]);
    const complementoAtualizado = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Complemento ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
      data: {
        complemento: complementoAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao alterar status do complemento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Excluir complemento
export const deleteComplement = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do complemento é obrigatório'
      });
    }

    // Verificar se o complemento existe
    const complementoQuery = 'SELECT id, nome FROM complementos WHERE id = $1';
    const complementoResult = await client.query(complementoQuery, [id]);
    
    if (complementoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    const complemento = complementoResult.rows[0];

    // Excluir o complemento do banco de dados (hard delete)
    const deleteQuery = 'DELETE FROM complementos WHERE id = $1';

    await client.query(deleteQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Complemento excluído com sucesso!',
      data: {
        complemento: {
          id: complemento.id,
          nome: complemento.nome
        }
      }
    });

  } catch (error) {
    console.error('Erro ao excluir complemento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};




