const db = require('./config/db');

async function updateStatus() {
  try {
    console.log('🔄 Atualizando status do ponto MESA 1...');
    
    const result = await db.query(
      "UPDATE atendimentos SET status = 'ocupada' WHERE id = 173 RETURNING *"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Status atualizado com sucesso!');
      console.log('📋 Dados atualizados:', result.rows[0]);
    } else {
      console.log('❌ Nenhum registro encontrado com ID 173');
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
  } finally {
    await db.end();
  }
}

updateStatus();
