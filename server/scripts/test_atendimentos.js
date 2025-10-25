// Script de teste para verificar o funcionamento dos atendimentos
// Execute com: node server/scripts/test_atendimentos.js

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

// Teste 1: Criar atendimento pela primeira vez
async function testCreateAtendimento() {
  console.log('\n🧪 TESTE 1: Criar atendimento pela primeira vez');
  
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
  return result.success;
}

// Teste 2: Tentar criar o mesmo atendimento novamente (deve reutilizar)
async function testReuseAtendimento() {
  console.log('\n🧪 TESTE 2: Reutilizar atendimento existente');
  
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
  return result.success;
}

// Teste 3: Criar atendimento com identificador diferente
async function testCreateDifferentAtendimento() {
  console.log('\n🧪 TESTE 3: Criar atendimento com identificador diferente');
  
  const result = await makeRequest(`${API_URL}/atendimentos/upsert`, {
    method: 'POST',
    body: JSON.stringify({
      estabelecimento_id: 7,
      identificador: 'COMANDA 01',
      status: 'aberto',
      nome_ponto: ''
    })
  });
  
  console.log('Resultado:', result);
  return result.success;
}

// Teste 4: Verificar unicidade
async function testCheckUniqueness() {
  console.log('\n🧪 TESTE 4: Verificar unicidade de identificadores');
  
  const result = await makeRequest(`${API_URL}/atendimentos/estabelecimento/7/identificador/MESA 01/check`);
  
  console.log('Resultado:', result);
  return result.success;
}

// Teste 5: Listar atendimentos do estabelecimento
async function testListAtendimentos() {
  console.log('\n🧪 TESTE 5: Listar atendimentos do estabelecimento');
  
  const result = await makeRequest(`${API_URL}/atendimentos/7`);
  
  console.log('Resultado:', result);
  if (result.success) {
    console.log(`Total de atendimentos: ${result.data.data.total}`);
    console.log('Atendimentos:', result.data.data.atendimentos.map(a => ({
      id: a.id,
      identificador: a.identificador,
      status: a.status
    })));
  }
  return result.success;
}

// Executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes dos atendimentos...\n');
  
  const tests = [
    { name: 'Criar atendimento', fn: testCreateAtendimento },
    { name: 'Reutilizar atendimento', fn: testReuseAtendimento },
    { name: 'Criar atendimento diferente', fn: testCreateDifferentAtendimento },
    { name: 'Verificar unicidade', fn: testCheckUniqueness },
    { name: 'Listar atendimentos', fn: testListAtendimentos }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
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
    console.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreateAtendimento,
  testReuseAtendimento,
  testCreateDifferentAtendimento,
  testCheckUniqueness,
  testListAtendimentos,
  runTests
};





