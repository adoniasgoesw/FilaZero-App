import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { DollarSign, Calculator, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const FormCloseCaixa = forwardRef(({ onSuccess, onClose, caixaData = null }, ref) => {
  const [formData, setFormData] = useState({
    valor_total: '',
    valor_fechamento: '',
    saldo_total: caixaData?.saldo_total || 0,
    diferenca: 0
  });
  
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
  
  const [showCedulas, setShowCedulas] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Calcular valor de fechamento automaticamente
  useEffect(() => {
    const valorTotal = parseFloat(formData.valor_total) || 0;
    const totalCedulas = Object.entries(cedulas).reduce((total, [valor, quantidade]) => {
      return total + (parseFloat(valor) * parseInt(quantidade));
    }, 0);
    
    const valorFechamento = valorTotal + totalCedulas;
    // Diferença = Valor de Fechamento - Saldo Total
    // POSITIVA quando fechamento > saldo (fechamento maior que deveria)
    // NEGATIVA quando fechamento < saldo (fechamento menor que deveria)
    const diferenca = valorFechamento - (formData.saldo_total || 0);
    
    setFormData(prev => ({
      ...prev,
      valor_fechamento: valorFechamento.toFixed(2),
      diferenca: diferenca
    }));
  }, [formData.valor_total, cedulas, formData.saldo_total]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleCedulaChange = (valor, quantidade) => {
    setCedulas(prev => ({
      ...prev,
      [valor]: parseInt(quantidade) || 0
    }));
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
    }
    setShowCedulas(!showCedulas);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validações
    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      setError('Valor total é obrigatório e deve ser maior que zero');
      return;
    }

    try {
      setLoading(true);
      
      const fechadoPor = 1; // TODO: Pegar do contexto de auth
      const valorFechamento = parseFloat(formData.valor_fechamento);
      const diferenca = parseFloat(formData.diferenca);
      
      const response = await fetch(`${API_URL}/caixa/${caixaData.id}/fechar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor_fechamento: valorFechamento,
          diferenca: diferenca,
          fechado_por: fechadoPor
        }),
      });

      const result = await response.json();
      console.log('Resposta da API (fechar caixa):', result);

      if (result.success) {
        console.log('Caixa fechado com sucesso');
        
        if (onClose) {
          onClose();
        }
        
        if (onSuccess) {
          onSuccess(result.data.caixa);
        }
      } else {
        setError(result.message || 'Erro ao fechar caixa');
      }
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
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

      {/* Campos principais - 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Valor Total */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor Total <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              step="0.01"
              name="valor_total"
              value={formData.valor_total}
              onChange={handleInputChange}
              placeholder="0,00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Valor de Fechamento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Fechamento
          </label>
          <div className="relative">
            <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formatCurrency(formData.valor_fechamento)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
              disabled
            />
          </div>
        </div>

        {/* Saldo Total */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Saldo Total
          </label>
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formatCurrency(formData.saldo_total)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
              disabled
            />
          </div>
        </div>

        {/* Diferença */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Diferença
          </label>
          <div className="relative">
            <TrendingDown className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              formData.diferenca >= 0 ? 'text-green-500' : 'text-red-500'
            }`} />
            <input
              type="text"
              value={formatCurrency(formData.diferenca)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 font-semibold ${
                formData.diferenca >= 0 
                  ? 'border-green-200 text-green-600' 
                  : 'border-red-200 text-red-600'
              }`}
              disabled
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

export default FormCloseCaixa;
