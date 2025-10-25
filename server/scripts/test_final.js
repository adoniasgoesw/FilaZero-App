// Script de teste final para verificar o funcionamento completo
const API_URL = 'http://localhost:3002/api';

async function testApiConnection() {
  try {
    console.log('🔍 Testando conexão com a API...');
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    console.log('✅ API conectada:', data.status);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com API:', error.message);
    return false;
  }
}

async function testAtendimentosUpsert() {
  try {
    console.log('\n🔍 Testando UPSERT de atendimentos...');
    const response = await fetch(`${API_URL}/atendimentos/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estabelecimento_id: 7,
        identificador: 'MESA 03',
        status: 'aberto',
        nome_ponto: ''
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ UPSERT funcionando:', data.data.identificador);
      return data.data.id;
    } else {
      console.error('❌ Erro no UPSERT:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no teste UPSERT:', error.message);
    return null;
  }
}

async function testAtendimentosList() {
  try {
    console.log('\n🔍 Testando listagem de atendimentos...');
    const response = await fetch(`${API_URL}/atendimentos/7`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Listagem funcionando: ${data.data.total} atendimentos encontrados`);
      data.data.atendimentos.forEach(atendimento => {
        console.log(`  - ${atendimento.identificador}: ${atendimento.status}`);
      });
      return true;
    } else {
      console.error('❌ Erro na listagem:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no teste de listagem:', error.message);
    return false;
  }
}

async function testAtendimentoByIdentificador() {
  try {
    console.log('\n🔍 Testando busca por identificador...');
    const response = await fetch(`${API_URL}/atendimentos/7/MESA 03`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Busca por identificador funcionando:', data.data.identificador);
      return true;
    } else {
      console.error('❌ Erro na busca por identificador:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no teste de busca:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes finais do sistema...\n');
  
  const tests = [
    { name: 'Conexão com API', fn: testApiConnection },
    { name: 'UPSERT de atendimentos', fn: testAtendimentosUpsert },
    { name: 'Listagem de atendimentos', fn: testAtendimentosList },
    { name: 'Busca por identificador', fn: testAtendimentoByIdentificador }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name}: PASSOU`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO - ${error.message}`);
    }
  }
  
  console.log(`\n📊 RESULTADO FINAL: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ O sistema de atendimentos está funcionando perfeitamente!');
    console.log('\n💡 O que foi corrigido:');
    console.log('1. ✅ Criado índice único na tabela atendimentos');
    console.log('2. ✅ Corrigido erro 500 na rota UPSERT');
    console.log('3. ✅ Corrigido erro 404 na rota de busca');
    console.log('4. ✅ Todas as rotas estão funcionando corretamente');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar se chamado diretamente
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

export { runTests };





