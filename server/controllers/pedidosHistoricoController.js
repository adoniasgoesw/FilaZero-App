import pool from '../config/db.js';

// Buscar pedidos históricos por estabelecimento (apenas do caixa aberto)
export const getPedidosHistorico = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { estabelecimento_id } = req.params;

    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    // Primeiro, buscar o caixa aberto do estabelecimento
    const caixaQuery = `
      SELECT id FROM caixas 
      WHERE estabelecimento_id = $1 AND status = true 
      ORDER BY data_abertura DESC 
      LIMIT 1
    `;
    
    const caixaResult = await client.query(caixaQuery, [estabelecimento_id]);
    
    if (caixaResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum caixa aberto encontrado',
        data: {
          pedidos: []
        }
      });
    }
    
    const caixaId = caixaResult.rows[0].id;

    // Buscar pedidos históricos apenas do caixa aberto
    const query = `
      SELECT 
        ph.*,
        c.nome as cliente_nome,
        p.tipo as pagamento_tipo,
        u.nome_completo as usuario_nome
      FROM pedidos_historico ph
      LEFT JOIN clientes c ON ph.cliente_id = c.id
      LEFT JOIN pagamentos p ON ph.pagamento_id = p.id
      LEFT JOIN usuarios u ON ph.usuario_id = u.id
      WHERE ph.caixa_id = $1
      ORDER BY ph.criado_em DESC
    `;

    const result = await client.query(query, [caixaId]);

    res.status(200).json({
      success: true,
      message: 'Pedidos históricos do caixa aberto recuperados com sucesso!',
      data: {
        pedidos: result.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos históricos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

