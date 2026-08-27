import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'pale-teal', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 shadow-sm',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2 shadow-sm',
    lg: 'px-7 py-3.5 text-base font-semibold gap-2.5 shadow-md'
  };

  const variantStyles = {
    primary: 'bg-[#12B8A6] hover:bg-[#087F73] text-white shadow-[#12B8A6]/20 hover:shadow-lg hover:shadow-[#12B8A6]/25 hover:-translate-y-0.5',
    secondary: 'bg-[#0B172A] hover:bg-[#1E293B] text-white shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border border-[#E3E1DA] bg-white hover:bg-[#F8F7F2] text-[#0B172A] hover:border-[#CBD5E1]',
    ghost: 'text-[#64748B] hover:text-[#0B172A] hover:bg-[#F1EFEA]/70',
    'pale-teal': 'bg-[#E5F7F4] hover:bg-[#D0F0EB] text-[#087F73] border border-[#12B8A6]/20',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      )}
    </button>
  );
};

export default Button;
