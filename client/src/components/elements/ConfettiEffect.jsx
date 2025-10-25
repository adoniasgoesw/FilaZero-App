import React, { useEffect, useState } from 'react';

const ConfettiEffect = ({ isActive, onComplete }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (isActive) {
      // Delay para sincronizar com a animação do texto
      setTimeout(() => {
        createConfetti();
      }, 300);
      
      // Animação contínua
      const animateInterval = setInterval(() => {
        setConfetti(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            rotation: particle.rotation + particle.rotationSpeed,
            velocity: {
              ...particle.velocity,
              y: particle.velocity.y + 0.3, // gravidade mais forte
              x: particle.velocity.x * 0.98 // resistência do ar
            }
          })).filter(particle => 
            particle.y < window.innerHeight + 100 && 
            particle.x > -50 && 
            particle.x < window.innerWidth + 50
          )
        );
      }, 16);
      
      return () => {
        clearInterval(animateInterval);
      };
    }
  }, [isActive]);

  const createConfetti = () => {
    const colors = ['#ef4444', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'];
    const newConfetti = [];

    // Centro da tela (onde está a mensagem)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 150; i++) {
      // Ângulo aleatório para explosão em todas as direções
      const angle = (Math.PI * 2 * i) / 150;
      const speed = Math.random() * 12 + 8; // Velocidade de explosão
      
      newConfetti.push({
        id: i,
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        rotationSpeed: (Math.random() - 0.5) * 15
      });
    }

    setConfetti(newConfetti);
  };

  if (!isActive || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 8px ${particle.color}`,
            opacity: 0.9
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
