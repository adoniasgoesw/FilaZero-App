import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validateCPF } from '../utils/validators.js';

export const loginUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { cpf, senha } = req.body;

    // Validações obrigatórias
    if (!cpf || !senha) {
      return res.status(400).json({
        success: false,
        message: 'CPF e senha são obrigatórios'
      });
    }

    // Validação de CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Buscar usuário pelo CPF
    const userQuery = `
      SELECT 
        u.id,
        u.nome_completo,
        u.email,
        u.whatsapp,
        u.cpf,
        u.senha,
        u.cargo,
        u.status,
        u.estabelecimento_id,
        e.nome as estabelecimento_nome,
        e.setor as estabelecimento_setor
      FROM usuarios u
      INNER JOIN estabelecimentos e ON u.estabelecimento_id = e.id
      WHERE u.cpf = $1
    `;

    const userResult = await client.query(userQuery, [cpf]);

    // Verificar se usuário existe
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'CPF não cadastrado'
      });
    }

    const user = userResult.rows[0];

    // Verificar se usuário está ativo
    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o suporte'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Login bem-sucedido - retornar dados do usuário
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        usuario: {
          id: user.id,
          nome: user.nome_completo,
          email: user.email,
          whatsapp: user.whatsapp,
          cpf: user.cpf,
          cargo: user.cargo
        },
        estabelecimento: {
          id: user.estabelecimento_id,
          nome: user.estabelecimento_nome,
          setor: user.estabelecimento_setor
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};


























