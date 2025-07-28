'use client';

import { Transaction } from '@/types';

interface ViewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function ViewTransactionModal({
  isOpen,
  onClose,
  transaction
}: ViewTransactionModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="modal-overlay">
      <div className="modal position-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Detalhes da Transação</h2>
            <span className="modal-subtitle">
              {transaction.contract} - {new Date(transaction.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Seção: Informações da Transação */}
          <div className="form-section">
            <div className="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              <span className="section-title">Informações da Transação</span>
            </div>
            
            <div className="horizontal-fields">
              <div className="field-group flex-1">
                <label className="field-label">ID da Transação</label>
                <div className="field-value monospace">{transaction.id}</div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Data/Hora</label>
                <div className="field-value">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(transaction.date).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Contrato</label>
                <div className="field-value">
                  <span className="contract-badge">{transaction.contract}</span>
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Tipo</label>
                <div className="field-value">
                  <span className={`badge badge-${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Detalhes Financeiros */}
          <div className="form-section">
            <div className="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span className="section-title">Detalhes Financeiros</span>
            </div>
            
            <div className="horizontal-fields">
              <div className="field-group flex-1">
                <label className="field-label">Quantidade</label>
                <div className="field-value">{transaction.quantity} contratos</div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Preço por Contrato</label>
                <div className="field-value">
                  {transaction.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Taxa/Comissão</label>
                <div className="field-value">
                  {transaction.fees > 0 
                    ? transaction.fees.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'Sem taxa'
                  }
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Valor Total</label>
                <div className="field-value primary-value">
                  {transaction.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Status e Controle */}
          <div className="form-section">
            <div className="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11V6a3 3 0 1 1 6 0v5"></path>
                <path d="M12 17h.01"></path>
                <rect x="5" y="11" width="14" height="10" rx="2"></rect>
              </svg>
              <span className="section-title">Status e Controle</span>
            </div>
            
            <div className="horizontal-fields">
              <div className="field-group flex-1">
                <label className="field-label">Status</label>
                <div className="field-value">
                  <span className={`badge badge-${transaction.status.toLowerCase()}`}>
                    {transaction.status === 'EXECUTADA' ? 'Executada' :
                     transaction.status === 'PENDENTE' ? 'Pendente' : 'Cancelada'}
                  </span>
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Data de Criação</label>
                <div className="field-value">
                  {new Date(transaction.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(transaction.createdAt).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card de Resumo Financeiro (similar ao P&L card) */}
          <div className="pnl-card">
            <div className="pnl-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"></path>
                <path d="M4 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
              </svg>
              <span className="pnl-title">Resumo Financeiro</span>
            </div>
            <div className="pnl-content">
              <div className="pnl-amount">
                {transaction.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="pnl-details">
                <span className="pnl-detail-item">
                  <span className="detail-label">Valor Base:</span>
                  <span className="detail-value">
                    {transaction.quantity} × {transaction.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {(transaction.quantity * transaction.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </span>
                {transaction.fees > 0 && (
                  <span className="pnl-detail-item">
                    <span className="detail-label">Taxa/Comissão:</span>
                    <span className="detail-value">
                      + {transaction.fees.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 