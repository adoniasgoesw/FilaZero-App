# Instruções para Resolver o Problema de Atendimentos

## Problema Identificado
O sistema não está salvando os atendimentos na tabela `atendimentos` devido a problemas de conexão com o banco de dados.

## Soluções

### 1. Criar a Tabela Atendimentos
Execute o seguinte SQL no seu banco de dados PostgreSQL:

```sql
-- Criar tabela atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INTEGER NOT NULL,
    identificador VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nome_ponto VARCHAR(100) NOT NULL DEFAULT ''
);

-- Adicionar constraint UNIQUE
ALTER TABLE atendimentos 
ADD CONSTRAINT IF NOT EXISTS atendimentos_identificador_estabelecimento_unique 
UNIQUE (identificador, estabelecimento_id);
```

### 2. Verificar Conexão com Banco
O servidor está tentando conectar ao PostgreSQL na porta 5432, mas parece que não está conseguindo.

**Verifique:**
- Se o PostgreSQL está rodando
- Se a porta 5432 está aberta
- Se as credenciais no arquivo `.env` estão corretas

### 3. Testar a API
Após criar a tabela, teste a API:

```bash
# Testar criação de atendimento
curl -X POST http://localhost:3002/api/atendimentos \
  -H "Content-Type: application/json" \
  -d '{
    "estabelecimento_id": 7,
    "identificador": "MESA 01",
    "nome_ponto": "Mesa 01"
  }'
```

### 4. Logs de Debug
O controlador agora tem logs detalhados que mostrarão:
- Dados recebidos
- Queries executadas
- Resultados das consultas
- Erros específicos

### 5. Arquivos Criados
- ✅ `server/controllers/AtendimentoController.js` - Controlador com logs
- ✅ `server/routes/atendimentos.js` - Rotas da API
- ✅ `client/src/services/atendimentoService.js` - Serviço frontend
- ✅ `database/create_atendimentos_simple.sql` - Script SQL simples

## Próximos Passos
1. Execute o SQL para criar a tabela
2. Verifique se o PostgreSQL está rodando
3. Teste a API com curl
4. Acesse um ponto de atendimento no frontend
5. Verifique os logs do servidor para debug






