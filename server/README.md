# FilaZero - Backend

## Configuração do Banco de Dados

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do servidor com:
```
DATABASE_URL=postgresql://neondb_owner:npg_84GYtriPbVpn@ep-bold-bar-aedo5ydc-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3002
FRONTEND_URL=http://localhost:5173
```

### 3. Executar o servidor

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm start
```

## Testes de Conexão

### Testar API
- GET `/api/status` - Status da API
- GET `/api/test-db` - Teste de conexão com banco

### URLs
- **Desenvolvimento**: http://localhost:3002/api
- **Produção**: https://filazero-sistema-de-gestao.onrender.com/api

## Estrutura
```
server/
├── config/
│   ├── db.js              # Configuração do banco
│   └── environments.js    # Configurações de ambiente
├── routes/
│   └── AuthRouters.js     # Rotas de autenticação
├── server.js              # Servidor principal
└── package.json
```

