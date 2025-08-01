'use client';

import React from 'react';
import { PositionStatus } from '@/types';

interface StatusBadgeProps {
  status: PositionStatus;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  variant?: 'default' | 'dot';
}

export default function StatusBadge({ 
  status, 
  size = 'sm', 
  showIcon = true,
  variant = 'default'
}: StatusBadgeProps) {
  const getStatusConfig = (status: PositionStatus) => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Aberta',
          color: 'text-positive bg-positive-bg border-positive',
          dotColor: 'bg-positive'
        };
      case 'CLOSED':
        return {
          label: 'Fechada',
          color: 'text-negative bg-negative-bg border-negative',
          dotColor: 'bg-negative'
        };
      case 'PARTIAL':
        return {
          label: 'Parcial',
          color: 'text-warning bg-warning-bg border-warning',
          dotColor: 'bg-warning'
        };
      case 'NETTED':
        return {
          label: 'Netada',
          color: 'text-info bg-info-bg border-info',
          dotColor: 'bg-info'
        };
      case 'CONSOLIDATED':
        return {
          label: 'Consolidada',
          color: 'text-neutral bg-secondary border-border',
          dotColor: 'bg-neutral'
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'text-secondary bg-secondary border-border',
          dotColor: 'bg-secondary'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-[9px]',
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs'
  };

  if (variant === 'dot') {
    return (
      <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} font-medium`}>
        <span className={`w-1 h-1 rounded-full ${config.dotColor}`} />
        {config.label}
      </span>
    );
  }

  return (
    <span className={`
      inline-flex items-center gap-0.5 
      ${sizeClasses[size]} 
      rounded-[3px] 
      font-medium 
      border
      transition-fast
      ${config.color}
    `}>
      {showIcon && <span className={`w-1 h-1 rounded-full ${config.dotColor}`} />}
      {config.label}
    </span>
  );
} 