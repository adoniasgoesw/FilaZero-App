import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import {
  validateCPF,
  validateCNPJ,
  validateWhatsApp,
  validateEmail,
  validatePassword,
  checkCPFExists,
  checkCNPJExists,
  checkEmailExists
} from '../utils/validators.js';

export const registerUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      // Dados do usuário (etapa 1 e 3)
      nomeCompleto,
      whatsapp,
      email,
      cpf,
      senha,
      // Dados do estabelecimento (etapa 2)
      nomeEstabelecimento,
      cnpj,
      setor
    } = req.body;

    // Validações obrigatórias
    if (!nomeCompleto || !whatsapp || !email || !cpf || !senha || !nomeEstabelecimento || !setor) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Validação de CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Validação de WhatsApp
    if (!validateWhatsApp(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp inválido. Use um DDD brasileiro válido'
      });
    }

    // Validação de Email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validação de Senha
    if (!validatePassword(senha)) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo'
      });
    }

    // Validação de CNPJ (opcional)
    if (cnpj && !validateCNPJ(cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido'
      });
    }

    // Verificar se CPF já existe
    if (await checkCPFExists(pool, cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Verificar se email já existe
    if (await checkEmailExists(pool, email)) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verificar se CNPJ já existe (apenas se fornecido)
    if (cnpj && await checkCNPJExists(pool, cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // 1. Criar estabelecimento
    const estabelecimentoQuery = `
      INSERT INTO estabelecimentos (nome, cnpj, setor, plano_atual, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const estabelecimentoValues = [
      nomeEstabelecimento,
      cnpj || null, // CNPJ é opcional
      setor,
      'gratuito',
      true
    ];

    const estabelecimentoResult = await client.query(estabelecimentoQuery, estabelecimentoValues);
    const estabelecimentoId = estabelecimentoResult.rows[0].id;

    // 2. Criar usuário
    const usuarioQuery = `
      INSERT INTO usuarios (estabelecimento_id, nome_completo, email, whatsapp, cpf, senha, cargo, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nome_completo, email, whatsapp, cpf, cargo
    `;
    
    const usuarioValues = [
      estabelecimentoId,
      nomeCompleto,
      email,
      whatsapp,
      cpf,
      hashedPassword,
      'Administrador',
      true
    ];

    const usuarioResult = await client.query(usuarioQuery, usuarioValues);
    const usuario = usuarioResult.rows[0];

    await client.query('COMMIT');

    // Retornar sucesso com dados do usuário
    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome_completo,
          email: usuario.email,
          whatsapp: usuario.whatsapp,
          cargo: usuario.cargo
        },
        estabelecimento: {
          id: estabelecimentoId,
          nome: nomeEstabelecimento,
          setor: setor
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no registro:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

