import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'tab';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  active = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-rcn-accent border border-rcn-accent text-white hover:bg-rcn-accent-dark hover:border-rcn-accent-dark',
    secondary: 'border border-rcn-border bg-white text-rcn-text hover:border-[#c9ddd0]',
    danger: 'border border-rcn-danger bg-white text-rcn-danger hover:bg-rcn-danger hover:text-white',
    ghost: 'border-none bg-transparent text-rcn-text hover:bg-rcn-border/30',
    tab: active
      ? 'bg-rcn-accent border border-rcn-accent text-white'
      : 'bg-[#f6fbf7] border border-rcn-border text-rcn-text hover:border-[#b9d7c5]',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-2 py-1.5 text-xs rounded-lg',
    md: 'px-3 py-2.5 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
  };

  const tabSpecificClass = variant === 'tab' ? 'rounded-full font-bold' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${tabSpecificClass}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
