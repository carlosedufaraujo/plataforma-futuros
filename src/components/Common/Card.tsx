'use client';

import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ 
  title, 
  subtitle, 
  icon, 
  children, 
  className = '', 
  onClick,
  hover = true 
}: CardProps) {
  const baseClasses = `
    p-2.5 
    bg-secondary 
    border 
    border-border 
    rounded-md 
    transition-fast
    ${hover ? 'hover:border-border-light hover:bg-hover cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {icon && <span className="w-3.5 h-3.5 text-secondary">{icon}</span>}
            <div>
              {title && (
                <h3 className="text-[11px] font-semibold text-secondary uppercase tracking-[0.3px]">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[10px] text-secondary opacity-80">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
