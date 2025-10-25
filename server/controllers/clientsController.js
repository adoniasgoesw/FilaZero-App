import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Criar cliente
const createClient = async (req, res) => {
  try {
    const { estabelecimento_id, nome, cpf_cnpj, endereco, whatsapp, email } = req.body;

    // Validações básicas
    if (!estabelecimento_id || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID e nome são obrigatórios'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await pool.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimento_id]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Inserir cliente (remover formatação do CPF/CNPJ e WhatsApp)
    const cpfCnpjClean = cpf_cnpj ? cpf_cnpj.replace(/\D/g, '') : null;
    const whatsappClean = whatsapp ? whatsapp.replace(/\D/g, '') : null;
    const result = await pool.query(
      `INSERT INTO clientes (estabelecimento_id, nome, cpf_cnpj, endereco, whatsapp, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [estabelecimento_id, nome, cpfCnpjClean, endereco || null, whatsappClean, email || null]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: {
        cliente: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar clientes
const getClients = async (req, res) => {
  try {
    const { estabelecimentoId } = req.params;

    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    const result = await pool.query(
      `SELECT id, nome, cpf_cnpj, endereco, whatsapp, email, status, criado_em
       FROM clientes 
       WHERE estabelecimento_id = $1 
       ORDER BY criado_em DESC`,
      [estabelecimentoId]
    );

    res.json({
      success: true,
      data: {
        clientes: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, endereco, whatsapp, email, status } = req.body;

    // Verificar se o cliente existe
    const clientCheck = await pool.query(
      'SELECT id FROM clientes WHERE id = $1',
      [id]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Atualizar cliente (remover formatação do CPF/CNPJ e WhatsApp)
    const cpfCnpjClean = cpf_cnpj ? cpf_cnpj.replace(/\D/g, '') : cpf_cnpj;
    const whatsappClean = whatsapp ? whatsapp.replace(/\D/g, '') : whatsapp;
    const result = await pool.query(
      `UPDATE clientes 
       SET nome = COALESCE($1, nome),
           cpf_cnpj = COALESCE($2, cpf_cnpj),
           endereco = COALESCE($3, endereco),
           whatsapp = COALESCE($4, whatsapp),
           email = COALESCE($5, email),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [nome, cpfCnpjClean, endereco, whatsappClean, email, status, id]
    );

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: {
        cliente: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar cliente
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cliente existe
    const clientCheck = await pool.query(
      'SELECT id FROM clientes WHERE id = $1',
      [id]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Deletar cliente
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export {
  createClient,
  getClients,
  updateClient,
  deleteClient
};

