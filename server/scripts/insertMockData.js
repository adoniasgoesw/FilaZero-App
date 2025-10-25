const pool = require('../config/db.js');

const insertMockData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Inserindo dados fictícios...');
    
    // Inserir movimentações de caixa
    const movimentacoesQuery = `
      INSERT INTO movimentacoes_caixa (caixa_id, tipo, descricao, valor, usuario_id) VALUES
      (12, 'abertura', 'Abertura do caixa', 100.00, 1),
      (12, 'entrada', 'Venda de produto - Hambúrguer', 25.50, 1),
      (12, 'entrada', 'Venda de produto - Pizza', 35.00, 1),
      (12, 'entrada', 'Venda de produto - Refrigerante', 8.50, 1),
      (12, 'saida', 'Retirada de dinheiro', 20.00, 1),
      (12, 'entrada', 'Pagamento em dinheiro', 45.00, 1),
      (12, 'entrada', 'Venda de produto - Batata Frita', 15.00, 1)
      ON CONFLICT DO NOTHING
    `;
    
    await client.query(movimentacoesQuery);
    console.log('✅ Movimentações inseridas');
    
    // Inserir pedidos históricos
    const pedidosQuery = `
      INSERT INTO pedidos_historico (pedido_id, atendimento_id, valor_total, cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, status, situacao, desconto, acrescimos) VALUES
      (1, 1, 25.50, 1, 1, 12, 1, 'PDV', 'PED001', 'finalizado', 'encerrado', 0.00, 0.00),
      (2, 2, 35.00, 2, 2, 12, 1, 'PDV', 'PED002', 'finalizado', 'encerrado', 0.00, 0.00),
      (3, 3, 8.50, 3, 1, 12, 1, 'PDV', 'PED003', 'finalizado', 'encerrado', 0.00, 0.00),
      (4, 4, 45.00, 1, 1, 12, 1, 'PDV', 'PED004', 'finalizado', 'encerrado', 0.00, 0.00),
      (5, 5, 15.00, 2, 3, 12, 1, 'PDV', 'PED005', 'finalizado', 'encerrado', 0.00, 0.00)
      ON CONFLICT DO NOTHING
    `;
    
    await client.query(pedidosQuery);
    console.log('✅ Pedidos históricos inseridos');
    
    // Inserir pagamentos históricos
    const pagamentosQuery = `
      INSERT INTO pedidos_pagamentos_historico (pedido_id, pagamento_id, valor_pago, caixa_id) VALUES
      (1, 1, 25.50, 12),
      (2, 2, 35.00, 12),
      (3, 1, 8.50, 12),
      (4, 1, 45.00, 12),
      (5, 3, 15.00, 12)
      ON CONFLICT DO NOTHING
    `;
    
    await client.query(pagamentosQuery);
    console.log('✅ Pagamentos históricos inseridos');
    
    console.log('🎉 Dados fictícios inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados fictícios:', error);
  } finally {
    client.release();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  insertMockData()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = insertMockData;
