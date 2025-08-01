'use client';

import { useState } from 'react';
import ContractManagement from '@/components/Settings/ContractManagement';
import UserManagement from '@/components/Settings/UserManagement';
import BrokerageManagement from '@/components/Settings/BrokerageManagement';
import TabNavigation from '@/components/Common/TabNavigation';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

type SettingsTabType = 'admin' | 'usuarios' | 'corretoras' | 'api' | 'referencias' | 'contratos';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabType>(user?.role === 'admin' ? 'admin' : 'contratos');

  const handleTestConnection = () => {
    alert('Conexão testada com sucesso!');
  };

  const tabs = [
    ...(user?.role === 'admin' ? [{ 
      id: 'admin' as const, 
      label: 'Painel Admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      )
    }] : []),
    ...(user?.role === 'admin' ? [{ 
      id: 'usuarios', 
      label: 'Usuários',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }] : []),
    ...(user?.role === 'admin' ? [{ 
      id: 'corretoras', 
      label: 'Corretoras',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9,22 9,12 15,12 15,22"></polyline>
        </svg>
      )
    }] : []),
    { 
      id: 'api', 
      label: 'API',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      )
    },
    { 
      id: 'referencias', 
      label: 'Referências',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    { 
      id: 'contratos', 
      label: 'Contratos',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      )
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin':
        return <AdminDashboard />;
        
      case 'usuarios':
        return <UserManagement />;
      
      case 'corretoras':
        return <BrokerageManagement />;
      
      case 'api':
        return (
          <div className="config-section-card">
            <div className="config-section-header">
              <h2 className="config-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Configuração de APIs
              </h2>
            </div>
            
            <div className="config-section-content">
              {/* Status Connection Card Compacto */}
              <div className="config-compact-card">
                <div className="compact-card-header">
                  <h3>Status da Conexão</h3>
                  <div className="status-indicator-group">
                    <span className="status-dot active"></span>
                    <span className="status-text">Conectado</span>
                  </div>
                </div>
                
                <div className="compact-form-grid">
                  <div className="compact-field">
                    <label>API B3</label>
                    <span className="field-value">wss://api.b3.com.br/marketdata/v1</span>
                  </div>
                  <div className="compact-field">
                    <label>Última Sync</label>
                    <span className="field-value">14:32:15</span>
                  </div>
                  <div className="compact-field">
                    <label>Latência</label>
                    <span className="field-value">127ms</span>
                  </div>
                  <div className="compact-field">
                    <label>Contratos</label>
                    <span className="field-value">BGI, CCM, SOJ</span>
                  </div>
                </div>
                
                <div className="compact-actions">
                  <button className="btn-compact btn-primary" onClick={handleTestConnection}>
                    Testar Conexão
                  </button>
                  <button className="btn-compact btn-secondary">
                    Reconectar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'referencias':
        return (
          <div className="card">
            <h2>Referências do Sistema</h2>
            
            <div className="references-container">
              <div className="references-row">
                <div className="reference-card">
                  <h3 className="reference-title">Códigos de Contratos</h3>
                  <div className="reference-content">
                    <div className="reference-item">
                      <span className="reference-code">BGI</span>
                      <span className="reference-desc">Boi Gordo Ibovespa</span>
                    </div>
                    <div className="reference-item">
                      <span className="reference-code">CCM</span>
                      <span className="reference-desc">Milho</span>
                    </div>
                  </div>
                </div>
                
                <div className="reference-card">
                  <h3 className="reference-title">Tamanhos de Contrato</h3>
                  <div className="reference-content">
                    <div className="reference-item">
                      <span className="reference-code">BGI:</span>
                      <span className="reference-desc">330 arrobas por contrato</span>
                    </div>
                    <div className="reference-item">
                      <span className="reference-code">CCM:</span>
                      <span className="reference-desc">450 sacos por contrato</span>
                    </div>
                  </div>
                </div>
                
                <div className="reference-card">
                  <h3 className="reference-title">Exemplos</h3>
                  <div className="reference-content">
                    <div className="reference-item">
                      <span className="reference-code">BGIK25:</span>
                      <span className="reference-desc">Boi Gordo venc. Maio/2025</span>
                    </div>
                    <div className="reference-item">
                      <span className="reference-code">CCMN25:</span>
                      <span className="reference-desc">Milho venc. Julho/2025</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="reference-card reference-full-width">
                <h3 className="reference-title">Códigos de Vencimento</h3>
                <div className="reference-months-grid">
                  <div className="reference-month">
                    <span className="month-code">F</span>
                    <span className="month-name">Janeiro</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">G</span>
                    <span className="month-name">Fevereiro</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">H</span>
                    <span className="month-name">Março</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">J</span>
                    <span className="month-name">Abril</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">K</span>
                    <span className="month-name">Maio</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">M</span>
                    <span className="month-name">Junho</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">N</span>
                    <span className="month-name">Julho</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">Q</span>
                    <span className="month-name">Agosto</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">U</span>
                    <span className="month-name">Setembro</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">V</span>
                    <span className="month-name">Outubro</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">X</span>
                    <span className="month-name">Novembro</span>
                  </div>
                  <div className="reference-month">
                    <span className="month-code">Z</span>
                    <span className="month-name">Dezembro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'contratos':
        return <ContractManagement />;
      
      default:
        return <UserManagement />;
    }
  };

  return (
    <div>
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as SettingsTabType)}
      />
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
} 