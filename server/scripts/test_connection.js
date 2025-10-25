// Script para testar a conexão com o banco e as rotas
// Execute com: node server/scripts/test_connection.js

import db from '../config/db.js';
import config from '../config/environments.js';

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Conexão com banco OK:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error.message);
    return false;
  }
}

async function testAtendimentosTable() {
  console.log('\n🔍 Testando tabela atendimentos...');
  
  try {
    // Verificar se a tabela existe
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'atendimentos'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela atendimentos não existe');
      return false;
    }
    
    console.log('✅ Tabela atendimentos existe');
    
    // Verificar estrutura da tabela
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'atendimentos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Colunas da tabela:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar índices únicos
    const indexes = await db.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'atendimentos';
    `);
    
    console.log('📋 Índices da tabela:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar tabela:', error.message);
    return false;
  }
}

async function testAtendimentosData() {
  console.log('\n🔍 Testando dados na tabela atendimentos...');
  
  try {
    // Contar registros
    const count = await db.query('SELECT COUNT(*) as total FROM atendimentos');
    console.log(`📊 Total de atendimentos: ${count.rows[0].total}`);
    
    // Buscar alguns registros
    const atendimentos = await db.query(`
      SELECT id, estabelecimento_id, identificador, status, criado_em 
      FROM atendimentos 
      ORDER BY criado_em DESC 
      LIMIT 5
    `);
    
    if (atendimentos.rows.length > 0) {
      console.log('📋 Últimos atendimentos:');
      atendimentos.rows.forEach(atendimento => {
        console.log(`  - ID: ${atendimento.id}, Estabelecimento: ${atendimento.estabelecimento_id}, Identificador: ${atendimento.identificador}, Status: ${atendimento.status}`);
      });
    } else {
      console.log('📋 Nenhum atendimento encontrado');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar dados:', error.message);
    return false;
  }
}

async function testCreateAtendimento() {
  console.log('\n🔍 Testando criação de atendimento...');
  
  try {
    // Tentar criar um atendimento de teste
    const novoAtendimento = await db.query(`
      INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [7, 'TESTE 01', 'aberto', 'Teste de conexão']);
    
    console.log('✅ Atendimento criado:', novoAtendimento.rows[0]);
    
    // Limpar o teste
    await db.query('DELETE FROM atendimentos WHERE identificador = $1', ['TESTE 01']);
    console.log('🗑️ Atendimento de teste removido');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar atendimento:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de conexão...\n');
  console.log(`🔧 Configuração: ${config.API_URL}`);
  console.log(`🔧 Porta: ${config.PORT}\n`);
  
  const tests = [
    { name: 'Conexão com banco', fn: testDatabaseConnection },
    { name: 'Tabela atendimentos', fn: testAtendimentosTable },
    { name: 'Dados na tabela', fn: testAtendimentosData },
    { name: 'Criação de atendimento', fn: testCreateAtendimento }
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
    console.log('🎉 Todos os testes passaram! O banco está funcionando corretamente.');
    console.log('\n💡 Próximos passos:');
    console.log('1. Verifique se o servidor está rodando: npm run dev');
    console.log('2. Teste as rotas: curl http://localhost:3002/api/status');
    console.log('3. Verifique os logs do servidor para erros');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testDatabaseConnection,
  testAtendimentosTable,
  testAtendimentosData,
  testCreateAtendimento,
  runTests
};





