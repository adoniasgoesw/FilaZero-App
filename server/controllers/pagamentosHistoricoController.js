import pool from '../config/db.js';

// Buscar pagamentos históricos agrupados por tipo e filtrados por caixa aberto
export const getPagamentosHistorico = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { estabelecimento_id } = req.params;

    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID é obrigatório'
      });
    }

    // 1. Buscar caixa aberto do estabelecimento
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

    // 2. Buscar total de vendas do caixa
    const totalVendasQuery = `
      SELECT COALESCE(SUM(valor_total), 0) as total_vendas
      FROM pedidos_historico 
      WHERE caixa_id = $1
    `;
    
    const totalVendasResult = await client.query(totalVendasQuery, [caixaId]);
    const totalVendas = parseFloat(totalVendasResult.rows[0].total_vendas);
    console.log('💰 Total de vendas do caixa:', totalVendas);

    // 3. Buscar pagamentos agrupados por tipo do caixa aberto
    const pagamentosQuery = `
      SELECT 
        p.tipo as pagamento_tipo,
        SUM(pph.valor_pago) as valor_total_pago,
        COUNT(*) as quantidade_pagamentos
      FROM pedidos_pagamentos_historico pph
      INNER JOIN pagamentos p ON pph.pagamento_id = p.id
      WHERE pph.caixa_id = $1
      GROUP BY p.tipo
      ORDER BY valor_total_pago DESC
    `;

    const pagamentosResult = await client.query(pagamentosQuery, [caixaId]);
    console.log('📊 Resultado da query de pagamentos:', pagamentosResult.rows);
    
    // 4. Calcular porcentagens e formatar dados
    const pagamentos = pagamentosResult.rows.map(pagamento => {
      const valorTotal = parseFloat(pagamento.valor_total_pago);
      const porcentagem = totalVendas > 0 ? (valorTotal / totalVendas) * 100 : 0;
      
      return {
        pagamento_tipo: pagamento.pagamento_tipo,
        valor_pago: valorTotal,
        quantidade_pagamentos: parseInt(pagamento.quantidade_pagamentos),
        porcentagem: Math.round(porcentagem * 100) / 100, // Arredondar para 2 casas decimais
        pedido_valor_total: totalVendas
      };
    });

    console.log('📊 Pagamentos agrupados:', pagamentos);

    res.status(200).json({
      success: true,
      message: 'Pagamentos históricos recuperados com sucesso!',
      data: {
        pagamentos: pagamentos,
        total_vendas: totalVendas,
        caixa_id: caixaId
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos históricos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

