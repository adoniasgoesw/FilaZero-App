import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Package, DollarSign, X } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const FormComplements = forwardRef(({ onSuccess, onClose, editData = null }, ref) => {
  const [formData, setFormData] = useState({
    nome: editData?.nome || '',
    valor_venda: editData?.valor_venda || '',
    valor_custo: editData?.valor_custo || ''
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome do complemento é obrigatório');
      return;
    }

    if (!formData.valor_venda || formData.valor_venda <= 0) {
      setError('Valor de venda deve ser maior que zero');
      return;
    }

    if (formData.valor_custo && formData.valor_custo < 0) {
      setError('Valor de custo não pode ser negativo');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const url = isEditing 
        ? `${API_URL}/complement/${editData.id}`
        : `${API_URL}/complement`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        estabelecimento_id: estabelecimentoId,
        valor_venda: parseFloat(formData.valor_venda),
        valor_custo: formData.valor_custo ? parseFloat(formData.valor_custo) : null
      };

      console.log('Enviando dados do complemento:', payload);
      console.log('URL:', url);
      console.log('Método:', method);
      console.log('API_URL base:', API_URL);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (data.success) {
        console.log('Complemento salvo com sucesso!');
        onSuccess?.(data.data.complemento);
        onClose?.();
      } else {
        setError(data.message || 'Erro ao salvar complemento');
      }
    } catch (error) {
      console.error('Erro ao salvar complemento:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Nome do Complemento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nome do Complemento <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome do complemento"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Valor de Venda */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Venda <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="valor_venda"
              value={formData.valor_venda}
              onChange={handleInputChange}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Valor de Custo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Custo
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="valor_custo"
              value={formData.valor_custo}
              onChange={handleInputChange}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <p className="text-xs text-gray-500">Opcional - deixe vazio se não aplicável</p>
        </div>

    </form>
  );
});

FormComplements.displayName = 'FormComplements';

export default FormComplements;
