import { useEffect, useRef, useState } from 'react';

interface MouseFollowerProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const MouseFollower = ({ children, className = '', intensity = 0.02 }: MouseFollowerProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  const getTransform = () => {
    if (prefersReducedMotion || !elementRef.current) return '';
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - centerX) * intensity;
    const deltaY = (mousePosition.y - centerY) * intensity;
    
    return `translate(${deltaX}px, ${deltaY}px) rotateY(${deltaX * 0.1}deg) rotateX(${-deltaY * 0.1}deg)`;
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'}`}
      style={{
        transform: getTransform(),
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
};

export default MouseFollower;