#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Função para verificar se a porta está em uso
async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n').filter(line => line.includes('LISTENING'));
    return lines.length > 0;
  } catch (error) {
    return false;
  }
}

// Função para matar processos na porta
async function killProcessOnPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n').filter(line => line.includes('LISTENING'));
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        console.log(`🔄 Matando processo ${pid} na porta ${port}...`);
        await execAsync(`taskkill /PID ${pid} /F`);
      }
    }
  } catch (error) {
    console.log('ℹ️  Nenhum processo encontrado na porta', port);
  }
}

// Função principal
async function startServer() {
  const PORT = 3002;
  
  console.log('🚀 Iniciando servidor FilaZero...');
  
  // Verificar se a porta está em uso
  const portInUse = await checkPort(PORT);
  
  if (portInUse) {
    console.log(`⚠️  Porta ${PORT} está em uso. Liberando...`);
    await killProcessOnPort(PORT);
    
    // Aguardar um pouco para a porta ser liberada
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`✅ Porta ${PORT} liberada. Iniciando servidor...`);
  
  // Importar e executar o servidor
  const { default: app } = await import('./server.js');
}

// Executar
startServer().catch(console.error);
