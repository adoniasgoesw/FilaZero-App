import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/filazero'
});

// GET - Buscar caixas fechadas
const getCaixasFechadas = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;
    
    const query = `
      SELECT 
        id,
        valor_abertura,
        data_abertura,
        valor_fechamento,
        data_fechamento,
        diferenca,
        total_vendas,
        saldo_total,
        aberto_por,
        fechado_por,
        criado_em
      FROM caixas 
      WHERE estabelecimento_id = $1 
        AND status = false 
        AND data_fechamento IS NOT NULL
      ORDER BY data_fechamento DESC
    `;
    
    const result = await pool.query(query, [estabelecimento_id]);
    
    res.json({
      success: true,
      data: {
        caixas: result.rows
      },
      message: 'Caixas fechadas encontradas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar caixas fechadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// GET - Buscar detalhes de um caixa específico
const getCaixaDetalhes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        valor_abertura,
        data_abertura,
        entradas,
        saidas,
        valor_fechamento,
        data_fechamento,
        diferenca,
        total_vendas,
        saldo_total,
        aberto_por,
        fechado_por,
        criado_em,
        updated_at
      FROM caixas 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caixa não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        caixa: result.rows[0]
      },
      message: 'Detalhes do caixa encontrados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes do caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// POST - Criar novo caixa (abrir caixa)
const criarCaixa = async (req, res) => {
  try {
    const { 
      estabelecimento_id, 
      valor_abertura, 
      aberto_por 
    } = req.body;
    
    const query = `
      INSERT INTO caixas (
        estabelecimento_id, 
        valor_abertura, 
        aberto_por, 
        status
      ) VALUES ($1, $2, $3, true)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      estabelecimento_id, 
      valor_abertura, 
      aberto_por
    ]);
    
    res.status(201).json({
      success: true,
      data: {
        caixa: result.rows[0]
      },
      message: 'Caixa aberto com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// PUT - Fechar caixa
const fecharCaixa = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      valor_fechamento, 
      fechado_por 
    } = req.body;
    
    // Buscar dados atuais do caixa
    const caixaAtual = await pool.query(
      'SELECT * FROM caixas WHERE id = $1',
      [id]
    );
    
    if (caixaAtual.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caixa não encontrado'
      });
    }
    
    const caixa = caixaAtual.rows[0];
    const diferenca = valor_fechamento - caixa.saldo_total;
    
    // Calcular total_vendas dos pedidos históricos
    const totalVendas = await atualizarTotalVendas(id);
    
    const query = `
      UPDATE caixas 
      SET 
        valor_fechamento = $1,
        data_fechamento = CURRENT_TIMESTAMP,
        diferenca = $2,
        status = false,
        fechado_por = $3,
        total_vendas = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      valor_fechamento,
      diferenca,
      fechado_por,
      totalVendas,
      id
    ]);
    
    console.log('💰 Caixa fechado com total_vendas:', totalVendas);
    
    res.json({
      success: true,
      data: {
        caixa: result.rows[0]
      },
      message: 'Caixa fechado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// GET - Verificar status do último caixa (aberto/fechado)
const getStatusUltimoCaixa = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;
    
    const query = `
      SELECT 
        id,
        valor_abertura,
        data_abertura,
        entradas,
        saidas,
        valor_fechamento,
        data_fechamento,
        diferenca,
        total_vendas,
        saldo_total,
        status,
        aberto_por,
        fechado_por
      FROM caixas 
      WHERE estabelecimento_id = $1 
      ORDER BY data_abertura DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [estabelecimento_id]);
    
    if (result.rows.length === 0) {
      // Nenhum caixa encontrado - estado inicial
      return res.json({
        success: true,
        data: {
          caixa: null,
          status: 'nenhum_caixa'
        },
        message: 'Nenhum caixa encontrado'
      });
    }
    
    const caixa = result.rows[0];
    const status = caixa.status ? 'aberto' : 'fechado';
    
    // Se o caixa está aberto, calcular total de vendas dos pedidos históricos
    if (status === 'aberto') {
      const totalVendasQuery = `
        SELECT COALESCE(SUM(valor_total), 0) as total_vendas
        FROM pedidos_historico 
        WHERE caixa_id = $1
      `;
      
      const totalVendasResult = await pool.query(totalVendasQuery, [caixa.id]);
      const totalVendas = parseFloat(totalVendasResult.rows[0].total_vendas);
      
      // Atualizar o total_vendas no objeto caixa
      caixa.total_vendas = totalVendas;
      
      console.log('💰 Total de vendas calculado para caixa aberto:', totalVendas);
    }
    
    res.json({
      success: true,
      data: {
        caixa: caixa,
        status: status
      },
      message: `Último caixa está ${status}`
    });
    
  } catch (error) {
    console.error('Erro ao verificar status do caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Função para atualizar total_vendas do caixa
const atualizarTotalVendas = async (caixaId) => {
  try {
    const totalVendasQuery = `
      SELECT COALESCE(SUM(valor_total), 0) as total_vendas
      FROM pedidos_historico 
      WHERE caixa_id = $1
    `;
    
    const totalVendasResult = await pool.query(totalVendasQuery, [caixaId]);
    const totalVendas = parseFloat(totalVendasResult.rows[0].total_vendas);
    
    // Atualizar o total_vendas na tabela caixas
    await pool.query(
      'UPDATE caixas SET total_vendas = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [totalVendas, caixaId]
    );
    
    console.log('💰 Total de vendas atualizado para caixa', caixaId, ':', totalVendas);
    return totalVendas;
  } catch (error) {
    console.error('Erro ao atualizar total_vendas:', error);
    throw error;
  }
};

// PUT - Atualizar total_vendas do caixa
const updateTotalVendas = async (req, res) => {
  try {
    const { caixaId } = req.params;
    
    const totalVendas = await atualizarTotalVendas(caixaId);
    
    res.json({
      success: true,
      message: 'Total de vendas atualizado com sucesso',
      data: {
        caixa_id: caixaId,
        total_vendas: totalVendas
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar total_vendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export {
  getCaixasFechadas,
  getCaixaDetalhes,
  criarCaixa,
  fecharCaixa,
  getStatusUltimoCaixa,
  atualizarTotalVendas,
  updateTotalVendas
};
