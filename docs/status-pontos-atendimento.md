# Status de Pontos de Atendimento

Este documento descreve os quatro status implementados para pontos de atendimento.

## Status Disponíveis

### 1. Disponível
- **Nome**: `disponivel`
- **Cor**: Cinza (`bg-gray-100 text-gray-600`)
- **Ícone**: CheckCircle (✓)
- **Descrição**: Ponto disponível para atendimento

### 2. Aberto
- **Nome**: `aberto`
- **Cor**: Azul (`bg-blue-100 text-blue-800`)
- **Ícone**: Unlock (🔓)
- **Descrição**: Ponto aberto e pronto para uso

### 3. Ocupado
- **Nome**: `ocupado`
- **Cor**: Verde (`bg-green-100 text-green-800`)
- **Ícone**: Users (👥)
- **Descrição**: Ponto ocupado por cliente

### 4. Em Atendimento
- **Nome**: `em_atendimento`
- **Cor**: Roxo (`bg-purple-100 text-purple-800`)
- **Ícone**: Lock (🔒)
- **Descrição**: Ponto em atendimento ativo

## Implementação no Banco de Dados

Execute o script SQL localizado em `database/migration_status_pontos.sql` para criar a tabela e inserir os status.

## Uso no Frontend

Os status são utilizados automaticamente no componente `ListPontosAtendimento` e podem ser acessados através do serviço `statusPontosAtendimento.js`.

## Estrutura da Tabela

```sql
CREATE TABLE status_pontos_atendimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(20) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```






