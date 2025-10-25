import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Criar pagamentos padrão para um estabelecimento
const createDefaultPayments = async (estabelecimentoId) => {
  try {
    // Verificar se já existem pagamentos para este estabelecimento
    const existingPayments = await pool.query(
      'SELECT id FROM pagamentos WHERE estabelecimento_id = $1',
      [estabelecimentoId]
    );

    if (existingPayments.rows.length > 0) {
      return; // Já existem pagamentos, não criar novamente
    }

    // Pagamentos padrão
    const defaultPayments = [
      {
        tipo: 'Dinheiro',
        taxa: 0,
        conta_bancaria: null,
        status: true
      },
      {
        tipo: 'PIX',
        taxa: 0,
        conta_bancaria: null,
        status: true
      },
      {
        tipo: 'Cartão de Crédito',
        taxa: 3.5,
        conta_bancaria: null,
        status: true
      },
      {
        tipo: 'Cartão de Débito',
        taxa: 2.0,
        conta_bancaria: null,
        status: true
      }
    ];

    // Inserir pagamentos padrão
    for (const payment of defaultPayments) {
      await pool.query(
        `INSERT INTO pagamentos (estabelecimento_id, nome, tipo, taxa, conta_bancaria, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [estabelecimentoId, payment.tipo, payment.tipo, payment.taxa, payment.conta_bancaria, payment.status]
      );
    }

    console.log(`Pagamentos padrão criados para estabelecimento ${estabelecimentoId}`);
  } catch (error) {
    console.error('Erro ao criar pagamentos padrão:', error);
    throw error;
  }
};

// Buscar pagamentos por estabelecimento
const getPayments = async (req, res) => {
  try {
    const { estabelecimentoId } = req.params;

    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await pool.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimentoId]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Criar pagamentos padrão se não existirem
    await createDefaultPayments(estabelecimentoId);

    // Buscar pagamentos do estabelecimento
    const result = await pool.query(
      `SELECT 
        id,
        nome,
        tipo,
        taxa,
        conta_bancaria,
        status,
        criado_em
       FROM pagamentos 
       WHERE estabelecimento_id = $1 
       ORDER BY criado_em ASC`,
      [estabelecimentoId]
    );

    res.json({
      success: true,
      message: 'Pagamentos encontrados com sucesso',
      data: {
        pagamentos: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar pagamento
const createPayment = async (req, res) => {
  try {
    const { 
      estabelecimento_id, 
      tipo, 
      taxa, 
      conta_bancaria 
    } = req.body;

    // Validações obrigatórias
    if (!estabelecimento_id || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento e tipo são obrigatórios'
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

    // Verificar se já existe um pagamento com o mesmo tipo
    const existingPayment = await pool.query(
      'SELECT id FROM pagamentos WHERE estabelecimento_id = $1 AND tipo = $2',
      [estabelecimento_id, tipo]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um pagamento com este tipo'
      });
    }

    // Inserir pagamento
    const result = await pool.query(
      `INSERT INTO pagamentos (estabelecimento_id, nome, tipo, taxa, conta_bancaria, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        estabelecimento_id, 
        tipo, 
        tipo, 
        taxa || 0, 
        conta_bancaria || null,
        true
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      data: {
        pagamento: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar pagamento
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipo, 
      taxa, 
      conta_bancaria 
    } = req.body;

    // Buscar pagamento atual
    const paymentResult = await pool.query(
      'SELECT * FROM pagamentos WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    const currentPayment = paymentResult.rows[0];

    // Verificar se já existe outro pagamento com o mesmo tipo (se alterado)
    if (tipo && tipo !== currentPayment.tipo) {
      const existingPayment = await pool.query(
        'SELECT id FROM pagamentos WHERE estabelecimento_id = $1 AND tipo = $2 AND id != $3',
        [currentPayment.estabelecimento_id, tipo, id]
      );

      if (existingPayment.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um pagamento com este tipo'
        });
      }
    }

    // Atualizar pagamento
    const result = await pool.query(
      `UPDATE pagamentos 
       SET nome = COALESCE($1, nome),
           tipo = COALESCE($2, tipo),
           taxa = COALESCE($3, taxa),
           conta_bancaria = COALESCE($4, conta_bancaria)
       WHERE id = $5
       RETURNING *`,
      [tipo, tipo, taxa, conta_bancaria, id]
    );

    res.json({
      success: true,
      message: 'Pagamento atualizado com sucesso',
      data: {
        pagamento: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar pagamento
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar pagamento atual
    const paymentResult = await pool.query(
      'SELECT * FROM pagamentos WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    const currentPayment = paymentResult.rows[0];

    // Verificar se é um pagamento padrão (não permitir deletar)
    const defaultPayments = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito'];
    if (defaultPayments.includes(currentPayment.tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar pagamentos padrão do sistema'
      });
    }

    // Deletar pagamento
    await pool.query('DELETE FROM pagamentos WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Pagamento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Alternar status do pagamento
const togglePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar pagamento atual
    const paymentResult = await pool.query(
      'SELECT * FROM pagamentos WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    const currentPayment = paymentResult.rows[0];

    // Verificar se é um pagamento padrão (não permitir desativar)
    const defaultPayments = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito'];
    if (defaultPayments.includes(currentPayment.tipo) && currentPayment.status) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível desativar pagamentos padrão do sistema'
      });
    }

    // Alternar status
    const result = await pool.query(
      `UPDATE pagamentos 
       SET status = NOT status
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      message: `Pagamento ${result.rows[0].status ? 'ativado' : 'desativado'} com sucesso`,
      data: {
        pagamento: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao alternar status do pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export {
  createDefaultPayments,
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  togglePaymentStatus
};
