'use client';

import React, { useState, useEffect } from 'react';
import { Building, User, ChevronDown, Check } from 'lucide-react';
import { useHybridData } from '@/contexts/HybridDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Brokerage } from '@/types';

export default function BrokerageSelector() {
  const { currentUser, selectedBrokerage, setSelectedBrokerage } = useHybridData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [availableBrokerages, setAvailableBrokerages] = useState<Brokerage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar corretoras disponíveis para o usuário
  useEffect(() => {
    if (user?.id) {
      loadUserBrokerages();
    }
  }, [user]);

  const loadUserBrokerages = async () => {
    try {
      setLoading(true);
      
      // Se for admin, carregar todas as corretoras
      if (user?.role === 'admin') {
        const { data: allBrokerages, error } = await supabase
          .from('brokerages')
          .select('*')
          .eq('is_active', true)
          .order('nome');
        
        if (!error && allBrokerages) {
          setAvailableBrokerages(allBrokerages);
        }
      } else {
        // Para usuários normais, carregar apenas suas corretoras
        const { data: userBrokerages, error } = await supabase
          .from('user_brokerages')
          .select(`
            brokerage_id,
            brokerages (*)
          `)
          .eq('user_id', user?.id)
          .eq('brokerages.is_active', true);
        
        if (!error && userBrokerages) {
          const brokerages = userBrokerages
            .map(ub => ub.brokerages)
            .filter(Boolean) as Brokerage[];
          setAvailableBrokerages(brokerages);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar corretoras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrokerage = (brokerage: Brokerage) => {
    setSelectedBrokerage(brokerage);
    setShowModal(false);
    
    // Salvar preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBrokerageId', brokerage.id);
    }
  };

  // CORREÇÃO TEMPORÁRIA: Só verificar user do useAuth, ignorar currentUser
  if (!user) {
    return (
      <div className="brokerage-selector">
        <div className="selector-content">
          <div className="selector-icon">
            <User size={16} />
          </div>
          <div className="selector-info">
            <span className="selector-label">Usuário</span>
            <span className="selector-value">Não logado</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="brokerage-selector">
        {/* Card de Usuário */}
        <div className="selector-content">
          <div className="selector-icon">
            <User size={16} />
          </div>
          <div className="selector-info">
            <span className="selector-label">Usuário</span>
            <span className="selector-value">
              {user.nome} {user.role === 'admin' && '(Admin)'}
            </span>
          </div>
        </div>
        
        {/* Card de Corretora */}
        <div 
          className="selector-content clickable"
          onClick={() => setShowModal(true)}
        >
          <div className="selector-icon">
            <Building size={16} />
          </div>
          <div className="selector-info">
            <span className="selector-label">Corretora</span>
            <span className="selector-value">
              {selectedBrokerage?.nome || 'Selecionar'}
            </span>
          </div>
          <ChevronDown size={14} className="selector-arrow" />
        </div>
      </div>

      {/* Modal de Seleção de Corretora */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal brokerage-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Selecionar Corretora</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {loading ? (
                <div className="loading-container">
                  <p>Carregando corretoras...</p>
                </div>
              ) : availableBrokerages.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma corretora disponível</p>
                </div>
              ) : (
                <div className="brokerage-list">
                  {availableBrokerages.map(brokerage => (
                    <div
                      key={brokerage.id}
                      className={`brokerage-item ${selectedBrokerage?.id === brokerage.id ? 'selected' : ''}`}
                      onClick={() => handleSelectBrokerage(brokerage)}
                    >
                      <div className="brokerage-item-content">
                        <div className="brokerage-icon">
                          <Building size={20} />
                        </div>
                        <div className="brokerage-details">
                          <h4>{brokerage.nome}</h4>
                          <p>CNPJ: {brokerage.cnpj}</p>
                          <p>Assessor: {brokerage.assessor}</p>
                        </div>
                      </div>
                      {selectedBrokerage?.id === brokerage.id && (
                        <Check size={20} className="check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .brokerage-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 12px 0;
        }

        .selector-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .selector-content.clickable {
          cursor: pointer;
        }

        .selector-content.clickable:hover {
          background: var(--bg-tertiary);
          border-color: #3b82f6;
        }

        .selector-icon {
          color: #3b82f6;
        }

        .selector-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .selector-label {
          font-size: 9px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selector-value {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .selector-arrow {
          color: var(--text-secondary);
        }

        .brokerage-modal {
          width: 90%;
          max-width: 500px;
        }

        .brokerage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .brokerage-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .brokerage-item:hover {
          background: var(--bg-tertiary);
          border-color: #3b82f6;
        }

        .brokerage-item.selected {
          border-color: #3b82f6;
          background: var(--bg-tertiary);
        }

        .brokerage-item-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .brokerage-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .brokerage-details {
          flex: 1;
        }

        .brokerage-details h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .brokerage-details p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .check-icon {
          color: var(--color-positive);
        }

        .loading-container,
        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>
    </>
  );
}