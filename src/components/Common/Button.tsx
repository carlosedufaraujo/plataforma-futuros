'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-sm transition-fast focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'h-6 px-2 text-[10px]',
    md: 'h-7 px-3 text-xs',
    lg: 'h-8 px-4 text-xs'
  };
  
  const variantClasses = {
    primary: 'bg-info text-white hover:bg-info-dark focus:ring-info',
    secondary: 'bg-transparent border border-border text-primary hover:bg-hover focus:ring-border',
    danger: 'bg-negative text-white hover:bg-negative-dark focus:ring-negative',
    success: 'bg-positive text-white hover:bg-positive-dark focus:ring-positive',
    compact: 'bg-secondary border border-border text-primary hover:bg-hover text-[10px] h-6 px-2'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-3 h-3">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
