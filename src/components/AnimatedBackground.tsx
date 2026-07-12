import { useEffect, useRef, useState } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className = '' }: AnimatedBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize particles for desktop only
    if (window.innerWidth > 768) {
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
      const newParticles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      }));
      setParticles(newParticles);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || particles.length === 0) return;

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5,
        ...(particle.y < -10 && { y: window.innerHeight + 10 })
      })));
    };

    const interval = setInterval(animateParticles, 16); // ~60fps
    return () => clearInterval(interval);
  }, [prefersReducedMotion, particles.length]);

  const gradientStyle = prefersReducedMotion ? {} : {
    background: `
      radial-gradient(
        circle at ${mousePosition.x}px ${mousePosition.y}px,
        hsl(var(--primary) / 0.15) 0%,
        hsl(var(--manga-gold) / 0.08) 35%,
        transparent 70%
      ),
      linear-gradient(
        45deg,
        hsl(var(--background)) 0%,
        hsl(var(--background)) 40%,
        hsl(var(--primary) / 0.02) 60%,
        hsl(var(--manga-red) / 0.03) 80%,
        hsl(var(--background)) 100%
      )
    `,
    transition: 'background 0.3s ease-out'
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={gradientStyle}
    >
      {/* Animated particles for desktop only */}
      {!prefersReducedMotion && window.innerWidth > 768 && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-primary/20"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.01}px, ${(mousePosition.y - window.innerHeight / 2) * 0.01}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Subtle animated overlay patterns */}
      {!prefersReducedMotion && (
        <>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 0.5}px ${mousePosition.y * 0.5}px, hsl(var(--manga-gold) / 0.1) 0%, transparent 50%)`,
              transform: `translate(${(mousePosition.x - window.innerWidth / 2) * -0.02}px, ${(mousePosition.y - window.innerHeight / 2) * -0.02}px)`,
              transition: 'all 0.6s ease-out'
            }}
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 0.3}px ${mousePosition.y * 0.3}px, hsl(var(--manga-red) / 0.08) 0%, transparent 60%)`,
              transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.015}px, ${(mousePosition.y - window.innerHeight / 2) * 0.015}px)`,
              transition: 'all 0.8s ease-out'
            }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedBackground;