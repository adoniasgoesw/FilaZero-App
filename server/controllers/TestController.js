// Endpoint de teste para verificar a tabela atendimentos
import pool from '../config/db.js';

export const testarTabelaAtendimentos = async (req, res) => {
  try {
    console.log('🧪 Testando tabela atendimentos...');
    
    // Verificar se a tabela existe
    const verificarTabela = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'atendimentos'
      );
    `;
    
    const tabelaExiste = await pool.query(verificarTabela);
    console.log('Tabela existe?', tabelaExiste.rows[0].exists);
    
    if (!tabelaExiste.rows[0].exists) {
      console.log('❌ Tabela atendimentos não existe!');
      return res.status(404).json({
        success: false,
        message: 'Tabela atendimentos não existe no banco de dados',
        tabela_existe: false
      });
    }
    
    // Tentar fazer uma consulta simples
    const consultaTeste = 'SELECT COUNT(*) as total FROM atendimentos';
    const resultado = await pool.query(consultaTeste);
    
    console.log('✅ Tabela atendimentos existe e está acessível');
    console.log('Total de registros:', resultado.rows[0].total);
    
    return res.status(200).json({
      success: true,
      message: 'Tabela atendimentos está funcionando',
      tabela_existe: true,
      total_registros: resultado.rows[0].total
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar tabela:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao testar tabela',
      error: error.message,
      code: error.code
    });
  }
};






