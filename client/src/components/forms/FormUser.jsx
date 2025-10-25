import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { User, CreditCard, Mail, Briefcase, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { formatCPF, formatWhatsApp, isValidCPF, isValidEmail, isValidWhatsApp } from '../../utils/formatters';
import { createUser, updateUser } from '../../services/api';

const FormUser = forwardRef(({ onSuccess, onClose, editData = null, activeTab = 'detalhes' }, ref) => {
  const [formData, setFormData] = useState({
    nome_completo: editData?.nome_completo || '',
    cpf: editData?.cpf || '',
    whatsapp: editData?.whatsapp || '',
    email: editData?.email || '',
    cargo: editData?.cargo || '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const isEditing = !!editData;

  const roles = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Gerente', label: 'Gerente' },
    { value: 'Atendente', label: 'Atendente' },
    { value: 'Caixa', label: 'Caixa' },
    { value: 'Cozinheiro', label: 'Cozinheiro' },
    { value: 'Empacotador', label: 'Empacotador' },
    { value: 'Entregador', label: 'Entregador' },
    { value: 'Garçom', label: 'Garçom' }
  ];

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Verificar se é o único administrador
  useEffect(() => {
    if (isEditing && editData?.cargo === 'Administrador') {
      // Fazer chamada para verificar quantos administradores existem
      checkAdminCount();
    }
  }, [isEditing, editData]);

  const checkAdminCount = async () => {
    try {
      // Aqui você faria uma chamada para a API para contar administradores
      // Por enquanto, vamos assumir que sempre há pelo menos 1 administrador
      setAdminCount(1);
    } catch (error) {
      console.error('Erro ao verificar contagem de administradores:', error);
    }
  };

  // Função para validar senha
  const validatePassword = (password) => {
    if (!password) return false;
    if (password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSymbols;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatar CPF automaticamente
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    }
    // Formatar WhatsApp automaticamente
    else if (name === 'whatsapp') {
      formattedValue = formatWhatsApp(value);
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
    if (!formData.nome_completo.trim()) {
      setError('Nome completo é obrigatório');
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      setError('CPF inválido');
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError('E-mail inválido');
      return;
    }

    if (formData.whatsapp && !isValidWhatsApp(formData.whatsapp)) {
      setError('WhatsApp inválido');
      return;
    }

    if (!formData.cargo) {
      setError('Cargo é obrigatório');
      return;
    }

    if (!isEditing && !formData.senha) {
      setError('Senha é obrigatória');
      return;
    }

    if (formData.senha && !validatePassword(formData.senha)) {
      setError('Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo');
      return;
    }

    try {
      setLoading(true);
      
      const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : null
      };

      if (isEditing) {
        // Atualizar usuário existente
        console.log('Atualizando usuário:', editData.id, dataToSend);
        
        const result = await updateUser(editData.id, dataToSend);
        console.log('Resposta da API (editar):', result);

        if (result.success) {
          console.log('Usuário atualizado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.usuario);
          }
        } else {
          setError(result.message || 'Erro ao editar usuário');
        }
      } else {
        // Criar novo usuário
        console.log('Criando usuário:', dataToSend);
        
        const result = await createUser({
          ...dataToSend,
          estabelecimento_id: estabelecimentoId
        });
        console.log('Resposta da API (criar):', result);

        if (result.success) {
          console.log('Usuário criado com sucesso');
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.usuario);
          }
          
          // Resetar formulário
          setFormData({
            nome_completo: '',
            cpf: '',
            whatsapp: '',
            email: '',
            cargo: '',
            senha: ''
          });
        } else {
          setError(result.message || 'Erro ao criar usuário');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
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

      {/* Conteúdo das abas */}
      {activeTab === 'detalhes' && (
        <div className="space-y-6">
          {/* Nome Completo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome Completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="nome_completo"
            value={formData.nome_completo}
            onChange={handleInputChange}
            placeholder="Digite o nome completo"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* CPF */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          CPF <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
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
          WhatsApp
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
            disabled={loading}
          />
        </div>
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          E-mail
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
            disabled={loading}
          />
        </div>
      </div>

      {/* Cargo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cargo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            name="cargo"
            value={formData.cargo}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white ${
              isEditing && editData?.cargo === 'Administrador' && adminCount === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            required
            disabled={loading || (isEditing && editData?.cargo === 'Administrador' && adminCount === 1)}
          >
            <option value="">Selecione o cargo</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        {isEditing && editData?.cargo === 'Administrador' && adminCount === 1 && (
          <p className="text-sm text-gray-500">
            Não é possível alterar o cargo do único administrador do sistema
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Senha {!isEditing && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="senha"
            value={formData.senha}
            onChange={handleInputChange}
            placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={!isEditing}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {formData.senha && !validatePassword(formData.senha) && (
          <p className="text-sm text-red-500">
            Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo
          </p>
        )}
      </div>
        </div>
      )}

      {/* Aba Permissões */}
      {activeTab === 'permissoes' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Permissões</h3>
            <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      )}
    </form>
  );
});

export default FormUser;
