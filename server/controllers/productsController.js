import pool from '../config/db.js';

// Criar produto
export const createProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      estabelecimento_id,
      categoria_id,
      nome,
      valor_venda,
      valor_custo,
      imagem_url,
      estoque_qtd,
      tempo_preparo_min
    } = req.body;

    // Validações obrigatórias
    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    if (!categoria_id) {
      return res.status(400).json({
        success: false,
        message: 'Categoria ID é obrigatório'
      });
    }

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome do produto é obrigatório'
      });
    }

    if (!valor_venda) {
      return res.status(400).json({
        success: false,
        message: 'Valor de venda é obrigatório'
      });
    }

    // Verificar se a categoria existe
    const categoriaQuery = 'SELECT id, nome FROM categorias WHERE id = $1 AND estabelecimento_id = $2';
    const categoriaResult = await client.query(categoriaQuery, [categoria_id, estabelecimento_id]);
    
    if (categoriaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Inserir produto no banco
    const insertQuery = `
      INSERT INTO produtos (
        estabelecimento_id, categoria_id, nome, valor_venda, valor_custo,
        imagem_url, estoque_qtd, tempo_preparo_min, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING id, nome, valor_venda, valor_custo, imagem_url, 
                estoque_qtd, tempo_preparo_min, status, criado_em
    `;

    const values = [
      estabelecimento_id,
      categoria_id,
      nome,
      valor_venda,
      valor_custo || null,
      imagem_url || null,
      estoque_qtd || 0,
      tempo_preparo_min || null
    ];

    const result = await client.query(insertQuery, values);
    const produto = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: {
        produto
      }
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Buscar produtos de um estabelecimento
export const getProducts = async (req, res) => {
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
      SELECT 
        p.id, p.nome, p.descricao, p.valor_venda, p.valor_custo, p.imagem_url, 
        p.estoque_qtd, p.tempo_preparo_min, p.habilita_estoque, p.habilita_tempo_preparo,
        p.status, p.criado_em,
        c.nome as categoria_nome, c.id as categoria_id
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.estabelecimento_id = $1
      ORDER BY p.status DESC, p.criado_em DESC
    `;

    const result = await client.query(query, [estabelecimento_id]);

    res.status(200).json({
      success: true,
      message: 'Produtos recuperados com sucesso!',
      data: {
        produtos: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Buscar categorias para dropdown
export const getCategoriesForDropdown = async (req, res) => {
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
      SELECT id, nome 
      FROM categorias 
      WHERE estabelecimento_id = $1 AND status = true
      ORDER BY nome ASC
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

// Atualizar produto
export const updateProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      categoria_id,
      nome,
      valor_venda,
      valor_custo,
      imagem_url,
      estoque_qtd,
      tempo_preparo_min
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome do produto é obrigatório'
      });
    }

    if (!valor_venda) {
      return res.status(400).json({
        success: false,
        message: 'Valor de venda é obrigatório'
      });
    }

    // Verificar se o produto existe
    const produtoQuery = 'SELECT id, nome FROM produtos WHERE id = $1';
    const produtoResult = await client.query(produtoQuery, [id]);
    
    if (produtoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Atualizar o produto
    const updateQuery = `
      UPDATE produtos 
      SET 
        categoria_id = $1,
        nome = $2,
        valor_venda = $3,
        valor_custo = $4,
        imagem_url = $5,
        estoque_qtd = $6,
        tempo_preparo_min = $7
      WHERE id = $8
      RETURNING id, nome, valor_venda, valor_custo, imagem_url, 
                estoque_qtd, tempo_preparo_min, status, criado_em
    `;

    const values = [
      categoria_id,
      nome,
      valor_venda,
      valor_custo || null,
      imagem_url || null,
      estoque_qtd || 0,
      tempo_preparo_min || null,
      id
    ];

    const result = await client.query(updateQuery, values);
    const produtoAtualizado = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: {
        produto: produtoAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Alterar status do produto
export const toggleProductStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    // Verificar se o produto existe
    const produtoQuery = 'SELECT id, nome, status FROM produtos WHERE id = $1';
    const produtoResult = await client.query(produtoQuery, [id]);
    
    if (produtoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const produto = produtoResult.rows[0];
    const novoStatus = !produto.status;

    // Alterar o status do produto
    const updateQuery = `
      UPDATE produtos 
      SET status = $1
      WHERE id = $2
      RETURNING id, nome, status
    `;

    const result = await client.query(updateQuery, [novoStatus, id]);
    const produtoAtualizado = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Produto ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
      data: {
        produto: produtoAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Excluir produto
export const deleteProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    // Verificar se o produto existe
    const produtoQuery = 'SELECT id, nome FROM produtos WHERE id = $1';
    const produtoResult = await client.query(produtoQuery, [id]);
    
    if (produtoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const produto = produtoResult.rows[0];

    // Excluir o produto do banco de dados (hard delete)
    const deleteQuery = 'DELETE FROM produtos WHERE id = $1';

    await client.query(deleteQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Produto excluído com sucesso!',
      data: {
        produto: {
          id: produto.id,
          nome: produto.nome
        }
      }
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};
