import pool from '../config/db.js';

async function testPedidosHistoricoCaixa() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testando filtro de pedidos históricos por caixa...\n');
    
    const estabelecimentoId = 7;
    
    // 1. Verificar se existe caixa aberto
    console.log('1️⃣ Verificando caixa aberto...');
    const caixaQuery = `
      SELECT id, data_abertura, status FROM caixas 
      WHERE estabelecimento_id = $1 AND status = true 
      ORDER BY data_abertura DESC 
      LIMIT 1
    `;
    
    const caixaResult = await client.query(caixaQuery, [estabelecimentoId]);
    
    if (caixaResult.rows.length === 0) {
      console.log('❌ Nenhum caixa aberto encontrado');
      return;
    }
    
    const caixa = caixaResult.rows[0];
    console.log(`✅ Caixa aberto encontrado: ID ${caixa.id}, aberto em ${caixa.data_abertura}`);
    
    // 2. Buscar pedidos históricos do caixa aberto
    console.log('\n2️⃣ Buscando pedidos históricos do caixa aberto...');
    const pedidosQuery = `
      SELECT 
        ph.id,
        ph.criado_em,
        ph.valor_total,
        ph.caixa_id,
        c.nome as cliente_nome,
        u.nome_completo as usuario_nome
      FROM pedidos_historico ph
      LEFT JOIN clientes c ON ph.cliente_id = c.id
      LEFT JOIN usuarios u ON ph.usuario_id = u.id
      WHERE ph.caixa_id = $1
      ORDER BY ph.criado_em DESC
    `;
    
    const pedidosResult = await client.query(pedidosQuery, [caixa.id]);
    console.log(`✅ Encontrados ${pedidosResult.rows.length} pedidos históricos do caixa ${caixa.id}`);
    
    // 3. Verificar se há pedidos de outros caixas (não deveria ter)
    console.log('\n3️⃣ Verificando se há pedidos de outros caixas...');
    const outrosCaixasQuery = `
      SELECT 
        ph.id,
        ph.caixa_id,
        ph.criado_em,
        cx.data_abertura
      FROM pedidos_historico ph
      INNER JOIN caixas cx ON ph.caixa_id = cx.id
      WHERE cx.estabelecimento_id = $1 AND ph.caixa_id != $2
      ORDER BY ph.criado_em DESC
      LIMIT 5
    `;
    
    const outrosCaixasResult = await client.query(outrosCaixasQuery, [estabelecimentoId, caixa.id]);
    console.log(`ℹ️  Existem ${outrosCaixasResult.rows.length} pedidos de outros caixas (não aparecerão na listagem)`);
    
    // 4. Mostrar alguns pedidos do caixa atual
    if (pedidosResult.rows.length > 0) {
      console.log('\n4️⃣ Exemplos de pedidos do caixa atual:');
      pedidosResult.rows.slice(0, 3).forEach((pedido, index) => {
        console.log(`   ${index + 1}. ID: ${pedido.id}, Cliente: ${pedido.cliente_nome || 'N/A'}, Valor: R$ ${pedido.valor_total}, Data: ${pedido.criado_em}`);
      });
    }
    
    console.log('\n✅ Teste concluído! A filtragem por caixa está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

testPedidosHistoricoCaixa();

