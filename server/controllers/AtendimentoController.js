import pool from '../config/db.js';

/**
 * Calcular tempo de atividade baseado no criado_em e status
 */
const calcularTempoAtividade = (criadoEm, status) => {
  // Se status for 'disponivel', sempre retorna 0min
  if (status === 'disponivel') {
    return '0min';
  }
  
  if (!criadoEm) return '0min';
  
  const agora = new Date();
  const criado = new Date(criadoEm);
  const diffMs = agora - criado;
  
  const diffMinutos = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMinutos / 60);
  const diffDias = Math.floor(diffHoras / 24);
  
  if (diffDias > 0) {
    return `${diffDias}d ${diffHoras % 24}h`;
  } else if (diffHoras > 0) {
    return `${diffHoras}h ${diffMinutos % 60}min`;
  } else {
    return `${diffMinutos}min`;
  }
};

class AtendimentoController {
  /**
   * Criar ou buscar um ponto de atendimento
   * Se não existir, cria um novo registro
   * Se já existir, retorna o existente
   */
  async criarOuBuscarPonto(req, res) {
    const { estabelecimento_id, identificador, nome_ponto } = req.body;

    console.log('=== CRIAR OU BUSCAR PONTO ===');
    console.log('Dados recebidos:', { estabelecimento_id, identificador, nome_ponto });

    try {
      // Validar dados obrigatórios
      if (!estabelecimento_id || !identificador) {
        console.log('❌ Dados obrigatórios ausentes');
        return res.status(400).json({
          success: false,
          message: 'estabelecimento_id e identificador são obrigatórios'
        });
      }

      // 1. Verificar se o ponto já existe
      console.log('🔍 Buscando ponto existente...');
      const buscarQuery = `
        SELECT * FROM atendimentos 
        WHERE identificador = $1 AND estabelecimento_id = $2
      `;
      
      console.log('Query:', buscarQuery);
      console.log('Parâmetros:', [identificador, estabelecimento_id]);
      
      const buscarResult = await pool.query(buscarQuery, [identificador, estabelecimento_id]);
      console.log('Resultado da busca:', buscarResult.rows);

      // 2. Se já existir, retornar o existente
      if (buscarResult.rows.length > 0) {
        const pontoExistente = buscarResult.rows[0];
        
        // Atualizar status para 'em_atendimento' apenas se não estiver disponível
        let atualizarResult;
        if (pontoExistente.status !== 'disponivel') {
          const atualizarQuery = `
            UPDATE atendimentos 
            SET status = 'em_atendimento', atualizado_em = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING *
          `;
          atualizarResult = await pool.query(atualizarQuery, [pontoExistente.id]);
        } else {
          // Se estiver disponível, apenas atualizar o timestamp sem alterar o status
          const atualizarQuery = `
            UPDATE atendimentos 
            SET atualizado_em = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING *
          `;
          atualizarResult = await pool.query(atualizarQuery, [pontoExistente.id]);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Ponto de atendimento em atendimento',
          data: {
            atendimento: atualizarResult.rows[0]
          }
        });
      }

      // 3. Se não existir, criar novo registro
      console.log('➕ Criando novo ponto de atendimento...');
      const criarQuery = `
        INSERT INTO atendimentos 
        (estabelecimento_id, identificador, status, nome_ponto, criado_em, atualizado_em)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const nomePonto = nome_ponto || identificador;
      
      console.log('Query de criação:', criarQuery);
      console.log('Parâmetros:', [estabelecimento_id, identificador, 'aberto', nomePonto]);
      
      const criarResult = await pool.query(criarQuery, [
        estabelecimento_id,
        identificador,
        'em_atendimento', // Status quando acessado
        nomePonto
      ]);
      
      console.log('✅ Ponto criado:', criarResult.rows[0]);

      return res.status(201).json({
        success: true,
        message: 'Ponto de atendimento criado com sucesso',
        data: {
          atendimento: criarResult.rows[0]
        }
      });

    } catch (error) {
      console.error('❌ Erro ao criar/buscar ponto de atendimento:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      
      // Verificar se é erro de duplicata (UNIQUE constraint)
      if (error.code === '23505') {
        console.log('⚠️ Erro de duplicata detectado');
        return res.status(409).json({
          success: false,
          message: 'Já existe um ponto de atendimento com este identificador para este estabelecimento'
        });
      }

      console.log('❌ Erro interno do servidor');
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Atualizar status de um ponto de atendimento
   */
  async atualizarStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      // Validar status
      const statusValidos = ['disponivel', 'aberto', 'ocupado', 'em_atendimento'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use: disponivel, aberto, ocupado, em_atendimento'
        });
      }

      // Se mudando para 'aberto', reiniciar o tempo (atualizar criado_em)
      // Se mudando para 'disponivel', também reiniciar o tempo
      let query, params;
      if (status === 'aberto' || status === 'disponivel') {
        query = `
          UPDATE atendimentos 
          SET status = $1, criado_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP 
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
      } else {
        query = `
          UPDATE atendimentos 
          SET status = $1, atualizado_em = CURRENT_TIMESTAMP 
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
      }

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Resetar ponto de atendimento (usado após exclusão de pedido)
   */
  async resetarPonto(req, res) {
    const { id } = req.params;

    try {
      const query = `
        UPDATE atendimentos 
        SET nome_ponto = '', status = 'disponivel', criado_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ponto de atendimento resetado com sucesso',
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao resetar ponto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar dados atualizados de um ponto de atendimento (para atualização em tempo real)
   */
  async buscarDadosAtualizados(req, res) {
    const { id } = req.params;
    const idNumero = parseInt(id);

    console.log('=== BUSCAR DADOS ATUALIZADOS ===');
    console.log('ID recebido:', id, 'Tipo:', typeof id);
    console.log('ID convertido:', idNumero, 'Tipo:', typeof idNumero);

    try {
      const query = `
        SELECT * FROM atendimentos 
        WHERE id = $1
      `;

      console.log('Query:', query);
      console.log('Parâmetros:', [idNumero]);

      const result = await pool.query(query, [idNumero]);
      console.log('Resultado da query:', result.rows);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      const atendimento = result.rows[0];
      
      // Adicionar tempo de atividade
      const atendimentoComTempo = {
        ...atendimento,
        tempo_atividade: calcularTempoAtividade(atendimento.criado_em, atendimento.status)
      };

      return res.status(200).json({
        success: true,
        data: {
          atendimento: atendimentoComTempo
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados atualizados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar ponto de atendimento por ID
   */
  async buscarPorId(req, res) {
    const { id } = req.params;

    try {
      const query = `
        SELECT * FROM atendimentos 
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao buscar ponto de atendimento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar ponto de atendimento por identificador e estabelecimento
   */
  async buscarPorIdentificador(req, res) {
    const { identificador, estabelecimento_id } = req.params;

    try {
      const query = `
        SELECT * FROM atendimentos 
        WHERE identificador = $1 AND estabelecimento_id = $2
      `;

      const result = await pool.query(query, [identificador, estabelecimento_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao buscar ponto de atendimento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }


  /**
   * Listar todos os pontos de atendimento de um estabelecimento
   */
  async listarPorEstabelecimento(req, res) {
    const { estabelecimento_id } = req.params;

    try {
      // JOIN direto para pegar valor_total do pedido em uma consulta só
      const query = `
        SELECT 
          a.*,
          p.valor_total as pedido_valor_total,
          CASE 
            WHEN p.valor_total > 0 THEN 'ocupada'
            ELSE a.status
          END as status_atualizado
        FROM atendimentos a
        LEFT JOIN pedidos p ON a.id = p.atendimento_id AND p.situacao = 'aberto'
        WHERE a.estabelecimento_id = $1 
        ORDER BY a.identificador ASC
      `;

      const result = await pool.query(query, [estabelecimento_id]);

      // Processar resultados
      const atendimentosProcessados = result.rows.map(atendimento => ({
        ...atendimento,
        status: atendimento.status_atualizado, // Usar status atualizado
        valor_total: parseFloat(atendimento.pedido_valor_total || 0), // Valor do pedido
        tempo_atividade: calcularTempoAtividade(atendimento.criado_em, atendimento.status)
      }));

      return res.status(200).json({
        success: true,
        data: {
          atendimentos: atendimentosProcessados,
          total: result.rows.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar pontos de atendimento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Atualizar nome do ponto de atendimento
   */
  async atualizarNomePonto(req, res) {
    const { id } = req.params;
    const { nome_ponto } = req.body;

    console.log('=== ATUALIZAR NOME PONTO ===');
    console.log('ID:', id);
    console.log('Nome ponto:', nome_ponto);

    try {
      if (!nome_ponto || nome_ponto.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'nome_ponto é obrigatório'
        });
      }

      const query = `
        UPDATE atendimentos 
        SET nome_ponto = $1, atualizado_em = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `;

      const result = await pool.query(query, [nome_ponto.trim(), id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      console.log('✅ Nome do ponto atualizado:', result.rows[0]);

      return res.status(200).json({
        success: true,
        message: 'Nome do ponto atualizado com sucesso',
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar nome do ponto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Deletar ponto de atendimento
   */
  async deletar(req, res) {
    const { id } = req.params;

    try {
      const query = `
        DELETE FROM atendimentos 
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ponto de atendimento não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ponto de atendimento deletado com sucesso',
        data: {
          atendimento: result.rows[0]
        }
      });

    } catch (error) {
      console.error('Erro ao deletar ponto de atendimento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Sincronizar pontos de atendimento baseado na configuração
   * Cria/remove pontos automaticamente conforme a configuração
   */
  async sincronizarPontos(req, res) {
    const { estabelecimentoId } = req.params;
    
    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Buscar configuração atual
      const configQuery = `
        SELECT * FROM pontos_atendimento 
        WHERE estabelecimento_id = $1
      `;
      const configResult = await client.query(configQuery, [estabelecimentoId]);
      
      if (configResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Configuração de pontos não encontrada'
        });
      }

      const config = configResult.rows[0];
      console.log('📋 Configuração encontrada:', config);

      // 2. Buscar pontos existentes
      const pontosExistentesQuery = `
        SELECT identificador FROM atendimentos 
        WHERE estabelecimento_id = $1
      `;
      const pontosExistentesResult = await client.query(pontosExistentesQuery, [estabelecimentoId]);
      const pontosExistentes = new Set(pontosExistentesResult.rows.map(row => row.identificador));

      // 3. Gerar lista de pontos que devem existir
      const pontosParaCriar = [];
      
      // Mesas
      if (config.atendimento_mesas && config.quantidade_mesas > 0) {
        for (let i = 1; i <= config.quantidade_mesas; i++) {
          const identificador = `MESA ${i}`;
          if (!pontosExistentes.has(identificador)) {
            pontosParaCriar.push({
              identificador,
              tipo: 'mesa',
              nome_ponto: identificador
            });
          }
        }
      }

      // Balcões
      if (config.atendimento_balcao && config.quantidade_balcao > 0) {
        for (let i = 1; i <= config.quantidade_balcao; i++) {
          const identificador = `BALCÃO ${i}`;
          if (!pontosExistentes.has(identificador)) {
            pontosParaCriar.push({
              identificador,
              tipo: 'balcao',
              nome_ponto: identificador
            });
          }
        }
      }

      // Comandas
      if (config.atendimento_comandas && config.quantidade_comandas > 0) {
        const prefixo = config.prefixo_comanda || 'COMANDA';
        for (let i = 1; i <= config.quantidade_comandas; i++) {
          const identificador = `${prefixo} ${i}`;
          if (!pontosExistentes.has(identificador)) {
            pontosParaCriar.push({
              identificador,
              tipo: 'comanda',
              nome_ponto: identificador
            });
          }
        }
      }

      // 4. Criar pontos que não existem
      if (pontosParaCriar.length > 0) {
        const insertQuery = `
          INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto)
          VALUES ($1, $2, 'disponivel', $3)
        `;
        
        for (const ponto of pontosParaCriar) {
          await client.query(insertQuery, [
            estabelecimentoId,
            ponto.identificador,
            '' // Nome vazio para pontos criados automaticamente
          ]);
        }
        console.log(`✅ Criados ${pontosParaCriar.length} novos pontos`);
      }

      // 5. Remover pontos que não deveriam existir
      const pontosParaRemover = [];
      
      // Verificar mesas
      if (config.atendimento_mesas) {
        const maxMesas = config.quantidade_mesas;
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith('MESA ')) {
            const numero = parseInt(identificador.replace('MESA ', ''));
            if (numero > maxMesas) {
              pontosParaRemover.push(identificador);
            }
          }
        }
      } else {
        // Se mesas desabilitadas, remover todas
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith('MESA ')) {
            pontosParaRemover.push(identificador);
          }
        }
      }

      // Verificar balcões
      if (config.atendimento_balcao) {
        const maxBalcoes = config.quantidade_balcao;
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith('BALCÃO ')) {
            const numero = parseInt(identificador.replace('BALCÃO ', ''));
            if (numero > maxBalcoes) {
              pontosParaRemover.push(identificador);
            }
          }
        }
      } else {
        // Se balcões desabilitados, remover todos
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith('BALCÃO ')) {
            pontosParaRemover.push(identificador);
          }
        }
      }

      // Verificar comandas
      if (config.atendimento_comandas) {
        const maxComandas = config.quantidade_comandas;
        const prefixo = config.prefixo_comanda || 'CMD';
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith(prefixo + ' ')) {
            const numero = parseInt(identificador.replace(prefixo + ' ', ''));
            if (numero > maxComandas) {
              pontosParaRemover.push(identificador);
            }
          }
        }
      } else {
        // Se comandas desabilitadas, remover todas
        const prefixo = config.prefixo_comanda || 'CMD';
        for (const identificador of pontosExistentes) {
          if (identificador.startsWith(prefixo + ' ')) {
            pontosParaRemover.push(identificador);
          }
        }
      }

      // Remover pontos
      if (pontosParaRemover.length > 0) {
        const deleteQuery = `
          DELETE FROM atendimentos 
          WHERE estabelecimento_id = $1 AND identificador = ANY($2)
        `;
        await client.query(deleteQuery, [estabelecimentoId, pontosParaRemover]);
        console.log(`🗑️ Removidos ${pontosParaRemover.length} pontos`);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Pontos sincronizados com sucesso',
        data: {
          criados: pontosParaCriar.length,
          removidos: pontosParaRemover.length,
          pontos_criados: pontosParaCriar,
          pontos_removidos: pontosParaRemover
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao sincronizar pontos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    } finally {
      client.release();
    }
  }

  /**
   * Limpar pontos incorretos e recriar baseado na configuração
   */
  async limparERecriarPontos(req, res) {
    const { estabelecimentoId } = req.params;
    
    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Deletar TODOS os pontos existentes do estabelecimento
      await client.query('DELETE FROM atendimentos WHERE estabelecimento_id = $1', [estabelecimentoId]);
      console.log('🗑️ Todos os pontos existentes removidos');

      // 2. Buscar configuração atual
      const configQuery = `
        SELECT * FROM pontos_atendimento 
        WHERE estabelecimento_id = $1
      `;
      const configResult = await client.query(configQuery, [estabelecimentoId]);
      
      if (configResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Configuração de pontos não encontrada'
        });
      }

      const config = configResult.rows[0];
      console.log('📋 Configuração encontrada:', config);

      // 3. Criar pontos corretos baseado na configuração
      const pontosCriados = [];
      
      // Mesas
      if (config.atendimento_mesas && config.quantidade_mesas > 0) {
        for (let i = 1; i <= config.quantidade_mesas; i++) {
          const identificador = `MESA ${i}`;
          await client.query(
            'INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto) VALUES ($1, $2, $3, $4)',
            [estabelecimentoId, identificador, 'disponivel', '']
          );
          pontosCriados.push(identificador);
        }
        console.log(`✅ Criadas ${config.quantidade_mesas} mesas`);
      }

      // Balcões
      if (config.atendimento_balcao && config.quantidade_balcao > 0) {
        for (let i = 1; i <= config.quantidade_balcao; i++) {
          const identificador = `BALCÃO ${i}`;
          await client.query(
            'INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto) VALUES ($1, $2, $3, $4)',
            [estabelecimentoId, identificador, 'disponivel', '']
          );
          pontosCriados.push(identificador);
        }
        console.log(`✅ Criados ${config.quantidade_balcao} balcões`);
      }

      // Comandas
      if (config.atendimento_comandas && config.quantidade_comandas > 0) {
        const prefixo = config.prefixo_comanda || 'CMD';
        for (let i = 1; i <= config.quantidade_comandas; i++) {
          const identificador = `${prefixo} ${i}`;
          await client.query(
            'INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto) VALUES ($1, $2, $3, $4)',
            [estabelecimentoId, identificador, 'disponivel', '']
          );
          pontosCriados.push(identificador);
        }
        console.log(`✅ Criadas ${config.quantidade_comandas} comandas`);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Pontos limpos e recriados com sucesso',
        data: {
          pontos_criados: pontosCriados,
          total_criados: pontosCriados.length
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao limpar e recriar pontos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    } finally {
      client.release();
    }
  }
}

export default new AtendimentoController();
