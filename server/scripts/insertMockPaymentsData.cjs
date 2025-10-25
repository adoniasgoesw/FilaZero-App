const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const insertMockPaymentsData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Inserindo dados fictícios de pagamentos...');
    
    // Primeiro, vamos verificar se já existem dados para evitar duplicação
    const existingData = await client.query(
      'SELECT COUNT(*) FROM pedidos_pagamentos_historico WHERE caixa_id = 12'
    );
    
    if (existingData.rows[0].count > 0) {
      console.log('⚠️  Dados já existem. Limpando dados antigos...');
      await client.query('DELETE FROM pedidos_pagamentos_historico WHERE caixa_id = 12');
      await client.query('DELETE FROM pedidos_historico WHERE caixa_id = 12');
    }
    
    // Inserir pedidos históricos mais variados
    const pedidosQuery = `
      INSERT INTO pedidos_historico (pedido_id, atendimento_id, valor_total, cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, status, situacao, desconto, acrescimos, criado_em) VALUES
      (1, 1, 25.50, 1, 1, 12, 1, 'PDV', 'PED001', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '2 hours'),
      (2, 2, 35.00, 2, 2, 12, 1, 'PDV', 'PED002', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '1 hour 45 minutes'),
      (3, 3, 8.50, 3, 1, 12, 1, 'PDV', 'PED003', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '1 hour 30 minutes'),
      (4, 4, 45.00, 1, 1, 12, 1, 'PDV', 'PED004', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '1 hour 15 minutes'),
      (5, 5, 15.00, 2, 3, 12, 1, 'PDV', 'PED005', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '1 hour'),
      (6, 6, 30.00, 4, 1, 12, 1, 'PDV', 'PED006', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '45 minutes'),
      (7, 7, 22.50, 5, 2, 12, 1, 'PDV', 'PED007', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '30 minutes'),
      (8, 8, 18.75, 3, 3, 12, 1, 'PDV', 'PED008', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '25 minutes'),
      (9, 9, 55.00, 1, 1, 12, 1, 'PDV', 'PED009', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '20 minutes'),
      (10, 10, 12.00, 6, 2, 12, 1, 'PDV', 'PED010', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '15 minutes'),
      (11, 11, 28.90, 7, 3, 12, 1, 'PDV', 'PED011', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '10 minutes'),
      (12, 12, 40.25, 2, 1, 12, 1, 'PDV', 'PED012', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '8 minutes'),
      (13, 13, 33.50, 8, 2, 12, 1, 'PDV', 'PED013', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '5 minutes'),
      (14, 14, 19.80, 4, 1, 12, 1, 'PDV', 'PED014', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '3 minutes'),
      (15, 15, 47.60, 9, 3, 12, 1, 'PDV', 'PED015', 'finalizado', 'encerrado', 0.00, 0.00, NOW() - INTERVAL '1 minute'),
      (16, 16, 62.30, 1, 1, 12, 1, 'PDV', 'PED016', 'finalizado', 'encerrado', 5.00, 0.00, NOW() - INTERVAL '30 seconds'),
      (17, 17, 38.75, 10, 2, 12, 1, 'PDV', 'PED017', 'finalizado', 'encerrado', 0.00, 2.50, NOW()),
      (18, 18, 24.90, 5, 3, 12, 1, 'PDV', 'PED018', 'finalizado', 'encerrado', 0.00, 0.00, NOW()),
      (19, 19, 51.20, 3, 1, 12, 1, 'PDV', 'PED019', 'finalizado', 'encerrado', 0.00, 0.00, NOW()),
      (20, 20, 16.40, 11, 2, 12, 1, 'PDV', 'PED020', 'finalizado', 'encerrado', 0.00, 0.00, NOW())
    `;
    
    await client.query(pedidosQuery);
    console.log('✅ Pedidos históricos inseridos (20 pedidos)');
    
    // Inserir pagamentos históricos correspondentes
    const pagamentosQuery = `
      INSERT INTO pedidos_pagamentos_historico (pedido_id, pagamento_id, valor_pago, caixa_id, criado_em) VALUES
      (1, 1, 25.50, 12, NOW() - INTERVAL '2 hours'),
      (2, 2, 35.00, 12, NOW() - INTERVAL '1 hour 45 minutes'),
      (3, 1, 8.50, 12, NOW() - INTERVAL '1 hour 30 minutes'),
      (4, 1, 45.00, 12, NOW() - INTERVAL '1 hour 15 minutes'),
      (5, 3, 15.00, 12, NOW() - INTERVAL '1 hour'),
      (6, 1, 30.00, 12, NOW() - INTERVAL '45 minutes'),
      (7, 2, 22.50, 12, NOW() - INTERVAL '30 minutes'),
      (8, 3, 18.75, 12, NOW() - INTERVAL '25 minutes'),
      (9, 1, 55.00, 12, NOW() - INTERVAL '20 minutes'),
      (10, 2, 12.00, 12, NOW() - INTERVAL '15 minutes'),
      (11, 3, 28.90, 12, NOW() - INTERVAL '10 minutes'),
      (12, 1, 40.25, 12, NOW() - INTERVAL '8 minutes'),
      (13, 2, 33.50, 12, NOW() - INTERVAL '5 minutes'),
      (14, 1, 19.80, 12, NOW() - INTERVAL '3 minutes'),
      (15, 3, 47.60, 12, NOW() - INTERVAL '1 minute'),
      (16, 1, 62.30, 12, NOW() - INTERVAL '30 seconds'),
      (17, 2, 38.75, 12, NOW()),
      (18, 3, 24.90, 12, NOW()),
      (19, 1, 51.20, 12, NOW()),
      (20, 2, 16.40, 12, NOW())
    `;
    
    await client.query(pagamentosQuery);
    console.log('✅ Pagamentos históricos inseridos (20 pagamentos)');
    
    // Inserir mais movimentações de caixa para acompanhar os pagamentos
    const movimentacoesQuery = `
      INSERT INTO movimentacoes_caixa (caixa_id, tipo, descricao, valor, usuario_id, criado_em) VALUES
      (12, 'abertura', 'Abertura do caixa', 100.00, 1, NOW() - INTERVAL '3 hours'),
      (12, 'entrada', 'Venda PED001 - Dinheiro', 25.50, 1, NOW() - INTERVAL '2 hours'),
      (12, 'entrada', 'Venda PED002 - PIX', 35.00, 1, NOW() - INTERVAL '1 hour 45 minutes'),
      (12, 'entrada', 'Venda PED003 - Dinheiro', 8.50, 1, NOW() - INTERVAL '1 hour 30 minutes'),
      (12, 'entrada', 'Venda PED004 - Dinheiro', 45.00, 1, NOW() - INTERVAL '1 hour 15 minutes'),
      (12, 'entrada', 'Venda PED005 - Cartão de Crédito', 15.00, 1, NOW() - INTERVAL '1 hour'),
      (12, 'entrada', 'Venda PED006 - Dinheiro', 30.00, 1, NOW() - INTERVAL '45 minutes'),
      (12, 'entrada', 'Venda PED007 - PIX', 22.50, 1, NOW() - INTERVAL '30 minutes'),
      (12, 'entrada', 'Venda PED008 - Cartão de Crédito', 18.75, 1, NOW() - INTERVAL '25 minutes'),
      (12, 'entrada', 'Venda PED009 - Dinheiro', 55.00, 1, NOW() - INTERVAL '20 minutes'),
      (12, 'entrada', 'Venda PED010 - PIX', 12.00, 1, NOW() - INTERVAL '15 minutes'),
      (12, 'entrada', 'Venda PED011 - Cartão de Crédito', 28.90, 1, NOW() - INTERVAL '10 minutes'),
      (12, 'entrada', 'Venda PED012 - Dinheiro', 40.25, 1, NOW() - INTERVAL '8 minutes'),
      (12, 'entrada', 'Venda PED013 - PIX', 33.50, 1, NOW() - INTERVAL '5 minutes'),
      (12, 'entrada', 'Venda PED014 - Dinheiro', 19.80, 1, NOW() - INTERVAL '3 minutes'),
      (12, 'entrada', 'Venda PED015 - Cartão de Crédito', 47.60, 1, NOW() - INTERVAL '1 minute'),
      (12, 'entrada', 'Venda PED016 - Dinheiro', 62.30, 1, NOW() - INTERVAL '30 seconds'),
      (12, 'entrada', 'Venda PED017 - PIX', 38.75, 1, NOW()),
      (12, 'entrada', 'Venda PED018 - Cartão de Crédito', 24.90, 1, NOW()),
      (12, 'entrada', 'Venda PED019 - Dinheiro', 51.20, 1, NOW()),
      (12, 'entrada', 'Venda PED020 - PIX', 16.40, 1, NOW()),
      (12, 'saida', 'Retirada de dinheiro', 50.00, 1, NOW() - INTERVAL '1 hour 30 minutes'),
      (12, 'saida', 'Pagamento de fornecedor', 30.00, 1, NOW() - INTERVAL '45 minutes')
    `;
    
    await client.query(movimentacoesQuery);
    console.log('✅ Movimentações de caixa inseridas');
    
    // Calcular totais por tipo de pagamento
    const resumoQuery = `
      SELECT 
        p.tipo as tipo_pagamento,
        COUNT(pph.id) as quantidade_pagamentos,
        SUM(pph.valor_pago) as valor_total,
        AVG(pph.valor_pago) as valor_medio
      FROM pedidos_pagamentos_historico pph
      JOIN pagamentos p ON pph.pagamento_id = p.id
      WHERE pph.caixa_id = 12
      GROUP BY p.tipo
      ORDER BY valor_total DESC
    `;
    
    const resumo = await client.query(resumoQuery);
    console.log('\n📊 Resumo dos pagamentos:');
    resumo.rows.forEach(row => {
      console.log(`  ${row.tipo_pagamento}: ${row.quantidade_pagamentos} pagamentos, R$ ${parseFloat(row.valor_total).toFixed(2)}, média R$ ${parseFloat(row.valor_medio).toFixed(2)}`);
    });
    
    const totalQuery = `
      SELECT 
        COUNT(*) as total_pagamentos,
        SUM(valor_pago) as valor_total_geral
      FROM pedidos_pagamentos_historico 
      WHERE caixa_id = 12
    `;
    
    const total = await client.query(totalQuery);
    console.log(`\n💰 Total: ${total.rows[0].total_pagamentos} pagamentos, R$ ${parseFloat(total.rows[0].valor_total_geral).toFixed(2)}`);
    
    console.log('\n🎉 Dados fictícios de pagamentos inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados fictícios:', error);
  } finally {
    client.release();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  insertMockPaymentsData();
}

module.exports = insertMockPaymentsData;


