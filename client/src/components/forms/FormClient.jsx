import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { User, CreditCard, MapPin, Phone, Mail } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const FormClient = forwardRef(({ onSuccess, onClose, editData = null }, ref) => {
  const [formData, setFormData] = useState({
    nome: editData?.nome || '',
    cpf_cnpj: editData?.cpf_cnpj || '',
    endereco: editData?.endereco || '',
    whatsapp: editData?.whatsapp || '',
    email: editData?.email || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Função para formatar CPF/CNPJ
  const formatCPFCNPJ = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Se tem 11 dígitos ou menos, formata como CPF
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Se tem mais de 11 dígitos, formata como CNPJ
    else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Função para formatar WhatsApp
  const formatWhatsApp = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitedNumbers = numbers.slice(0, 11);
    
    // Formata como (00) 00000-0000
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatar CPF/CNPJ automaticamente
    if (name === 'cpf_cnpj') {
      const formattedValue = formatCPFCNPJ(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    // Formatar WhatsApp automaticamente
    else if (name === 'whatsapp') {
      const formattedValue = formatWhatsApp(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome do cliente é obrigatório');
      return;
    }

    try {
      setLoading(true);
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData
      };
      
      if (isEditing) {
        // Atualizar cliente existente
        console.log('Atualizando cliente:', editData.id, dataToSend);
        
        const response = await fetch(`${API_URL}/client/${editData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const result = await response.json();
        console.log('Resposta da API (editar):', result);

        if (result.success) {
          console.log('Cliente atualizado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.cliente);
          }
        } else {
          setError(result.message || 'Erro ao editar cliente');
        }
      } else {
        // Criar novo cliente
        console.log('Criando cliente:', dataToSend);
        
        const response = await fetch(`${API_URL}/client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSend,
            estabelecimento_id: estabelecimentoId
          }),
        });

        const result = await response.json();
        console.log('Resposta da API (criar):', result);

        if (result.success) {
          console.log('Cliente criado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.cliente);
          }
          
          // Resetar formulário
          setFormData({
            nome: '',
            cpf_cnpj: '',
            endereco: '',
            whatsapp: '',
            email: ''
          });
        } else {
          setError(result.message || 'Erro ao criar cliente');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
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
      {/* Nome */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome Completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite o nome completo"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* CPF/CNPJ */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          CPF ou CNPJ <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          E-mail <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Digite o e-mail"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Endereço <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleInputChange}
            placeholder="Digite o endereço completo"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>
    </form>
  );
});

export default FormClient;
