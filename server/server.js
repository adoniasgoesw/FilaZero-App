import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AuthRouters from './routes/AuthRouters.js';
import atendimentosRouter from './routes/atendimentos.js';
import pedidosRouter from './routes/pedidos.js';
import itensPedidoRouter from './routes/itensPedidoRoutes.js';
import descontoAcrescimoRouter from './routes/descontoAcrescimo.js';
import pagamentosRouter from './routes/pagamentos.js';
import pedidosPagamentosRouter from './routes/pedidosPagamentos.js';
import finalizarPedidoRouter from './routes/finalizarPedido.js';
import { testarTabelaAtendimentos } from './controllers/TestController.js';
import pool from './config/db.js';
import config from './config/environments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = config.PORT;

// Middlewares
app.use(cors({
  origin: true, // Permitir todas as origens em desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
}));
app.use(express.json());

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api', AuthRouters);
app.use('/api/atendimentos', atendimentosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/itens-pedido', itensPedidoRouter);
app.use('/api', descontoAcrescimoRouter);
app.use('/api', pagamentosRouter);
app.use('/api/pedidos-pagamentos', pedidosPagamentosRouter);
app.use('/api/finalizar-pedido', finalizarPedidoRouter);

// Rota de teste para verificar tabela atendimentos
app.get('/api/test-atendimentos', testarTabelaAtendimentos);

// Teste de conexão com DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true,
      db_time: result.rows[0],
      environment: process.env.NODE_ENV || 'development',
      api_url: config.API_URL
    });
  } catch (err) {
    console.error('Erro no banco de dados:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erro no banco de dados',
      details: err.message
    });
  }
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    api_url: config.API_URL,
    frontend_url: config.FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em ${config.API_URL} (porta ${PORT})`);
  console.log(`🌐 Frontend: ${config.FRONTEND_URL}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
