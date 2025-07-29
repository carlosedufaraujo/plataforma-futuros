'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Brokerage {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  assessor: string;
  telefone: string;
  email: string;
  corretagem_milho: number;
  corretagem_boi: number;
  taxas: number;
  impostos: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
}

interface UserBrokerage {
  user_id: string;
  brokerage_id: string;
  users?: User;
}

export default function BrokerageManagement() {
  const { user: currentUser } = useAuth();
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userBrokerages, setUserBrokerages] = useState<UserBrokerage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrokerage, setEditingBrokerage] = useState<Brokerage | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    assessor: '',
    telefone: '',
    email: '',
    corretagem_milho: '',
    corretagem_boi: '',
    taxas: '',
    impostos: ''
  });

  // Verificar se usuário é admin
  const isAdmin = currentUser?.role === 'admin';

  // Carregar dados do Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar corretoras (admin vê todas, trader só as vinculadas)
      let brokeragesQuery = supabase.from('brokerages').select('*');
      
      if (!isAdmin && currentUser?.id) {
        // Para traders, buscar apenas corretoras vinculadas
        const { data: userBrokeragesData } = await supabase
          .from('user_brokerages')
          .select('brokerage_id')
          .eq('user_id', currentUser.id);
        
        const brokerageIds = userBrokeragesData?.map(ub => ub.brokerage_id) || [];
        
        if (brokerageIds.length > 0) {
          brokeragesQuery = brokeragesQuery.in('id', brokerageIds);
        } else {
          // Se não tem vinculações, não mostrar nenhuma
          brokeragesQuery = brokeragesQuery.eq('id', 'none');
        }
      }
      
      const { data: brokeragesData, error: brokeragesError } = await brokeragesQuery.order('nome');
      
      if (brokeragesError) throw brokeragesError;
      
      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('nome');
      
      if (usersError) throw usersError;
      
      // Carregar vinculações
      const { data: userBrokeragesData, error: ubError } = await supabase
        .from('user_brokerages')
        .select('*, users(nome, email, cpf)')
        .order('brokerage_id');
      
      if (ubError) throw ubError;
      
      setBrokerages(brokeragesData || []);
      setUsers(usersData || []);
      setUserBrokerages(userBrokeragesData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obter usuários de uma corretora
  const getBrokerageUsers = (brokerageId: string): string => {
    const brokerageUsers = userBrokerages
      .filter(ub => ub.brokerage_id === brokerageId)
      .map(ub => ub.users?.nome)
      .filter(Boolean);
    
    return brokerageUsers.length > 0 ? brokerageUsers.join(', ') : 'Nenhum';
  };

  const handleAddBrokerage = () => {
    setEditingBrokerage(null);
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      assessor: '',
      telefone: '',
      email: '',
      corretagem_milho: '',
      corretagem_boi: '',
      taxas: '',
      impostos: ''
    });
    setSelectedUsers([]);
    setIsModalOpen(true);
  };

  const handleEditBrokerage = (brokerage: Brokerage) => {
    setEditingBrokerage(brokerage);
    setFormData({
      nome: brokerage.nome,
      cnpj: brokerage.cnpj,
      endereco: brokerage.endereco,
      assessor: brokerage.assessor,
      telefone: brokerage.telefone,
      email: brokerage.email,
      corretagem_milho: brokerage.corretagem_milho.toString(),
      corretagem_boi: brokerage.corretagem_boi.toString(),
      taxas: brokerage.taxas.toString(),
      impostos: brokerage.impostos.toString()
    });
    
    // Carregar usuários vinculados
    const brokerageUserIds = userBrokerages
      .filter(ub => ub.brokerage_id === brokerage.id)
      .map(ub => ub.user_id);
    setSelectedUsers(brokerageUserIds);
    
    setIsModalOpen(true);
  };

  const handleDeleteBrokerage = async (id: string) => {
    const brokerage = brokerages.find(b => b.id === id);
    if (!brokerage) return;

    if (confirm(`Deseja excluir a corretora "${brokerage.nome}"?\n\nCNPJ: ${brokerage.cnpj}\n\nEsta ação não pode ser desfeita.`)) {
      try {
        const { error } = await supabase
          .from('brokerages')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Recarregar dados
        await loadData();
        
        // Feedback visual
        showToast(`Corretora "${brokerage.nome}" excluída com sucesso!`, 'success');
      } catch (error) {
        console.error('Erro ao excluir corretora:', error);
        showToast('Erro ao excluir corretora', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const brokerageData = {
        ...formData,
        corretagem_milho: parseFloat(formData.corretagem_milho),
        corretagem_boi: parseFloat(formData.corretagem_boi),
        taxas: parseFloat(formData.taxas),
        impostos: parseFloat(formData.impostos)
      };
      
      if (editingBrokerage) {
        // Editar corretora existente
        const { error } = await supabase
          .from('brokerages')
          .update(brokerageData)
          .eq('id', editingBrokerage.id);
        
        if (error) throw error;
        
        // Atualizar usuários vinculados
        await updateBrokerageUsers(editingBrokerage.id);
        
      } else {
        // Adicionar nova corretora
        try {
          const { data: newBrokerage, error } = await supabase
            .from('brokerages')
            .insert([{
              ...brokerageData,
              is_active: true
            }])
            .select()
            .single();
          
          if (error) throw error;
          
          // Vincular usuários
          if (newBrokerage && selectedUsers.length > 0) {
            await updateBrokerageUsers(newBrokerage.id);
          }
        } catch (insertError: any) {
          console.error('❌ Erro ao criar corretora:', insertError);
          
          // Se o erro foi no .single(), tentar sem ele
          if (insertError.message?.includes('single') || insertError.code === 'PGRST116') {
            console.log('🔄 Tentando inserção sem .single()...');
            
            const { data: newBrokerageArray, error: retryError } = await supabase
              .from('brokerages')
              .insert([{
                ...brokerageData,
                is_active: true
              }])
              .select();
            
            if (retryError) throw retryError;
            
            const newBrokerage = newBrokerageArray?.[0];
            if (newBrokerage && selectedUsers.length > 0) {
              await updateBrokerageUsers(newBrokerage.id);
            }
          } else {
            throw insertError;
          }
        }
      }
      
      // Recarregar dados
      await loadData();
      setIsModalOpen(false);
      showToast(editingBrokerage ? 'Corretora atualizada com sucesso!' : 'Corretora criada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar corretora:', error);
      showToast('Erro ao salvar corretora', 'error');
    }
  };

  const updateBrokerageUsers = async (brokerageId: string) => {
    try {
      // Remover vinculações antigas
      await supabase
        .from('user_brokerages')
        .delete()
        .eq('brokerage_id', brokerageId);
      
      // Adicionar novas vinculações
      if (selectedUsers.length > 0) {
        const newUserBrokerages = selectedUsers.map(userId => ({
          user_id: userId,
          brokerage_id: brokerageId,
          role: 'trader'
        }));
        
        await supabase
          .from('user_brokerages')
          .insert(newUserBrokerages);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuários:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.textContent = `${type === 'success' ? '✅' : '❌'} ${message}`;
    toast.style.cssText = `
      position: fixed; top: 70px; right: 20px; z-index: 10002;
      background: var(--color-${type === 'success' ? 'positive' : 'negative'}); 
      color: white; padding: 12px 20px;
      border-radius: 8px; font-weight: 500; animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-container">
          <p>Carregando corretoras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="settings-header">
        <div className="settings-header-main" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ margin: 0 }}>
            {isAdmin ? 'Gerenciamento de Corretoras' : 'Minhas Corretoras'}
          </h2>
          <p className="settings-subtitle" style={{ textAlign: 'left', margin: 0 }}>
            {isAdmin 
              ? `Total de ${brokerages.length} corretoras cadastradas`
              : `${brokerages.length} corretora(s) vinculada(s) ao seu usuário`
            }
          </p>
        </div>
        <div className="settings-actions">
          {isAdmin && (
            <button 
              className="btn btn-primary btn-header-action"
              onClick={handleAddBrokerage}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              Nova Corretora
            </button>
          )}
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Corretora</th>
              <th>Assessor</th>
              <th>Contato</th>
              <th>Taxas</th>
              <th>Usuários</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {brokerages.map(brokerage => (
              <tr key={brokerage.id}>
                <td>
                  <div>
                    <strong>{brokerage.nome}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      CNPJ: {brokerage.cnpj}
                    </div>
                  </div>
                </td>
                <td>{brokerage.assessor}</td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    <div>{brokerage.telefone}</div>
                    <div>{brokerage.email}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    <div>Milho: R$ {brokerage.corretagem_milho.toFixed(2)}</div>
                    <div>Boi: R$ {brokerage.corretagem_boi.toFixed(2)}</div>
                    <div>Taxas: {(brokerage.taxas * 100).toFixed(1)}%</div>
                  </div>
                </td>
                <td>{getBrokerageUsers(brokerage.id)}</td>
                <td>
                  {isAdmin ? (
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditBrokerage(brokerage)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteBrokerage(brokerage.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2,2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        </svg>
                        Excluir
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                      Apenas visualização
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para adicionar/editar corretora */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal position-modal" style={{ width: '600px' }}>
            {/* Header */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title">{editingBrokerage ? 'Editar Corretora' : 'Nova Corretora'}</h2>
                <span className="modal-subtitle">
                  {editingBrokerage ? `Modificar dados de ${editingBrokerage.nome}` : 'Cadastrar nova corretora no sistema'}
                </span>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Seção: Informações Básicas */}
                <div className="form-section" style={{ marginBottom: '20px' }}>
                  <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    <span className="section-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Informações Básicas</span>
                  </div>
                  
                  <div className="form-row horizontal-close-fields">
                    <div className="field-group flex-1">
                      <label className="field-label">Nome da Corretora</label>
                      <input
                        type="text"
                        className="form-input"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Nome completo da corretora"
                        required
                      />
                    </div>
                    <div className="field-group flex-1">
                      <label className="field-label">CNPJ</label>
                      <input
                        type="text"
                        className="form-input"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group full-width-field">
                    <label className="field-label">Endereço Completo</label>
                    <input
                      type="text"
                      className="form-input"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      placeholder="Rua, número, complemento, bairro, cidade - estado"
                      required
                    />
                  </div>
                </div>

                {/* Seção: Contato */}
                <div className="form-section" style={{ marginBottom: '20px' }}>
                  <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="section-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Informações de Contato</span>
                  </div>

                  <div className="form-row horizontal-close-fields">
                    <div className="field-group flex-1">
                      <label className="field-label">Assessor</label>
                      <input
                        type="text"
                        className="form-input"
                        name="assessor"
                        value={formData.assessor}
                        onChange={handleChange}
                        placeholder="Nome do assessor responsável"
                        required
                      />
                    </div>
                    <div className="field-group flex-1">
                      <label className="field-label">Telefone</label>
                      <input
                        type="tel"
                        className="form-input"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div className="field-group flex-1">
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contato@corretora.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Custos e Taxas */}
                <div className="form-section" style={{ marginBottom: '20px' }}>
                  <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span className="section-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Custos e Taxas</span>
                  </div>

                  <div className="form-row horizontal-close-fields">
                    <div className="field-group flex-1">
                      <label className="field-label">Corretagem Milho</label>
                      <div className="price-input-container-fixed">
                        <span className="currency-symbol-fixed">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input price-input-fixed"
                          name="corretagem_milho"
                          value={formData.corretagem_milho}
                          onChange={handleChange}
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group flex-1">
                      <label className="field-label">Corretagem Boi</label>
                      <div className="price-input-container-fixed">
                        <span className="currency-symbol-fixed">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input price-input-fixed"
                          name="corretagem_boi"
                          value={formData.corretagem_boi}
                          onChange={handleChange}
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row horizontal-close-fields">
                    <div className="field-group flex-1">
                      <label className="field-label">Taxas (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        name="taxas"
                        value={formData.taxas}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="field-group flex-1">
                      <label className="field-label">Impostos (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        name="impostos"
                        value={formData.impostos}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Usuários Vinculados */}
                <div className="field-group full-width-field">
                  <label className="field-label">Usuários Vinculados</label>
                  <div className="checkbox-group" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px',
                    marginTop: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                  }}>
                    {users.map(user => (
                      <label key={user.id} className="checkbox-label" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '13px' }}>{user.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                {editingBrokerage ? 'Salvar Alterações' : 'Adicionar Corretora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}