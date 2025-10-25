import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { DollarSign, Calculator, Plus, X } from 'lucide-react';
import CloseButton from '../buttons/Close';
import { API_URL } from '../../services/api';

const FormCaixa = forwardRef(({ onSuccess, onClose, editData = null }, ref) => {
  const [formData, setFormData] = useState({
    valor_total: editData?.valor_total || '',
    valor_abertura: editData?.valor_abertura || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCedulas, setShowCedulas] = useState(false);
  const [cedulas, setCedulas] = useState({
    '1': 0,    // R$ 1,00
    '2': 0,    // R$ 2,00
    '5': 0,    // R$ 5,00
    '10': 0,   // R$ 10,00
    '20': 0,   // R$ 20,00
    '50': 0,   // R$ 50,00
    '100': 0,  // R$ 100,00
    '200': 0,  // R$ 200,00
    '0.01': 0, // R$ 0,01
    '0.05': 0, // R$ 0,05
    '0.10': 0, // R$ 0,10
    '0.25': 0, // R$ 0,25
    '0.50': 0  // R$ 0,50
  });
  const isEditing = !!editData;

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Converte para centavos e formata
    const amount = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Função para extrair valor numérico da string formatada
  const parseCurrency = (formattedValue) => {
    return formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
  };

  // Calcular valor total das cédulas
  const calculateCedulasValue = () => {
    let total = 0;
    Object.entries(cedulas).forEach(([valor, quantidade]) => {
      total += parseFloat(valor) * quantidade;
    });
    return total;
  };

  // Atualizar valor de abertura baseado no valor total + cédulas (se abertas)
  const updateValorAbertura = (valorTotal) => {
    const valorTotalNumerico = parseFloat(parseCurrency(valorTotal)) || 0;
    const valorCedulas = showCedulas ? calculateCedulasValue() : 0;
    const valorAbertura = valorTotalNumerico + valorCedulas;
    
    setFormData(prev => ({
      ...prev,
      valor_abertura: formatCurrency((valorAbertura * 100).toString())
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valor_total') {
      const formattedValue = formatCurrency(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      updateValorAbertura(formattedValue);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleCedulaChange = (valor, quantidade) => {
    const newQuantidade = parseInt(quantidade) || 0;
    setCedulas(prev => ({
      ...prev,
      [valor]: newQuantidade
    }));
    
    // Só calcular se as cédulas estiverem abertas
    if (showCedulas) {
      const valorTotalNumerico = parseFloat(parseCurrency(formData.valor_total)) || 0;
      const valorCedulas = calculateCedulasValueWithNewQuantidade(valor, newQuantidade);
      const valorAbertura = valorTotalNumerico + valorCedulas;
      
      setFormData(prev => ({
        ...prev,
        valor_abertura: formatCurrency((valorAbertura * 100).toString())
      }));
    }
  };

  // Função auxiliar para calcular valor das cédulas com uma quantidade específica
  const calculateCedulasValueWithNewQuantidade = (valorChanged, newQuantidade) => {
    let total = 0;
    Object.entries(cedulas).forEach(([valor, quantidade]) => {
      if (valor === valorChanged) {
        total += parseFloat(valor) * newQuantidade;
      } else {
        total += parseFloat(valor) * quantidade;
      }
    });
    return total;
  };

  const toggleCedulas = () => {
    if (showCedulas) {
      // Fechando as cédulas - limpar todas as cédulas
      setCedulas({
        '1': 0,    // R$ 1,00
        '2': 0,    // R$ 2,00
        '5': 0,    // R$ 5,00
        '10': 0,   // R$ 10,00
        '20': 0,   // R$ 20,00
        '50': 0,   // R$ 50,00
        '100': 0,  // R$ 100,00
        '200': 0,  // R$ 200,00
        '0.01': 0, // R$ 0,01
        '0.05': 0, // R$ 0,05
        '0.10': 0, // R$ 0,10
        '0.25': 0, // R$ 0,25
        '0.50': 0  // R$ 0,50
      });
      
      // Recalcular valor de abertura apenas com valor total
      const valorTotalNumerico = parseFloat(parseCurrency(formData.valor_total)) || 0;
      setFormData(prev => ({
        ...prev,
        valor_abertura: formatCurrency((valorTotalNumerico * 100).toString())
      }));
    }
    
    setShowCedulas(!showCedulas);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validações
    if (!formData.valor_total.trim()) {
      setError('Valor total é obrigatório');
      return;
    }

    // Validar se o valor é maior que zero
    const valorNumerico = parseFloat(parseCurrency(formData.valor_total));
    if (valorNumerico <= 0) {
      setError('Valor total deve ser maior que zero');
      return;
    }

    try {
      setLoading(true);
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      const abertoPor = 1; // TODO: Pegar do contexto de auth (ID do usuário logado)
      
      if (isEditing) {
        // Atualizar caixa existente
        console.log('Atualizando caixa:', editData.id);
        
        const response = await fetch(`${API_URL}/caixa/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor_abertura: valorNumerico,
            aberto_por: abertoPor
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Caixa atualizado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.caixa);
          }
        } else {
          setError(result.message || 'Erro ao atualizar caixa');
        }
      } else {
        // Criar novo caixa
        console.log('Criando caixa:', {
          estabelecimento_id: estabelecimentoId,
          valor_abertura: valorNumerico,
          aberto_por: abertoPor
        });
        
        const response = await fetch(`${API_URL}/caixa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estabelecimento_id: estabelecimentoId,
            valor_abertura: valorNumerico,
            aberto_por: abertoPor
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Caixa criado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.caixa);
          }
          
          // Resetar formulário
          setFormData({
            valor_total: '',
            valor_abertura: ''
          });
        } else {
          setError(result.message || 'Erro ao criar caixa');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar caixa:', err);
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

      {/* Valores lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valor Total */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor Total <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="valor_total"
              value={formData.valor_total}
              onChange={handleInputChange}
              placeholder="R$ 0,00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Valor de Abertura */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Abertura
          </label>
          <div className="relative">
            <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="valor_abertura"
              value={formData.valor_abertura}
              onChange={handleInputChange}
              placeholder="R$ 0,00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              disabled={true}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Botão Adicionar Cédulas */}
      <div className="w-full">
        <button
          type="button"
          onClick={toggleCedulas}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 font-medium rounded-xl transition-all duration-200"
        >
          {showCedulas ? <X size={20} /> : <Plus size={20} />}
          {showCedulas ? 'Fechar Cédulas' : 'Adicionar Cédulas'}
        </button>
      </div>

      {/* Seção de Cédulas */}
      {showCedulas && (
        <div className="space-y-4">
          {/* Header da seção de cédulas */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Cédulas</h3>
          </div>

          {/* Grid de cédulas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(cedulas).map(([valor, quantidade]) => (
              <div key={valor} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  R$ {parseFloat(valor).toFixed(2).replace('.', ',')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={quantidade}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Se o valor começar com 0 e tiver mais de 1 dígito, remover o 0
                      const cleanValue = value.startsWith('0') && value.length > 1 ? value.slice(1) : value;
                      handleCedulaChange(valor, cleanValue);
                    }}
                    onFocus={(e) => {
                      // Selecionar todo o texto quando focar no input
                      e.target.select();
                    }}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Total: R$ {(parseFloat(valor) * quantidade).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
});

FormCaixa.displayName = 'FormCaixa';

export default FormCaixa;
