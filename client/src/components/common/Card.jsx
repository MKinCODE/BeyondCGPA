import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  glass = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        ${glass ? 'glass-panel' : 'bg-white'} 
        rounded-2xl border border-[#E2E8F0] p-6 shadow-sm
        ${hoverEffect ? 'transition-all duration-300 hover:shadow-md hover:border-[#CBD5E1] hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
