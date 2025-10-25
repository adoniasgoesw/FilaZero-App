# 🎨 Sistema de Diálogos e Cores - ConfirmDialog

## 📋 Visão Geral

O `ConfirmDialog` agora suporta um sistema completo de cores e tipos baseado no contexto da ação. Cada tipo tem sua cor específica, ícone e estilo de botão.

## 🎯 Tipos de Diálogo Disponíveis

### 🔴 **Erro / Exclusão** (`error`, `delete`)
- **Uso:** Deletar pedidos, produtos, usuários, clientes, pagamentos, categorias, compramentos
- **Ícone:** 🗑️ Trash2 (vermelho)
- **Botão:** Vermelho
- **Fundo do ícone:** Vermelho claro

```jsx
<ConfirmDialog
  type="delete"
  title="Excluir Pedido"
  message="Tem certeza que deseja excluir este pedido?"
  confirmText="Excluir"
  // ... outras props
/>
```

### 🔵 **Confirmação / Cadastro / Finalização** (`confirm`, `create`, `finalize`)
- **Uso:** Finalizar pedidos, cadastrar clientes, confirmar ações
- **Ícone:** ✅ CheckCircle (azul)
- **Botão:** Azul
- **Fundo do ícone:** Azul claro

```jsx
<ConfirmDialog
  type="finalize"
  title="Finalizar Pedido"
  message="Deseja finalizar este pedido?"
  confirmText="Finalizar"
  // ... outras props
/>
```

### 🟡 **Avisos / Alertas leves** (`warning`, `alert`)
- **Uso:** Caixa aberto há muito tempo, avisos do sistema
- **Ícone:** ⚠️ AlertCircle (amarelo)
- **Botão:** Amarelo
- **Fundo do ícone:** Amarelo claro

```jsx
<ConfirmDialog
  type="warning"
  title="Aviso"
  message="Caixa aberto há mais de 24h."
  confirmText="OK"
  // ... outras props
/>
```

### 🟢 **Sucesso / Operação concluída** (`success`)
- **Uso:** Cadastro salvo, pedido concluído, atualização feita
- **Ícone:** ✨ Sparkles (verde)
- **Botão:** Verde
- **Fundo do ícone:** Verde claro

```jsx
<ConfirmDialog
  type="success"
  title="Sucesso"
  message="Pedido finalizado com sucesso."
  confirmText="Fechar"
  // ... outras props
/>
```

### 🟣 **Informações / Detalhes** (`info`)
- **Uso:** Mostrar informações extras, detalhes técnicos, logs
- **Ícone:** ℹ️ Info (roxo)
- **Botão:** Roxo
- **Fundo do ícone:** Roxo claro

```jsx
<ConfirmDialog
  type="info"
  title="Informações"
  message="Detalhes do sistema..."
  confirmText="Entendi"
  // ... outras props
/>
```

### ⚫ **Neutro / Carregando / Padrão** (`neutral`, `loading`)
- **Uso:** Operações em progresso, confirmação neutra
- **Ícone:** ⏳ Loader2 (cinza)
- **Botão:** Cinza
- **Fundo do ícone:** Cinza claro

```jsx
<ConfirmDialog
  type="loading"
  title="Processando"
  message="Carregando pedido..."
  confirmText="OK"
  // ... outras props
/>
```

### 🩵 **Sugestões / Dicas** (`tip`, `suggestion`)
- **Uso:** Dicas de uso, boas práticas, onboarding
- **Ícone:** 💡 Lightbulb (ciano)
- **Botão:** Ciano
- **Fundo do ícone:** Ciano claro

```jsx
<ConfirmDialog
  type="tip"
  title="Dica"
  message="Você pode usar atalhos de teclado para agilizar o trabalho."
  confirmText="Entendi"
  // ... outras props
/>
```

### 🟤 **Avisos administrativos** (`admin`, `technical`)
- **Uso:** Avisos do sistema, manutenção, logs internos
- **Ícone:** 🔧 Wrench (laranja)
- **Botão:** Laranja
- **Fundo do ícone:** Laranja claro

```jsx
<ConfirmDialog
  type="admin"
  title="Manutenção"
  message="Sistema em manutenção programada."
  confirmText="OK"
  // ... outras props
/>
```

### ⚪ **Padrão minimalista** (`default`)
- **Uso:** Quando não há necessidade de destacar emoção
- **Ícone:** 📄 FileText (cinza)
- **Botão:** Cinza
- **Fundo do ícone:** Cinza claro

```jsx
<ConfirmDialog
  type="default"
  title="Confirmar"
  message="Deseja continuar?"
  confirmText="Sim"
  // ... outras props
/>
```

## 🎨 Cores Personalizadas

Você também pode usar cores personalizadas através da prop `customButtonColor`:

```jsx
<ConfirmDialog
  customButtonColor="purple"
  customIconColor="green"
  // ... outras props
/>
```

## 📱 Exemplo de Uso Completo

```jsx
// Exclusão de pedido (vermelho)
<ConfirmDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDeletePedido}
  type="delete"
  title="Excluir Pedido"
  message="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
  confirmText="Excluir"
  cancelText="Cancelar"
/>

// Finalização de pedido (azul)
<ConfirmDialog
  isOpen={showFinalizeDialog}
  onClose={() => setShowFinalizeDialog(false)}
  onConfirm={handleFinalizePedido}
  type="finalize"
  title="Finalizar Pedido"
  message="Deseja finalizar este pedido?"
  confirmText="Finalizar"
  cancelText="Cancelar"
/>

// Sucesso (verde)
<ConfirmDialog
  isOpen={showSuccessDialog}
  onClose={() => setShowSuccessDialog(false)}
  onConfirm={() => setShowSuccessDialog(false)}
  type="success"
  title="Sucesso"
  message="Pedido finalizado com sucesso!"
  confirmText="Fechar"
/>
```

## 🔧 Implementação nos Componentes

### Para Exclusões (Vermelho):
```jsx
<ConfirmDialog
  type="delete"
  title="Excluir Pedido"
  message="Tem certeza que deseja excluir este pedido?"
  confirmText="Excluir"
  // ... outras props
/>
```

### Para Finalizações (Azul):
```jsx
<ConfirmDialog
  type="finalize"
  title="Finalizar Pedido"
  message="Deseja finalizar este pedido?"
  confirmText="Finalizar"
  // ... outras props
/>
```

## 🎯 Benefícios

1. **Consistência Visual:** Cada tipo de ação tem sua cor específica
2. **Melhor UX:** Usuários associam cores a tipos de ação
3. **Acessibilidade:** Diferentes cores ajudam na identificação
4. **Manutenibilidade:** Sistema centralizado de cores
5. **Escalabilidade:** Fácil adicionar novos tipos

## 📝 Notas Importantes

- O sistema é retrocompatível com o `type="warning"` antigo
- Cores são aplicadas automaticamente baseadas no tipo
- Ícones e fundos são coordenados com as cores dos botões
- Todos os tipos mantêm o mesmo layout e comportamento
