import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para Neon DB
  },
});

pool.on('connect', () => {
  console.log('🟢 Conectado ao banco de dados com sucesso!');
});

export default pool;
