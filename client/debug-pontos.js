// Script para debugar problemas com pontos de atendimento
import { gerarPontosAtendimento, buscarAtendimentosAtivos } from './src/services/api.js';

console.log('🔍 Iniciando diagnóstico de pontos de atendimento...');

// Simular dados de usuário
const userData = {
  establishmentId: '1',
  isLoggedIn: true
};

console.log('📊 Dados do usuário:', userData);

// Testar API
async function testAPI() {
  try {
    console.log('🔄 Testando gerarPontosAtendimento...');
    const pontosResponse = await gerarPontosAtendimento(userData.establishmentId);
    console.log('✅ Resposta gerarPontosAtendimento:', pontosResponse);
    
    console.log('🔄 Testando buscarAtendimentosAtivos...');
    const atendimentosResponse = await buscarAtendimentosAtivos(userData.establishmentId);
    console.log('✅ Resposta buscarAtendimentosAtivos:', atendimentosResponse);
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
  }
}

testAPI();
