import React from 'react';
import NextLink from 'next/link';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type LinkVariant = 'primary' | 'secondary' | 'ghost' | 'text';
type LinkSize = 'sm' | 'md' | 'lg';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  size?: LinkSize;
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

const CustomNextLink: React.FC<LinkProps> = ({
  variant = 'secondary',
  size = 'md',
  href,
  children,
  className,
  external = false,
  ...props
}) => {
  /** 🔹 Base styles (NO layout like flex/inline-flex here) */
  const baseClasses =
    'items-center justify-center gap-2.5 no-underline font-[750] transition-all cursor-pointer select-none';

  const textBaseClasses =
    'no-underline transition-all cursor-pointer';

  const variantClasses: Record<LinkVariant, string> = {
    primary:
      'border border-[rgba(255,255,255,0.25)] bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white shadow-[0_10px_18px_rgba(2,44,22,0.06)] hover:brightness-[1.02]',
    secondary:
      'border border-rcn-border-light bg-[rgba(255,255,255,0.88)] text-rcn-text shadow-[0_10px_18px_rgba(2,44,22,0.06)] hover:-translate-y-px',
    ghost:
      'border border-rcn-border-light bg-transparent text-rcn-text hover:-translate-y-px',
    text:
      'text-rcn-brand font-black hover:underline',
  };

  const sizeClasses: Record<LinkSize, string> = {
    sm: 'px-2.5 py-2 text-xs rounded-xl',
    md: 'px-3.5 py-2.5 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
  };

  const textSizeClasses: Record<LinkSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  /** 🔹 Merge + resolve Tailwind conflicts */
  const combinedClasses = twMerge(
    clsx(
      variant === 'text'
        ? [textBaseClasses, variantClasses[variant], textSizeClasses[size]]
        : [baseClasses, variantClasses[variant], sizeClasses[size]],
      className
    )
  );

  /** 🔹 External links */
  if (external || href.startsWith('http') || href.startsWith('//')) {
    return (
      <a
        href={href}
        className={combinedClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

 
  return (
    <NextLink
      href={href}
      className={combinedClasses}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default CustomNextLink;
