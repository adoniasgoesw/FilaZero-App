import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Coffee, Utensils, ClipboardList } from 'lucide-react';
import { 
  buscarConfiguracaoPontosAtendimento,
  atualizarConfiguracaoPontosAtendimento
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Notification from '../elements/Notification';

const FormConfig = forwardRef(({ onSuccess, onClose }, ref) => {
  const { userData: user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  const [configData, setConfigData] = useState({
    // Balcões
    balconiesEnabled: false,
    balconiesQuantity: 0,
    
    // Mesas
    tablesEnabled: false,
    tablesQuantity: 0,
    
    // Comandas
    comandasEnabled: false,
    comandasQuantity: 0,
  });

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Função de submit para salvar no banco
  const handleSubmit = async () => {
    if (!user?.establishmentId) return;
    
    // Validar se pelo menos um tipo está ativo
    const tiposAtivos = [
      configData.balconiesEnabled,
      configData.tablesEnabled,
      configData.comandasEnabled
    ].filter(Boolean).length;
    
    if (tiposAtivos === 0) {
      setNotification({ type: 'error', message: 'Pelo menos um tipo de ponto de atendimento deve estar ativo!' });
      return;
    }
    
    // Validar campos obrigatórios
    const camposVazios = [];
    
    if (configData.balconiesEnabled && (!configData.balconiesQuantity || configData.balconiesQuantity === '' || configData.balconiesQuantity < 1)) {
      camposVazios.push('balcões');
    }
    
    if (configData.tablesEnabled && (!configData.tablesQuantity || configData.tablesQuantity === '' || configData.tablesQuantity < 1)) {
      camposVazios.push('mesas');
    }
    
    if (configData.comandasEnabled) {
      if (!configData.comandasQuantity || configData.comandasQuantity === '' || configData.comandasQuantity < 1) {
        camposVazios.push('comandas');
      }
    }
    
    // Validação adicional: garantir que valores 0 sejam rejeitados
    if (configData.balconiesEnabled && configData.balconiesQuantity === 0) {
      camposVazios.push('balcões');
    }
    
    if (configData.tablesEnabled && configData.tablesQuantity === 0) {
      camposVazios.push('mesas');
    }
    
    if (configData.comandasEnabled && configData.comandasQuantity === 0) {
      camposVazios.push('comandas');
    }
    
    // Se há campos vazios, mostrar notificação de aviso
    if (camposVazios.length > 0) {
      const camposTexto = camposVazios.join(', ');
      setNotification({ 
        type: 'warning', 
        message: `Preencha a quantidade de ${camposTexto}` 
      });
      return;
    }
    
    setLoading(true);
    try {
      const dataToSend = {
        atendimento_mesas: Boolean(configData.tablesEnabled),
        atendimento_balcao: Boolean(configData.balconiesEnabled),
        atendimento_comandas: Boolean(configData.comandasEnabled),
        quantidade_mesas: parseInt(configData.tablesQuantity) || 0,
        quantidade_balcao: parseInt(configData.balconiesQuantity) || 0,
        quantidade_comandas: parseInt(configData.comandasQuantity) || 0,
        prefixo_comanda: ''
      };

      console.log('Dados sendo enviados para atualização:', dataToSend);
      console.log('Estado atual do configData:', configData);

      const response = await atualizarConfiguracaoPontosAtendimento(user.establishmentId, dataToSend);
      
      if (response.success) {
        setNotification({ type: 'success', message: 'Configuração salva com sucesso!' });
        if (onSuccess) {
          onSuccess(response.data);
        }
        if (onClose) {
          onClose();
        }
      } else {
        setNotification({ type: 'error', message: response.message || 'Erro ao salvar configuração' });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setNotification({ type: 'error', message: 'Erro ao salvar configuração' });
    } finally {
      setLoading(false);
    }
  };

  // Carregar configuração existente
  useEffect(() => {
    const carregarConfiguracao = async () => {
      if (!user?.establishmentId) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await buscarConfiguracaoPontosAtendimento(user.establishmentId);
        
        if (response.success) {
          const config = response.data;
          setConfigData({
            balconiesEnabled: config.atendimento_balcao || false,
            balconiesQuantity: config.quantidade_balcao || 0,
            tablesEnabled: config.atendimento_mesas || false,
            tablesQuantity: config.quantidade_mesas || 0,
            comandasEnabled: config.atendimento_comandas || false,
            comandasQuantity: config.quantidade_comandas || 0,
          });
        } else {
          setNotification({ type: 'error', message: response.message || 'Erro ao carregar configuração' });
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        setNotification({ type: 'error', message: 'Erro ao carregar configuração' });
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracao();
  }, [user?.establishmentId]);

  // Função para alternar status (apenas estado local)
  const toggleStatus = (type) => {
    const newConfigData = { ...configData };
    
    // Contar quantos tipos estão ativos atualmente
    const tiposAtivos = [
      newConfigData.balconiesEnabled,
      newConfigData.tablesEnabled,
      newConfigData.comandasEnabled
    ].filter(Boolean).length;
    
    switch (type) {
      case 'balconies':
        // Se está tentando desativar e só tem 1 tipo ativo, não permitir
        if (newConfigData.balconiesEnabled && tiposAtivos === 1) {
          return; // Não permite desativar se é o único ativo
        }
        
        newConfigData.balconiesEnabled = !newConfigData.balconiesEnabled;
        if (newConfigData.balconiesEnabled) {
          newConfigData.balconiesQuantity = 1; // Mínimo é 1
        } else {
          newConfigData.balconiesQuantity = 0;
        }
        break;
        
      case 'tables':
        // Se está tentando desativar e só tem 1 tipo ativo, não permitir
        if (newConfigData.tablesEnabled && tiposAtivos === 1) {
          return; // Não permite desativar se é o único ativo
        }
        
        newConfigData.tablesEnabled = !newConfigData.tablesEnabled;
        if (newConfigData.tablesEnabled) {
          newConfigData.tablesQuantity = 1; // Mínimo é 1
        } else {
          newConfigData.tablesQuantity = 0;
        }
        break;
        
      case 'comandas':
        // Se está tentando desativar e só tem 1 tipo ativo, não permitir
        if (newConfigData.comandasEnabled && tiposAtivos === 1) {
          return; // Não permite desativar se é o único ativo
        }
        
        newConfigData.comandasEnabled = !newConfigData.comandasEnabled;
        if (newConfigData.comandasEnabled) {
          newConfigData.comandasQuantity = 1; // Mínimo é 1
        } else {
          newConfigData.comandasQuantity = 0;
        }
        break;
    }
    
    setConfigData(newConfigData);
  };

  // Componente para exibir status (editável)
  const StatusDisplay = ({ enabled, type }) => {
    return (
      <button
        onClick={() => toggleStatus(type)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
          enabled ? 'bg-blue-500' : 'bg-gray-200'
        } cursor-pointer`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  // Função para atualizar quantidade (apenas estado local)
  const updateQuantity = (type, value) => {
    const newConfigData = { ...configData };
    
    // Se o campo está vazio, permitir vazio temporariamente
    if (value === '' || value === null || value === undefined) {
      switch (type) {
        case 'balconies':
          newConfigData.balconiesQuantity = '';
          break;
        case 'tables':
          newConfigData.tablesQuantity = '';
          break;
        case 'comandas':
          newConfigData.comandasQuantity = '';
          break;
      }
      setConfigData(newConfigData);
      return;
    }
    
    // Converter para número
    const quantidade = parseInt(value);
    
    // Se não for um número válido, não atualizar
    if (isNaN(quantidade)) {
      return;
    }
    
    switch (type) {
      case 'balconies':
        // Se balcões estão ativos, mínimo é 1
        if (newConfigData.balconiesEnabled) {
          newConfigData.balconiesQuantity = quantidade < 1 ? 1 : quantidade;
        } else {
          newConfigData.balconiesQuantity = quantidade;
        }
        break;
      case 'tables':
        // Se mesas estão ativas, mínimo é 1
        if (newConfigData.tablesEnabled) {
          newConfigData.tablesQuantity = quantidade < 1 ? 1 : quantidade;
        } else {
          newConfigData.tablesQuantity = quantidade;
        }
        break;
      case 'comandas':
        // Se comandas estão ativas, mínimo é 1
        if (newConfigData.comandasEnabled) {
          newConfigData.comandasQuantity = quantidade < 1 ? 1 : quantidade;
        } else {
          newConfigData.comandasQuantity = quantidade;
        }
        break;
    }
    
    setConfigData(newConfigData);
  };


  // Função para limpar campo quando focado (se valor for 1)
  const handleFocus = (type) => {
    const newConfigData = { ...configData };
    
    switch (type) {
      case 'balconies':
        if (newConfigData.balconiesQuantity === 1) {
          newConfigData.balconiesQuantity = '';
        }
        break;
      case 'tables':
        if (newConfigData.tablesQuantity === 1) {
          newConfigData.tablesQuantity = '';
        }
        break;
      case 'comandas':
        if (newConfigData.comandasQuantity === 1) {
          newConfigData.comandasQuantity = '';
        }
        break;
    }
    
    setConfigData(newConfigData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: 'success' })}
      />

      {/* Container principal em coluna */}
      <div className="space-y-3 p-4">
        
        {/* Balcões */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coffee className="text-gray-600" size={14} />
                <h3 className="text-sm font-medium text-gray-800">Balcões</h3>
              </div>
              <StatusDisplay 
                enabled={configData.balconiesEnabled}
                type="balconies"
              />
            </div>
          </div>
          
          {configData.balconiesEnabled && (
            <div className="p-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantidade de Balcões <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={configData.balconiesQuantity}
                onChange={(e) => updateQuantity('balconies', e.target.value)}
                onFocus={() => handleFocus('balconies')}
                placeholder="Digite a quantidade de balcões"
                className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 rounded-md focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Mesas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="text-gray-600" size={14} />
                <h3 className="text-sm font-medium text-gray-800">Mesas</h3>
              </div>
              <StatusDisplay 
                enabled={configData.tablesEnabled}
                type="tables"
              />
            </div>
          </div>
          
          {configData.tablesEnabled && (
            <div className="p-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantidade de Mesas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={configData.tablesQuantity}
                onChange={(e) => updateQuantity('tables', e.target.value)}
                onFocus={() => handleFocus('tables')}
                placeholder="Digite a quantidade de mesas"
                className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 rounded-md focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Comandas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="text-gray-600" size={14} />
                <h3 className="text-sm font-medium text-gray-800">Comandas</h3>
              </div>
              <StatusDisplay 
                enabled={configData.comandasEnabled}
                type="comandas"
              />
            </div>
          </div>
          
          {configData.comandasEnabled && (
            <div className="p-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantidade de Comandas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={configData.comandasQuantity}
                onChange={(e) => updateQuantity('comandas', e.target.value)}
                onFocus={() => handleFocus('comandas')}
                placeholder="Digite a quantidade de comandas"
                className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 rounded-md focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all duration-200"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

export default FormConfig;
