import pkg from 'pg';
const { Pool } = pkg;
import { validateCPF, validateEmail, validatePassword, validateWhatsApp, checkCPFExists, checkEmailExists } from '../utils/validators.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Buscar usuários por estabelecimento
export const getUsers = async (req, res) => {
  try {
    const { estabelecimentoId } = req.params;

    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await pool.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimentoId]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Buscar usuários do estabelecimento
    const result = await pool.query(
      `SELECT 
        id,
        nome_completo,
        email,
        whatsapp,
        cpf,
        cargo,
        status,
        criado_em
       FROM usuarios 
       WHERE estabelecimento_id = $1 
       ORDER BY criado_em DESC`,
      [estabelecimentoId]
    );

    res.json({
      success: true,
      message: 'Usuários encontrados com sucesso',
      data: {
        usuarios: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar usuário
export const createUser = async (req, res) => {
  try {
    const { 
      estabelecimento_id, 
      nome_completo, 
      email, 
      whatsapp, 
      cpf, 
      cargo, 
      senha 
    } = req.body;

    // Validações obrigatórias
    if (!estabelecimento_id || !nome_completo || !cpf || !cargo || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await pool.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimento_id]
    );

    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Validar CPF
    const cpfClean = cpf.replace(/\D/g, '');
    if (!validateCPF(cpfClean)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Verificar se CPF já existe
    if (await checkCPFExists(pool, cpfClean)) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado no sistema'
      });
    }

    // Validar e-mail (se fornecido)
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'E-mail inválido'
      });
    }

    // Verificar se email já existe (se fornecido)
    if (email && await checkEmailExists(pool, email)) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado no sistema'
      });
    }

    // Validar WhatsApp (se fornecido)
    if (whatsapp && !validateWhatsApp(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp inválido'
      });
    }

    // Validar senha
    if (!validatePassword(senha)) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'
      });
    }

    // Inserir usuário
    const result = await pool.query(
      `INSERT INTO usuarios (estabelecimento_id, nome_completo, email, whatsapp, cpf, cargo, senha, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [
        estabelecimento_id, 
        nome_completo, 
        email || null, 
        whatsapp ? whatsapp.replace(/\D/g, '') : null, 
        cpf.replace(/\D/g, ''), 
        cargo, 
        senha
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        usuario: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar usuário
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome_completo, 
      email, 
      whatsapp, 
      cpf, 
      cargo, 
      senha 
    } = req.body;

    // Buscar usuário atual
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const currentUser = userResult.rows[0];

    // Verificar se é o único administrador
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM usuarios WHERE estabelecimento_id = $1 AND cargo = $2 AND status = true',
      [currentUser.estabelecimento_id, 'Administrador']
    );

    const isOnlyAdmin = adminCount.rows[0].count === '1' && currentUser.cargo === 'Administrador';

    // Se for o único administrador, não pode alterar cargo ou desativar
    if (isOnlyAdmin && (cargo !== 'Administrador' || req.body.status === false)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar o cargo ou desativar o único administrador do sistema'
      });
    }

    // Validar CPF (se alterado)
    if (cpf) {
      const cpfClean = cpf.replace(/\D/g, '');
      if (!validateCPF(cpfClean)) {
        return res.status(400).json({
          success: false,
          message: 'CPF inválido'
        });
      }

      if (cpfClean !== currentUser.cpf) {
        if (await checkCPFExists(pool, cpfClean)) {
          return res.status(400).json({
            success: false,
            message: 'CPF já cadastrado no sistema'
          });
        }
      }
    }

    // Validar e-mail (se alterado)
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'E-mail inválido'
        });
      }

      if (email !== currentUser.email) {
        if (await checkEmailExists(pool, email)) {
          return res.status(400).json({
            success: false,
            message: 'E-mail já cadastrado no sistema'
          });
        }
      }
    }

    // Validar WhatsApp (se fornecido)
    if (whatsapp && !validateWhatsApp(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp inválido'
      });
    }

    // Validar senha (se fornecida)
    if (senha && !validatePassword(senha)) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'
      });
    }

    // Atualizar usuário
    const result = await pool.query(
      `UPDATE usuarios 
       SET nome_completo = COALESCE($1, nome_completo),
           email = COALESCE($2, email),
           whatsapp = COALESCE($3, whatsapp),
           cpf = COALESCE($4, cpf),
           cargo = COALESCE($5, cargo),
           senha = COALESCE($6, senha)
       WHERE id = $7
       RETURNING *`,
      [
        nome_completo, 
        email, 
        whatsapp ? whatsapp.replace(/\D/g, '') : whatsapp, 
        cpf ? cpf.replace(/\D/g, '') : cpf, 
        cargo, 
        senha, 
        id
      ]
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        usuario: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuário atual
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const currentUser = userResult.rows[0];

    // Verificar se é o único administrador
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM usuarios WHERE estabelecimento_id = $1 AND cargo = $2 AND status = true',
      [currentUser.estabelecimento_id, 'Administrador']
    );

    const isOnlyAdmin = adminCount.rows[0].count === '1' && currentUser.cargo === 'Administrador';

    // Se for o único administrador, não pode ser deletado
    if (isOnlyAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar o único administrador do sistema'
      });
    }

    // Deletar usuário
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
