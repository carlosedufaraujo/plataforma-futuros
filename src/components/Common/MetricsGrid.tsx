'use client';

import React from 'react';

interface MetricData {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

interface MetricsGridProps {
  metrics: MetricData[];
  columns?: number;
  compact?: boolean;
}

const TrendIcon = ({ type }: { type: 'positive' | 'negative' | 'neutral' }) => {
  if (type === 'positive') {
    return <span className="w-2.5 h-2.5">↗</span>;
  }
  if (type === 'negative') {
    return <span className="w-2.5 h-2.5">↘</span>;
  }
  return <span className="w-2.5 h-2.5">→</span>;
};

export default function MetricsGrid({ metrics, columns = 4, compact = false }: MetricsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClass = compact ? 'gap-3' : 'gap-4';

  return (
    <div className={`grid ${gapClass} ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[4]}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="p-2.5 bg-secondary border border-border rounded-md hover:border-border-light transition-fast cursor-pointer">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-[0.3px]">
              {metric.label}
            </span>
            {metric.icon && <span className="w-3.5 h-3.5 text-secondary">{metric.icon}</span>}
          </div>
          <div className="text-[18px] font-semibold mb-0.5">{metric.value}</div>
          <div className={`flex items-center gap-0.5 text-[11px] ${
            metric.changeType === 'positive' ? 'text-positive' : 
            metric.changeType === 'negative' ? 'text-negative' : 'text-secondary'
          }`}>
            <TrendIcon type={metric.changeType} />
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
} 