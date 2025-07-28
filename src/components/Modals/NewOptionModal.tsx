'use client';

import { useState, useEffect } from 'react';
import { Option } from '@/types';
import { useExpirations } from '@/hooks/useExpirations';

interface NewOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (option: Omit<Option, 'id' | 'user_id' | 'contract_id'>) => void;
  editingOption?: Option | null;
}

export default function NewOptionModal({ isOpen, onClose, onSubmit, editingOption }: NewOptionModalProps) {
  const { activeExpirations } = useExpirations();
  
  const [formData, setFormData] = useState({
    contractType: 'BGI',
    expiration: '',
    option_type: 'CALL' as 'CALL' | 'PUT',
    strike_price: '',
    premium: '',
    quantity: '',
    is_purchased: true,
    delta: ''
  });

  // Definir primeiro vencimento ativo como padrão
  useEffect(() => {
    if (activeExpirations.length > 0 && !formData.expiration) {
      setFormData(prev => ({ ...prev, expiration: activeExpirations[0].code }));
    }
  }, [activeExpirations, formData.expiration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.strike_price || !formData.premium || !formData.quantity) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Construir código completo do contrato
    const expiration = activeExpirations.find(exp => exp.code === formData.expiration);
    const contractCode = `${formData.contractType}${formData.expiration}${expiration?.year.slice(-2) || '25'}`;

    // Calcular data de expiração baseada no vencimento selecionado
    const expirationDate = expiration ? 
      new Date(parseInt(expiration.year), expiration.monthNumber - 1, 30).toISOString() :
      new Date().toISOString();

    const newOption: Omit<Option, 'id' | 'user_id' | 'contract_id'> = {
      option_type: formData.option_type,
      strike_price: parseFloat(formData.strike_price.replace('R$ ', '').replace(',', '.')),
      premium: parseFloat(formData.premium.replace('R$ ', '').replace(',', '.')),
      quantity: parseInt(formData.quantity),
      expiration_date: expirationDate,
      is_purchased: formData.is_purchased,
      status: 'OPEN',
      delta: formData.delta ? parseFloat(formData.delta) : undefined,
      symbol: contractCode,
      name: `${formData.option_type} ${contractCode}`
    };

    onSubmit(newOption);
    onClose();
    
    // Reset form
    setFormData({
      contractType: 'BGI',
      expiration: activeExpirations.length > 0 ? activeExpirations[0].code : '',
      option_type: 'CALL',
      strike_price: '',
      premium: '',
      quantity: '',
      is_purchased: true,
      delta: ''
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal position-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{editingOption ? 'Editar Opção' : 'Nova Opção'}</h2>
            <span className="modal-subtitle">
              {editingOption ? 'Modificar estratégia de opção' : 'Criar nova estratégia com opções'}
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
          <form onSubmit={handleSubmit}>
            {/* Campos principais horizontais */}
            <div className="form-row horizontal-close-fields">
              <div className="field-group flex-1">
                <label className="field-label">Tipo de Opção</label>
                <select 
                  className="form-input"
                  value={formData.option_type}
                  onChange={(e) => handleInputChange('option_type', e.target.value as 'CALL' | 'PUT')}
                >
                  <option value="CALL">Call (Compra)</option>
                  <option value="PUT">Put (Venda)</option>
                </select>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Ativo Base</label>
                <select 
                  className="form-input"
                  value={formData.contractType}
                  onChange={(e) => handleInputChange('contractType', e.target.value)}
                >
                  <option value="BGI">BGI - Boi Gordo</option>
                  <option value="CCM">CCM - Milho</option>
                </select>
              </div>

              <div className="field-group flex-1">
                <label className="field-label">Vencimento</label>
                <select 
                  className="form-input"
                  value={formData.expiration}
                  onChange={(e) => handleInputChange('expiration', e.target.value)}
                  disabled={activeExpirations.length === 0}
                >
                  <option value="">Selecione</option>
                  {activeExpirations.length === 0 ? (
                    <option value="" disabled>Configure vencimentos</option>
                  ) : (
                    activeExpirations.map(exp => (
                      <option key={exp.id} value={exp.code}>
                        {exp.code} - {exp.month}/{exp.year}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Valores da Opção */}
            <div className="form-row horizontal-close-fields">
              <div className="field-group flex-1">
                <label className="field-label">Strike (Preço de Exercício)</label>
                <div className="price-input-container-fixed">
                  <span className="currency-symbol-fixed">R$</span>
                  <input 
                    type="number"
                    className="form-input price-input-fixed"
                    value={formData.strike_price}
                    onChange={(e) => handleInputChange('strike_price', e.target.value)}
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Prêmio</label>
                <div className="price-input-container-fixed">
                  <span className="currency-symbol-fixed">R$</span>
                  <input 
                    type="number"
                    className="form-input price-input-fixed"
                    value={formData.premium}
                    onChange={(e) => handleInputChange('premium', e.target.value)}
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantidade e Operação */}
            <div className="form-row horizontal-close-fields">
              <div className="field-group flex-1">
                <label className="field-label">Quantidade</label>
                <input 
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  min="1"
                  placeholder="Número de contratos"
                  required
                />
              </div>
              
              <div className="field-group flex-1">
                <label className="field-label">Operação</label>
                <select 
                  className="form-input"
                  value={formData.is_purchased.toString()}
                  onChange={(e) => handleInputChange('is_purchased', e.target.value === 'true')}
                >
                  <option value="true">Comprada</option>
                  <option value="false">Vendida</option>
                </select>
              </div>

              <div className="field-group flex-1">
                <label className="field-label">Delta (Opcional)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formData.delta}
                  onChange={(e) => handleInputChange('delta', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Resumo da Operação (similar ao P&L card) */}
            {formData.strike_price && formData.premium && formData.quantity && (
              <div className="pnl-card">
                <div className="pnl-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="pnl-title">Resumo da Operação</span>
                </div>
                <div className="pnl-content">
                  <div className="pnl-amount">
                    {(parseFloat(formData.premium) * parseInt(formData.quantity) * 330).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="pnl-details">
                    <span className="pnl-detail-item">
                      <span className="detail-label">Prêmio Total:</span>
                      <span className="detail-value">
                        {formData.quantity} × R$ {parseFloat(formData.premium).toFixed(2)} × 330
                      </span>
                    </span>
                    <span className="pnl-detail-item">
                      <span className="detail-label">Tipo:</span>
                      <span className="detail-value">
                        {formData.option_type} {formData.is_purchased ? 'Comprada' : 'Vendida'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            {editingOption ? 'Atualizar Opção' : 'Criar Opção'}
          </button>
        </div>
      </div>
    </div>
  );
} 