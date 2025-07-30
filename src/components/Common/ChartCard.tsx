'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`p-2.5 bg-secondary border border-border rounded-md hover:border-border-light transition-fast cursor-pointer ${className}`}>
      <h3 className="text-[11px] font-semibold text-secondary uppercase tracking-[0.3px] mb-1.5">{title}</h3>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
} 