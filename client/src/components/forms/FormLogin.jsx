import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import AcesseButton from '../buttons/Acess';
import Notification from '../elements/Notification';
import { API_URL } from '../../services/api';
import { saveUserData } from '../../services/auth';


const FormLogin = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    cpf: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  // Função para formatar CPF
  const formatCPF = (value) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitedNumbers.length <= 9) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  };

  // Função para remover formatação do CPF
  const unformatCPF = (value) => {
    return value.replace(/\D/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      // Formatar CPF para exibição
      const formattedValue = formatCPF(value);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Fazer login via API
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cpf: unformatCPF(formData.cpf), // Enviar CPF sem formatação
          senha: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Salvar dados do usuário no localStorage para login automático
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
          // Redirecionar para home após login bem-sucedido
          setTimeout(() => {
            window.location.href = '/home';
          }, 1000);
        } else {
          console.error('Erro ao salvar dados do usuário');
          setNotification({ message: 'Erro ao salvar dados do usuário', type: 'error' });
          setIsLoading(false);
        }
      } else {
        // Mostrar erro específico
        setNotification({ message: result.message || 'Erro no login', type: 'error' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setNotification({ message: 'Erro de conexão. Tente novamente.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Esqueci minha senha');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              CPF <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={16} />
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                required
              />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors z-10"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>

        <AcesseButton type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </AcesseButton>

        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            Não possui conta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              Criar conta
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

export default FormLogin;
