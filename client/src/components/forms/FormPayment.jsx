import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { CreditCard, DollarSign, Building } from 'lucide-react';
import { createPayment, updatePayment } from '../../services/api';

const FormPayment = forwardRef(({ onSuccess, onClose, editData = null }, ref) => {
  const [formData, setFormData] = useState({
    nome: editData?.nome || '',
    tipo: editData?.tipo || '',
    taxa: editData?.taxa || '',
    conta_bancaria: editData?.conta_bancaria || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatar taxa para aceitar apenas números e vírgula
    if (name === 'taxa') {
      // Remove tudo que não é número ou vírgula
      const cleanValue = value.replace(/[^\d,]/g, '');
      // Substitui vírgula por ponto para validação
      formattedValue = cleanValue.replace(',', '.');
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome do pagamento é obrigatório');
      return;
    }

    if (formData.taxa && (isNaN(parseFloat(formData.taxa)) || parseFloat(formData.taxa) < 0)) {
      setError('Taxa deve ser um número válido maior ou igual a zero');
      return;
    }

    try {
      setLoading(true);
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        tipo: formData.nome, // Usar nome como tipo também
        taxa: formData.taxa ? parseFloat(formData.taxa) : 0
      };

      if (isEditing) {
        // Atualizar pagamento existente
        console.log('Atualizando pagamento:', editData.id, dataToSend);
        
        const result = await updatePayment(editData.id, dataToSend);
        console.log('Resposta da API (editar):', result);

        if (result.success) {
          console.log('Pagamento atualizado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.pagamento);
          }
        } else {
          setError(result.message || 'Erro ao editar pagamento');
        }
      } else {
        // Criar novo pagamento
        console.log('Criando pagamento:', dataToSend);
        
        const result = await createPayment({
          ...dataToSend,
          estabelecimento_id: estabelecimentoId
        });
        console.log('Resposta da API (criar):', result);

        if (result.success) {
          console.log('Pagamento criado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.pagamento);
          }
          
          // Resetar formulário
          setFormData({
            nome: '',
            tipo: '',
            taxa: '',
            conta_bancaria: ''
          });
        } else {
          setError(result.message || 'Erro ao criar pagamento');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Exibir erro se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Nome do Pagamento */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome do Pagamento <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Ex: Dinheiro, PIX, Cartão de Crédito"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Taxa */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Taxa (%)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="taxa"
            value={formData.taxa}
            onChange={handleInputChange}
            placeholder="Ex: 2.5"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-gray-500">
          Deixe em branco ou 0 para pagamentos sem taxa
        </p>
      </div>

      {/* Conta Bancária */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Conta Bancária
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="conta_bancaria"
            value={formData.conta_bancaria}
            onChange={handleInputChange}
            placeholder="Ex: Banco do Brasil - Ag 1234 - CC 56789-0"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-gray-500">
          Opcional - Para pagamentos que precisam de conta bancária
        </p>
      </div>
    </form>
  );
});

export default FormPayment;