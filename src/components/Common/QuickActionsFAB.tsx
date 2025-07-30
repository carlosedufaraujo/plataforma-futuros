'use client';

import React, { useState } from 'react';

interface QuickActionsFABProps {
  onNewPosition?: () => void;
  onNewOption?: () => void;
  onNewTransaction?: () => void;
}

export default function QuickActionsFAB({ 
  onNewPosition,
  onNewOption,
  onNewTransaction 
}: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Nova Posição',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      onClick: onNewPosition,
      color: 'bg-info hover:bg-info-dark'
    },
    {
      label: 'Nova Opção',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      onClick: onNewOption,
      color: 'bg-positive hover:bg-positive-dark'
    },
    {
      label: 'Nova Transação',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
      ),
      onClick: onNewTransaction,
      color: 'bg-warning hover:bg-warning-dark'
    }
  ];

  const handleAction = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-fadeIn">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-slideUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xs font-medium text-primary bg-secondary px-2 py-1 rounded-md shadow-lg border border-border whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => handleAction(action)}
                className={`
                  w-10 h-10 rounded-full text-white shadow-lg transition-all duration-200
                  hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${action.color}
                `}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-12 h-12 rounded-full bg-info text-white shadow-lg transition-all duration-200
          hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
        aria-label="Ações rápidas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
