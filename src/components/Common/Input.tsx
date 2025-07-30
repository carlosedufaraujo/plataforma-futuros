'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export default function Input({ 
  label,
  error,
  hint,
  icon,
  variant = 'default',
  className = '',
  ...props 
}: InputProps) {
  const inputClasses = variant === 'compact' 
    ? 'h-7 px-2 text-[10px]'
    : 'h-8 px-2 text-xs';
  
  const baseInputClasses = `
    w-full
    bg-primary 
    border 
    border-border 
    rounded-sm 
    transition-fast
    focus:border-info 
    focus:bg-secondary 
    focus:outline-none
    focus:ring-1 
    focus:ring-info
    placeholder:text-secondary
    ${error ? 'border-negative focus:border-negative focus:ring-negative' : ''}
    ${icon ? 'pl-7' : ''}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[11px] font-semibold text-secondary uppercase tracking-[0.3px]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-secondary">
            {icon}
          </div>
        )}
        <input
          className={`${baseInputClasses} ${inputClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] text-negative flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-negative" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-secondary opacity-70">
          {hint}
        </p>
      )}
    </div>
  );
}
