import pool from '../config/db.js';

export const createCategory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      estabelecimento_id,
      nome,
      imagem_url
    } = req.body;

    // Validações obrigatórias
    if (!estabelecimento_id || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID e nome são obrigatórios'
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

    // Verificar se já existe uma categoria com o mesmo nome para o estabelecimento
    const categoriaExistenteQuery = `
      SELECT id FROM categorias 
      WHERE estabelecimento_id = $1 AND nome = $2 AND status = true
    `;
    const categoriaExistenteResult = await client.query(categoriaExistenteQuery, [estabelecimento_id, nome]);
    
    if (categoriaExistenteResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com este nome para este estabelecimento'
      });
    }

    // Inserir nova categoria
    const insertQuery = `
      INSERT INTO categorias (
        estabelecimento_id, 
        nome, 
        imagem_url, 
        status, 
        criado_em
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, nome, imagem_url, status, criado_em
    `;

    const values = [
      estabelecimento_id,
      nome,
      imagem_url || null,
      true // status sempre true para novas categorias
    ];

    const result = await client.query(insertQuery, values);
    const novaCategoria = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso!',
      data: {
        categoria: {
          id: novaCategoria.id,
          nome: novaCategoria.nome,
          imagem_url: novaCategoria.imagem_url,
          status: novaCategoria.status,
          criado_em: novaCategoria.criado_em
        }
      }
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export const getCategories = async (req, res) => {
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
      SELECT id, nome, imagem_url, status, criado_em
      FROM categorias 
      WHERE estabelecimento_id = $1
      ORDER BY status DESC, criado_em DESC
    `;

    const result = await client.query(query, [estabelecimento_id]);

    res.status(200).json({
      success: true,
      message: 'Categorias recuperadas com sucesso!',
      data: {
        categorias: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export const updateCategory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      nome,
      imagem_url
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da categoria é obrigatório'
      });
    }

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    // Verificar se a categoria existe
    const categoriaQuery = 'SELECT id, nome FROM categorias WHERE id = $1';
    const categoriaResult = await client.query(categoriaQuery, [id]);
    
    if (categoriaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Atualizar a categoria
    const updateQuery = `
      UPDATE categorias 
      SET 
        nome = $1,
        imagem_url = $2
      WHERE id = $3
      RETURNING id, nome, imagem_url, status, criado_em
    `;

    const values = [
      nome,
      imagem_url || null,
      id
    ];

    const result = await client.query(updateQuery, values);
    const categoriaAtualizada = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Categoria atualizada com sucesso!',
      data: {
        categoria: categoriaAtualizada
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export const toggleCategoryStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da categoria é obrigatório'
      });
    }

    // Verificar se a categoria existe
    const categoriaQuery = 'SELECT id, nome, status FROM categorias WHERE id = $1';
    const categoriaResult = await client.query(categoriaQuery, [id]);
    
    if (categoriaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const categoria = categoriaResult.rows[0];
    const novoStatus = !categoria.status;

    // Alterar o status da categoria
    const updateQuery = `
      UPDATE categorias 
      SET status = $1
      WHERE id = $2
      RETURNING id, nome, status
    `;

    const result = await client.query(updateQuery, [novoStatus, id]);
    const categoriaAtualizada = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Categoria ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`,
      data: {
        categoria: categoriaAtualizada
      }
    });

  } catch (error) {
    console.error('Erro ao alterar status da categoria:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export const deleteCategory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da categoria é obrigatório'
      });
    }

    // Verificar se a categoria existe
    const categoriaQuery = 'SELECT id, nome FROM categorias WHERE id = $1';
    const categoriaResult = await client.query(categoriaQuery, [id]);
    
    if (categoriaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const categoria = categoriaResult.rows[0];

    // Excluir a categoria do banco de dados (hard delete)
    const deleteQuery = 'DELETE FROM categorias WHERE id = $1';

    await client.query(deleteQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Categoria excluída com sucesso!',
      data: {
        categoria: {
          id: categoria.id,
          nome: categoria.nome
        }
      }
    });

  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};