import db from '../config/db.js';

// Criar configuração padrão de pontos de atendimento (função interna)
const createDefaultPontosAtendimento = async (estabelecimentoId) => {
  try {
    // Verificar se já existe configuração para este estabelecimento
    const configExistente = await db.query(
      'SELECT id FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimentoId]
    );

    if (configExistente.rows.length > 0) {
      return; // Já existe configuração, não criar novamente
    }

    // Inserir configuração padrão (apenas mesas habilitadas com quantidade 4)
    await db.query(
      `INSERT INTO pontos_atendimento 
       (estabelecimento_id, atendimento_mesas, atendimento_balcao, atendimento_comandas, 
        quantidade_mesas, quantidade_balcao, quantidade_comandas, prefixo_comanda)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        estabelecimentoId,
        true,  // atendimento_mesas
        false, // atendimento_balcao
        false, // atendimento_comandas
        4,     // quantidade_mesas
        0,     // quantidade_balcao
        0,     // quantidade_comandas
        ''     // prefixo_comanda
      ]
    );

    console.log(`Configuração padrão de pontos de atendimento criada para estabelecimento ${estabelecimentoId}`);
  } catch (error) {
    console.error('Erro ao criar configuração padrão de pontos de atendimento:', error);
    throw error;
  }
};

// Criar configuração padrão de pontos de atendimento (rota)
const criarConfiguracaoPadrao = async (req, res) => {
  try {
    const { estabelecimento_id } = req.body;

    if (!estabelecimento_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do estabelecimento é obrigatório' 
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await db.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimento_id]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Verificar se já existe configuração para este estabelecimento
    const configExistente = await db.query(
      'SELECT id FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimento_id]
    );

    if (configExistente.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Configuração de pontos de atendimento já existe para este estabelecimento' 
      });
    }

    // Criar configuração padrão
    await createDefaultPontosAtendimento(estabelecimento_id);

    // Buscar a configuração criada
    const result = await db.query(
      'SELECT * FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimento_id]
    );

    res.status(201).json({
      success: true,
      message: 'Configuração padrão de pontos de atendimento criada com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar configuração padrão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar configuração de pontos de atendimento
const buscarConfiguracao = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;

    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await db.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimento_id]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Criar configuração padrão se não existir
    await createDefaultPontosAtendimento(estabelecimento_id);

    // Buscar configuração do estabelecimento
    const result = await db.query(
      'SELECT * FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimento_id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar configuração de pontos de atendimento
const atualizarConfiguracao = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;
    const {
      atendimento_mesas,
      atendimento_balcao,
      atendimento_comandas,
      quantidade_mesas,
      quantidade_balcao,
      quantidade_comandas,
      prefixo_comanda
    } = req.body;

    console.log('Dados recebidos para atualização:', {
      estabelecimento_id,
      atendimento_mesas,
      atendimento_balcao,
      atendimento_comandas,
      quantidade_mesas,
      quantidade_balcao,
      quantidade_comandas,
      prefixo_comanda
    });

    // Verificar se os valores booleanos estão corretos
    const booleanValues = {
      atendimento_mesas: Boolean(atendimento_mesas),
      atendimento_balcao: Boolean(atendimento_balcao),
      atendimento_comandas: Boolean(atendimento_comandas)
    };

    console.log('Valores booleanos processados:', booleanValues);

    // Verificar se a configuração existe
    const configExistente = await db.query(
      'SELECT id FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimento_id]
    );

    if (configExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de pontos de atendimento não encontrada'
      });
    }

    // Atualizar configuração
    const result = await db.query(
      `UPDATE pontos_atendimento 
       SET atendimento_mesas = $1, atendimento_balcao = $2, atendimento_comandas = $3,
           quantidade_mesas = $4, quantidade_balcao = $5, quantidade_comandas = $6,
           prefixo_comanda = $7, atualizado_em = CURRENT_TIMESTAMP
       WHERE estabelecimento_id = $8
       RETURNING *`,
      [
        booleanValues.atendimento_mesas,
        booleanValues.atendimento_balcao,
        booleanValues.atendimento_comandas,
        parseInt(quantidade_mesas) || 0,
        parseInt(quantidade_balcao) || 0,
        parseInt(quantidade_comandas) || 0,
        prefixo_comanda || '',
        estabelecimento_id
      ]
    );

    console.log('Configuração atualizada:', result.rows[0]);

    res.status(200).json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export {
  criarConfiguracaoPadrao,
  buscarConfiguracao,
  atualizarConfiguracao
};
