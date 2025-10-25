import React from 'react';
import { 
  AlertTriangle, 
  X, 
  AlertCircle, 
  User, 
  Percent, 
  DollarSign, 
  ShoppingCart,
  CheckCircle,
  Trash2,
  XCircle,
  UserPlus,
  Save,
  Clock,
  Info,
  Sparkles,
  BookOpen,
  Loader2,
  MoreHorizontal,
  Edit,
  FileText,
  Wrench,
  Server,
  Settings,
  Lightbulb
} from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isHomePage = false,
  showInput = false,
  inputValue = "",
  onInputChange = null,
  inputPlaceholder = "Digite aqui...",
  customContent = null,
  customIcon = null,
  customIconColor = "blue",
  customButtonColor = "blue",
  // Novas props para finalizar pedido
  isFinalizarPedido = false,
  onSalvar = null,
  onImprimirSalvar = null,
  salvarText = "Salvar",
  imprimirSalvarText = "Imprimir e Salvar"
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    // Se há ícone personalizado, use ele
    if (customIcon) {
      const iconColorClass = customIconColor === 'green' ? 'text-green-500' : 
                            customIconColor === 'yellow' ? 'text-yellow-500' : 
                            customIconColor === 'red' ? 'text-red-500' : 'text-blue-500';
      return React.cloneElement(customIcon, { 
        className: `w-8 h-8 sm:w-12 sm:h-12 ${iconColorClass}` 
      });
    }
    
    // Ícones padrão baseados no tipo
    switch (type) {
      // 🔴 Vermelho - Erro / Exclusão
      case 'error':
      case 'delete':
        return <Trash2 className="w-8 h-8 sm:w-12 sm:h-12 text-red-500" />;
      
      // 🔵 Azul - Confirmação / Cadastro / Finalização
      case 'confirm':
      case 'create':
      case 'finalize':
        return <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />;
      
      // 🟡 Amarelo - Avisos / Alertas leves
      case 'warning':
      case 'alert':
        return <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />;
      
      // 🟢 Verde - Sucesso / Operação concluída
      case 'success':
        return <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />;
      
      // 🟣 Roxo - Informações / Detalhes
      case 'info':
        return <Info className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500" />;
      
      // ⚫ Cinza - Neutro / Carregando / Padrão
      case 'neutral':
      case 'loading':
        return <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />;
      
      // 🩵 Ciano - Sugestões / Dicas
      case 'tip':
      case 'suggestion':
        return <Lightbulb className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-500" />;
      
      // 🟤 Marrom - Avisos administrativos
      case 'admin':
      case 'technical':
        return <Wrench className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600" />;
      
      // ⚪ Branco - Padrão minimalista
      case 'default':
        return <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />;
      
      default:
        return <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />;
    }
  };

  const getIconBackgroundClass = () => {
    switch (type) {
      // 🔴 Vermelho - Erro / Exclusão
      case 'error':
      case 'delete':
        return 'bg-red-50';
      
      // 🔵 Azul - Confirmação / Cadastro / Finalização
      case 'confirm':
      case 'create':
      case 'finalize':
        return 'bg-blue-50';
      
      // 🟡 Amarelo - Avisos / Alertas leves
      case 'warning':
      case 'alert':
        return 'bg-yellow-50';
      
      // 🟢 Verde - Sucesso / Operação concluída
      case 'success':
        return 'bg-green-50';
      
      // 🟣 Roxo - Informações / Detalhes
      case 'info':
        return 'bg-purple-50';
      
      // ⚫ Cinza - Neutro / Carregando / Padrão
      case 'neutral':
      case 'loading':
        return 'bg-gray-50';
      
      // 🩵 Ciano - Sugestões / Dicas
      case 'tip':
      case 'suggestion':
        return 'bg-cyan-50';
      
      // 🟤 Marrom - Avisos administrativos
      case 'admin':
      case 'technical':
        return 'bg-orange-50';
      
      // ⚪ Branco - Padrão minimalista
      case 'default':
        return 'bg-gray-50';
      
      default:
        return 'bg-blue-50';
    }
  };

  const getConfirmButtonStyle = () => {
    // Se há cor personalizada, use ela (sobrescreve o tipo)
    if (customButtonColor) {
      switch (customButtonColor) {
        case 'green':
          return 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg hover:shadow-xl';
        case 'yellow':
          return 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white shadow-lg hover:shadow-xl';
        case 'red':
          return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg hover:shadow-xl';
        case 'purple':
          return 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-lg hover:shadow-xl';
        case 'gray':
          return 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-lg hover:shadow-xl';
        case 'cyan':
          return 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white shadow-lg hover:shadow-xl';
        case 'orange':
          return 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-lg hover:shadow-xl';
        default:
          return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl';
      }
    }
    
    // Cores padrão baseadas no tipo
    switch (type) {
      // 🔴 Vermelho - Erro / Exclusão
      case 'error':
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg hover:shadow-xl';
      
      // 🔵 Azul - Confirmação / Cadastro / Finalização
      case 'confirm':
      case 'create':
      case 'finalize':
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl';
      
      // 🟡 Amarelo - Avisos / Alertas leves
      case 'warning':
      case 'alert':
        return 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white shadow-lg hover:shadow-xl';
      
      // 🟢 Verde - Sucesso / Operação concluída
      case 'success':
        return 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg hover:shadow-xl';
      
      // 🟣 Roxo - Informações / Detalhes
      case 'info':
        return 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-lg hover:shadow-xl';
      
      // ⚫ Cinza - Neutro / Carregando / Padrão
      case 'neutral':
      case 'loading':
        return 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-lg hover:shadow-xl';
      
      // 🩵 Ciano - Sugestões / Dicas
      case 'tip':
      case 'suggestion':
        return 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white shadow-lg hover:shadow-xl';
      
      // 🟤 Marrom - Avisos administrativos
      case 'admin':
      case 'technical':
        return 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-lg hover:shadow-xl';
      
      // ⚪ Branco - Padrão minimalista
      case 'default':
        return 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-lg hover:shadow-xl';
      
      default:
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl';
    }
  };

  // Estado especial para página Home (caixa fechado)
  if (isHomePage) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
        {/* Backdrop transparente */}
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Dialog especial para Home - sem sombra */}
        <div className="relative bg-white rounded-2xl max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100">
          <div className="p-6">
            {/* Icon e Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
            </div>
            
            {/* Message */}
            <div className="mb-8">
              <p className="text-base text-gray-600 leading-relaxed text-center">
                {message}
              </p>
            </div>
            
            {/* Apenas botão de confirmação ocupando 100% */}
            <button
              onClick={onConfirm}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg shadow-lg hover:shadow-xl"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado especial para finalizar pedido (dois botões de ação)
  if (isFinalizarPedido) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop com blur */}
        <div 
          className="absolute inset-0 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xs sm:max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="p-4 sm:p-8">
            {/* Icon and Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${getIconBackgroundClass()}`}>
                {getIcon()}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
            </div>
            
            {/* Message */}
            <div className="mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                {message}
              </p>
            </div>
            
            {/* Actions - Dois botões de ação */}
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={onSalvar}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base whitespace-nowrap"
              >
                {salvarText}
              </button>
              <button
                onClick={onImprimirSalvar}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                {imprimirSalvarText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado normal para outras páginas
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xs sm:max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="p-4 sm:p-8">
            {/* Icon and Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${getIconBackgroundClass()}`}>
                {getIcon()}
              </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
          </div>
          
          {/* Message */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
              {message}
            </p>
          </div>
          
          {/* Custom Content ou Input padrão */}
          {customContent ? (
            customContent
          ) : showInput ? (
            <div className="mb-6 sm:mb-8">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          ) : null}
          
          {/* Actions */}
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`
                flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base
                ${getConfirmButtonStyle()}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;