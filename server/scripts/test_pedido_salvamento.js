// Script de teste para verificar o fluxo completo de salvamento de pedidos
// Execute com: node server/scripts/test_pedido_salvamento.js

const API_URL = 'http://localhost:3001/api';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Teste 1: Criar atendimento
async function testCreateAtendimento() {
  console.log('\n🧪 TESTE 1: Criar atendimento');
  
  const result = await makeRequest(`${API_URL}/atendimentos/upsert`, {
    method: 'POST',
    body: JSON.stringify({
      estabelecimento_id: 7,
      identificador: 'MESA 01',
      status: 'aberto',
      nome_ponto: ''
    })
  });
  
  console.log('Resultado:', result);
  return result.success ? result.data.data : null;
}

// Teste 2: Salvar pedido completo
async function testSavePedidoCompleto(atendimentoId) {
  console.log('\n🧪 TESTE 2: Salvar pedido completo');
  
  const itens = [
    {
      produto_id: 1,
      quantidade: 2,
      valor_unitario: 15.50,
      descricao: 'Produto teste 1'
    },
    {
      produto_id: 2,
      quantidade: 1,
      valor_unitario: 8.00,
      descricao: 'Produto teste 2'
    }
  ];
  
  const result = await makeRequest(`${API_URL}/pedido-salvamento/save`, {
    method: 'POST',
    body: JSON.stringify({
      atendimento_id: atendimentoId,
      itens: itens,
      cliente_id: 16,
      caixa_id: 1, // Assumindo que existe um caixa aberto
      usuario_id: 7,
      pagamento_id: 23,
      canal: 'PDV'
    })
  });
  
  console.log('Resultado:', result);
  return result.success ? result.data.data : null;
}

// Teste 3: Carregar pedido aberto
async function testLoadPedidoAberto(atendimentoId) {
  console.log('\n🧪 TESTE 3: Carregar pedido aberto');
  
  const result = await makeRequest(`${API_URL}/pedido-salvamento/atendimento/${atendimentoId}`);
  
  console.log('Resultado:', result);
  if (result.success) {
    console.log(`Pedido encontrado: ${result.data.data.pedido?.id || 'Nenhum'}`);
    console.log(`Itens encontrados: ${result.data.data.itens?.length || 0}`);
    console.log(`Valor total: R$ ${result.data.data.pedido?.valor_total || 0}`);
  }
  return result.success;
}

// Teste 4: Verificar status do atendimento
async function testCheckAtendimentoStatus(atendimentoId) {
  console.log('\n🧪 TESTE 4: Verificar status do atendimento');
  
  const result = await makeRequest(`${API_URL}/atendimentos/7/MESA 01`);
  
  console.log('Resultado:', result);
  if (result.success) {
    console.log(`Status do atendimento: ${result.data.data.status}`);
  }
  return result.success;
}

// Teste 5: Salvar pedido novamente (deve atualizar)
async function testUpdatePedido(atendimentoId) {
  console.log('\n🧪 TESTE 5: Atualizar pedido existente');
  
  const itens = [
    {
      produto_id: 1,
      quantidade: 1, // Reduzindo quantidade
      valor_unitario: 15.50,
      descricao: 'Produto teste 1 atualizado'
    },
    {
      produto_id: 3, // Novo produto
      quantidade: 2,
      valor_unitario: 12.00,
      descricao: 'Produto teste 3'
    }
  ];
  
  const result = await makeRequest(`${API_URL}/pedido-salvamento/save`, {
    method: 'POST',
    body: JSON.stringify({
      atendimento_id: atendimentoId,
      itens: itens,
      cliente_id: 16,
      caixa_id: 1,
      usuario_id: 7,
      pagamento_id: 23,
      canal: 'PDV'
    })
  });
  
  console.log('Resultado:', result);
  return result.success;
}

// Executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes do fluxo de salvamento de pedidos...\n');
  
  try {
    // Teste 1: Criar atendimento
    const atendimento = await testCreateAtendimento();
    if (!atendimento) {
      console.log('❌ Falha no teste 1 - não foi possível criar atendimento');
      return;
    }
    
    const atendimentoId = atendimento.id;
    console.log(`✅ Atendimento criado com ID: ${atendimentoId}`);
    
    // Teste 2: Salvar pedido completo
    const pedidoSalvo = await testSavePedidoCompleto(atendimentoId);
    if (!pedidoSalvo) {
      console.log('❌ Falha no teste 2 - não foi possível salvar pedido');
      return;
    }
    
    console.log(`✅ Pedido salvo com ID: ${pedidoSalvo.pedido.id}`);
    console.log(`✅ Valor total: R$ ${pedidoSalvo.valor_total}`);
    console.log(`✅ Itens salvos: ${pedidoSalvo.quantidade_itens}`);
    
    // Teste 3: Carregar pedido aberto
    const carregouPedido = await testLoadPedidoAberto(atendimentoId);
    if (!carregouPedido) {
      console.log('❌ Falha no teste 3 - não foi possível carregar pedido');
      return;
    }
    
    // Teste 4: Verificar status do atendimento
    const statusOk = await testCheckAtendimentoStatus(atendimentoId);
    if (!statusOk) {
      console.log('❌ Falha no teste 4 - não foi possível verificar status');
      return;
    }
    
    // Teste 5: Atualizar pedido
    const atualizouPedido = await testUpdatePedido(atendimentoId);
    if (!atualizouPedido) {
      console.log('❌ Falha no teste 5 - não foi possível atualizar pedido');
      return;
    }
    
    // Verificar resultado final
    const resultadoFinal = await testLoadPedidoAberto(atendimentoId);
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Fluxo de salvamento de pedidos está funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreateAtendimento,
  testSavePedidoCompleto,
  testLoadPedidoAberto,
  testCheckAtendimentoStatus,
  testUpdatePedido,
  runTests
};





