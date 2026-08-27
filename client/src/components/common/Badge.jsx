import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default', 'teal', 'blue', 'purple', 'amber', 'rose', 'emerald', 'outline'
  size = 'md', // 'sm', 'md'
  className = '',
  icon: Icon
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-medium gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5'
  };

  const variantStyles = {
    default: 'bg-[#F1EFEA] text-[#0B172A] border border-[#E3E1DA]',
    teal: 'bg-[#E5F7F4] text-[#087F73] border border-[#12B8A6]/25',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/70',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    outline: 'bg-transparent text-[#64748B] border border-[#E3E1DA]'
  };

  return (
    <span className={`inline-flex items-center rounded-full transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
