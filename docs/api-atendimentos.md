# API de Atendimentos

Documentação das rotas para gerenciar pontos de atendimento.

## Base URL
```
http://localhost:3002/api/atendimentos
```

## Rotas

### 1. Criar ou Buscar Ponto de Atendimento
**POST** `/api/atendimentos`

Cria um novo ponto de atendimento se não existir, ou retorna o existente.

#### Request Body
```json
{
  "estabelecimento_id": 7,
  "identificador": "MESA 01",
  "nome_ponto": "Mesa 01" // opcional
}
```

#### Response (201 - Criado)
```json
{
  "success": true,
  "message": "Ponto de atendimento criado com sucesso",
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "aberto",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T13:45:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

#### Response (200 - Existente)
```json
{
  "success": true,
  "message": "Ponto de atendimento encontrado e atualizado",
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "aberto",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T14:30:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

### 2. Atualizar Status
**PUT** `/api/atendimentos/:id/status`

Atualiza o status de um ponto de atendimento.

#### Request Body
```json
{
  "status": "ocupado"
}
```

#### Status Válidos
- `disponivel` - Cinza, ícone CheckCircle
- `aberto` - Azul, ícone Unlock
- `ocupado` - Verde, ícone Users
- `em_atendimento` - Roxo, ícone Lock

#### Response (200)
```json
{
  "success": true,
  "message": "Status atualizado com sucesso",
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "ocupado",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T14:30:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

### 3. Buscar por ID
**GET** `/api/atendimentos/:id`

Busca um ponto de atendimento pelo ID.

#### Response (200)
```json
{
  "success": true,
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "aberto",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T14:30:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

### 4. Buscar por Identificador
**GET** `/api/atendimentos/:identificador/:estabelecimento_id`

Busca um ponto de atendimento pelo identificador e estabelecimento.

#### Exemplo
```
GET /api/atendimentos/MESA%2001/7
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "aberto",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T14:30:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

### 5. Listar por Estabelecimento
**GET** `/api/atendimentos/estabelecimento/:estabelecimento_id`

Lista todos os pontos de atendimento de um estabelecimento.

#### Response (200)
```json
{
  "success": true,
  "data": {
    "atendimentos": [
      {
        "id": 1,
        "estabelecimento_id": 7,
        "identificador": "MESA 01",
        "status": "aberto",
        "criado_em": "2025-01-20T13:45:00Z",
        "atualizado_em": "2025-01-20T14:30:00Z",
        "nome_ponto": "Mesa 01"
      }
    ],
    "total": 1
  }
}
```

### 6. Deletar Ponto
**DELETE** `/api/atendimentos/:id`

Deleta um ponto de atendimento.

#### Response (200)
```json
{
  "success": true,
  "message": "Ponto de atendimento deletado com sucesso",
  "data": {
    "atendimento": {
      "id": 1,
      "estabelecimento_id": 7,
      "identificador": "MESA 01",
      "status": "aberto",
      "criado_em": "2025-01-20T13:45:00Z",
      "atualizado_em": "2025-01-20T14:30:00Z",
      "nome_ponto": "Mesa 01"
    }
  }
}
```

## Regras de Negócio

### 1. Criação Única
- Cada `identificador + estabelecimento_id` é único
- Se tentar criar duplicata, retorna erro 409
- Se não existir, cria novo registro
- Se existir, retorna o existente e atualiza `atualizado_em`

### 2. Status Padrão
- Novo ponto sempre inicia com status `aberto`
- Status válidos: `disponivel`, `aberto`, `ocupado`, `em_atendimento`

### 3. Timestamps
- `criado_em`: Definido na criação
- `atualizado_em`: Atualizado automaticamente a cada modificação

## Códigos de Erro

- **400**: Dados obrigatórios ausentes ou status inválido
- **404**: Ponto de atendimento não encontrado
- **409**: Identificador já existe para o estabelecimento
- **500**: Erro interno do servidor






