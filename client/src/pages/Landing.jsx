import React, { useState, useEffect } from 'react';
import FormLogin from '../components/forms/FormLogin';
import FormRegister from '../components/forms/FormRegister';
import ConfettiEffect from '../components/elements/ConfettiEffect';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [isLogin]);

  // Animação de digitação com 5 frases
  useEffect(() => {
    const phrases = [
      "Seu cliente não espera, seu sistema também não.",
      "Atendimento ágil começa com a tecnologia certa.",
      "Fila Zero: rapidez que conquista e fideliza.",
      "Menos espera, mais vendas, mais satisfação.",
      "Quem atende sem fila, cresce sem limite."
    ];

    const typeInterval = setInterval(() => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (!isDeleting && !isWaiting) {
        // Escrevendo a frase
        if (currentCharIndex < currentPhrase.length) {
          setTypedText(prev => prev + currentPhrase[currentCharIndex]);
          setCurrentCharIndex(prev => prev + 1);
        } else {
          // Frase completa, espera 5 segundos
          setIsWaiting(true);
          setTimeout(() => {
            setIsWaiting(false);
            setIsDeleting(true);
          }, 5000);
        }
      } else if (isDeleting && !isWaiting) {
        // Apagando a frase
        if (currentCharIndex > 0) {
          setTypedText(prev => prev.slice(0, -1));
          setCurrentCharIndex(prev => prev - 1);
        } else {
          // Frase apagada, vai para a próxima
          setIsDeleting(false);
          setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
        }
      }
    }, 100); // Velocidade da digitação

    return () => clearInterval(typeInterval);
  }, [currentPhraseIndex, currentCharIndex, isDeleting, isWaiting]);

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  const handleRegisterSuccess = (name) => {
    setShowSuccess(true);
    setShowConfetti(true);
    
    // Navegar para home após 3 segundos
    setTimeout(() => {
      window.location.href = `/home?name=${encodeURIComponent(name)}`;
    }, 3000);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  return (
    <div 
      className="bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden"
      style={{
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Elementos animados no fundo */}
      <div className="absolute inset-0 overflow-hidden backdrop-blur-sm">
        {/* Círculos animados em gray-900 com maior opacidade */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-900/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gray-900/30 rounded-full blur-3xl animate-float animation-delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-gray-900/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        
        {/* Sombras decorativas com maior opacidade */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-900/35 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gray-900/25 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gray-900/20 rounded-full blur-xl animate-float animation-delay-3000"></div>
        
        {/* Elementos adicionais para mais profundidade */}
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-gray-900/15 rounded-full blur-2xl animate-float animation-delay-1500"></div>
        <div className="absolute top-1/3 right-1/5 w-56 h-56 bg-gray-900/18 rounded-full blur-3xl animate-float animation-delay-2500"></div>
      </div>

      {/* Header transparente - apenas para desktop */}
      <header className="hidden md:block absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          {/* Logo no canto superior esquerdo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              FilaZero
            </h1>
          </div>

          {/* Menu na direita */}
          <nav className="flex items-center space-x-6">
            <a href="#" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">Home</a>
            <a href="#" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">Pricing</a>
            <a href="#" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Mensagem de sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center animate-bounce-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Parabéns!
            </h2>
            <p className="text-lg text-gray-600">
              Conta criada com sucesso!
            </p>
          </div>
        </div>
      )}

      {/* Efeito confete */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={handleConfettiComplete} 
      />

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen p-4">
        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-center h-screen">
          <div className="w-full max-w-6xl flex items-center gap-12">
            {/* Frase Principal */}
            <div className="flex-1 text-left">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {typedText}
                <span className="animate-pulse text-gray-900">|</span>
              </h1>
            </div>

            {/* Card com efeito blur e transparência */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div key={animationKey} className="animate-fadeIn">
                    {isLogin ? (
                      <FormLogin onSwitchToRegister={switchToRegister} />
                    ) : (
                      <FormRegister onSwitchToLogin={switchToLogin} onSuccess={handleRegisterSuccess} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Mobile */}
        <div 
          className="md:hidden flex flex-col px-4"
          style={{
            minHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
          }}
        >
          {/* Header Mobile */}
          <div 
            className="pt-6 pb-3"
            style={{
              paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))'
            }}
          >
            <div className="flex items-center justify-between">
              {/* Logo no canto esquerdo */}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                FilaZero
              </h1>
              
              {/* Menu no canto direito */}
              <nav className="flex items-center space-x-2 sm:space-x-3">
                <a href="#" className="text-xs sm:text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors">Home</a>
                <a href="#" className="text-xs sm:text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors">Pricing</a>
                <a href="#" className="text-xs sm:text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors">Contact</a>
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal Mobile */}
          <div className="flex-1 flex items-start justify-start pt-8">
            <div className="w-full flex flex-col sm:flex-row items-start gap-6">
              {/* Frase Principal */}
              <div className="flex-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {typedText}
                  <span className="animate-pulse text-gray-900">|</span>
                </h1>
              </div>

              {/* Card com efeito blur e transparência */}
              <div className="w-full sm:flex-1 max-w-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 shadow-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div key={animationKey} className="animate-fadeIn">
                      {isLogin ? (
                        <FormLogin onSwitchToRegister={switchToRegister} />
                      ) : (
                        <FormRegister onSwitchToLogin={switchToLogin} onSuccess={handleRegisterSuccess} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Mobile */}
          <div 
            className="text-center pb-4"
            style={{
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <p className="text-xs text-gray-500">
              © 2024 FilaZero. Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Footer Desktop */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-500 text-sm">
            © 2024 FilaZero. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
