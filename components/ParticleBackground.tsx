
import React, { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'steak' | 'wine' | 'ribs' | 'fire';
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
}

const SteakIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21,11C21,16.5 16.5,21 11,21C5.5,21 1,16.5 1,11C1,5.5 5.5,1 11,1C16.5,1 21,5.5 21,11M11,3C6.58,3 3,6.58 3,11C3,15.42 6.58,19 11,19C15.42,19 19,15.42 19,11C19,6.58 15.42,3 11,3M11,7A4,4 0 0,0 7,11A4,4 0 0,0 11,15A4,4 0 0,0 15,11A4,4 0 0,0 11,7M11,13A2,2 0 0,1 9,11A2,2 0 0,1 11,9A2,2 0 0,1 13,11A2,2 0 0,1 11,13Z" />
  </svg>
);

const WineIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10,22H14V20H13V15.93C15.82,15.42 18,12.97 18,10V3H6V10C6,12.97 8.18,15.42 11,15.93V20H10V22M8,5H16V7H8V5M8,9H16V10C16,12.21 14.21,14 12,14C9.79,14 8,12.21 8,10V9Z" />
  </svg>
);

const RibsIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19M17,11H7V9H17V11M17,15H7V13H17V15Z" />
  </svg>
);

export const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const types: Particle['type'][] = ['steak', 'wine', 'ribs', 'fire'];

  useEffect(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      p.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (60 - 20) + 20,
        rotation: Math.random() * 360,
        type: types[Math.floor(Math.random() * types.length)],
        duration: Math.random() * (30 - 15) + 15,
        delay: Math.random() * 15,
        opacity: Math.random() * (0.3 - 0.05) + 0.05,
        blur: Math.random() * 4,
      });
    }
    setParticles(p);
  }, []);

  const renderIcon = (type: Particle['type']) => {
    switch (type) {
      case 'steak': return <SteakIcon />;
      case 'wine': return <WineIcon />;
      case 'ribs': return <RibsIcon />;
      case 'fire': return <span className="text-orange-500/40">🔥</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-gradient-to-b from-black via-zinc-950 to-black">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-premium-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
            transform: `rotate(${particle.rotation}deg)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `-${particle.delay}s`, // Negative delay for instant start
            color: particle.type === 'fire' ? 'rgba(234, 88, 12, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {renderIcon(particle.type)}
        </div>
      ))}
      <style>{`
        @keyframes premium-float {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: var(--opacity);
          }
          80% {
            opacity: var(--opacity);
          }
          100% {
            transform: translateY(-20vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
        .animate-premium-float {
          animation: premium-float infinite linear;
        }
      `}</style>
    </div>
  );
};
