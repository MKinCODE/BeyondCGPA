import React, { useEffect, useRef, useState } from 'react';

export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up', // 'up', 'down', 'left', 'right', 'scale', 'none'
  threshold = 0.12,
  duration = 750
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  const getInitialTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up': return 'translate3d(0, 32px, 0) scale(0.98)';
      case 'down': return 'translate3d(0, -32px, 0) scale(0.98)';
      case 'left': return 'translate3d(36px, 0, 0) scale(0.98)';
      case 'right': return 'translate3d(-36px, 0, 0) scale(0.98)';
      case 'scale': return 'translate3d(0, 16px, 0) scale(0.94)';
      default: return 'translate3d(0, 0, 0) scale(1)';
    }
  };

  return (
    <div
      ref={domRef}
      className={`smooth-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getInitialTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
