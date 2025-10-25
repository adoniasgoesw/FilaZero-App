import React, { useState } from 'react';
import { User, Mail, Phone, Building, FileText, Lock, Eye, EyeOff, CreditCard } from 'lucide-react';
import AcesseButton from '../buttons/Acess';
import NextButton from '../buttons/Next';
import BackButton from '../buttons/Back';
import Notification from '../elements/Notification';
import { formatWhatsApp, formatCNPJ, formatCPF, isValidEmail, isValidCNPJ, isValidCPF, isValidWhatsApp } from '../../utils/formatters';
import { API_URL } from '../../services/api';
import { saveUserData } from '../../services/auth';

const FormRegister = ({ onSwitchToLogin, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [formData, setFormData] = useState({
    // Etapa 1 - Dados pessoais
    fullName: '',
    whatsapp: '',
    email: '',
    // Etapa 2 - Estabelecimento
    businessName: '',
    cnpj: '',
    sector: '',
    // Etapa 3 - Credenciais
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação baseada no campo
    switch (name) {
      case 'whatsapp':
        formattedValue = formatWhatsApp(value);
        break;
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        break;
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 3) {
      setIsLoading(true);
      
      try {
        // Preparar dados para envio
        const registerData = {
          nomeCompleto: formData.fullName,
          whatsapp: formData.whatsapp.replace(/\D/g, ''), // Remove formatação
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação
          senha: formData.password,
          nomeEstabelecimento: formData.businessName,
          cnpj: formData.cnpj ? formData.cnpj.replace(/\D/g, '') : null, // Remove formatação, opcional
          setor: formData.sector
        };

        // Fazer requisição para a API
        const response = await fetch(`${API_URL}/registrar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData)
        });

        const result = await response.json();

        if (result.success) {
          // Salvar dados do usuário usando o sistema de autenticação
          const userData = {
            userId: result.data.usuario.id,
            establishmentId: result.data.estabelecimento.id,
            userName: result.data.usuario.nome,
            userEmail: result.data.usuario.email,
            userCPF: result.data.usuario.cpf,
            establishmentName: result.data.estabelecimento.nome
          };
          
          const saved = saveUserData(userData);
          
          if (saved) {
            // Chamar callback de sucesso para a Landing
            if (onSuccess) {
              onSuccess(result.data.usuario.nome);
            }
          } else {
            console.error('Erro ao salvar dados do usuário');
            setNotification({ message: 'Erro ao salvar dados do usuário', type: 'error' });
          }
        } else {
          // Mostrar erro
          setNotification({ message: result.message || 'Erro ao registrar conta', type: 'error' });
        }
      } catch (error) {
        console.error('Erro no registro:', error);
        setNotification({ message: 'Erro de conexão. Tente novamente.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    } else {
      handleNext();
    }
  };


  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && 
               isValidWhatsApp(formData.whatsapp) && 
               isValidEmail(formData.email);
      case 2:
        return formData.businessName && 
               formData.sector &&
               (!formData.cnpj || isValidCNPJ(formData.cnpj)); // CNPJ é opcional
      case 3:
        return isValidCPF(formData.cpf) && 
               formData.password && 
               formData.confirmPassword && 
               formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Registrar sua conta</h2>
        <p className="text-gray-600">Etapa 1 de 3 - Dados pessoais</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="text"
            name="fullName"
            placeholder="Nome completo"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="tel"
            name="whatsapp"
            placeholder="WhatsApp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dados do estabelecimento</h2>
        <p className="text-gray-600">Etapa 2 de 3 - Informações comerciais</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="text"
            name="businessName"
            placeholder="Nome do estabelecimento"
            value={formData.businessName}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>

        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="text"
            name="cnpj"
            placeholder="CNPJ (opcional)"
            value={formData.cnpj}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
          />
        </div>

        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <select
            name="sector"
            value={formData.sector}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            required
          >
            <option value="">Selecione o setor</option>
            <option value="pizzaria">Pizzaria</option>
            <option value="hamburgueria">Hamburgueria</option>
            <option value="churrascaria">Churrascaria</option>
            <option value="cafeteria">Cafeteria</option>
            <option value="sorveteria">Sorveteria</option>
            <option value="restaurante">Restaurante</option>
            <option value="lanchonete">Lanchonete</option>
            <option value="padaria">Padaria</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Criar credenciais</h2>
        <p className="text-gray-600">Etapa 3 de 3 - Dados de acesso</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirmar senha"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-red-500 text-sm">As senhas não coincidem</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex gap-4">
          {currentStep > 1 && (
            <BackButton onClick={handleBack} className="flex-1">
              Voltar
            </BackButton>
          )}
          
          {currentStep < 3 ? (
            <NextButton 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="flex-1"
            >
              Próximo
            </NextButton>
          ) : (
            <AcesseButton 
              type="submit" 
              disabled={!isStepValid() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </AcesseButton>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Já possui conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              Fazer login
            </button>
          </p>
        </div>
      </form>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default FormRegister;
