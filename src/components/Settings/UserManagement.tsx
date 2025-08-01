'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

interface Brokerage {
  id: string;
  nome: string;
  cnpj: string;
}

interface UserBrokerage {
  user_id: string;
  brokerage_id: string;
  brokerages?: Brokerage;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [userBrokerages, setUserBrokerages] = useState<UserBrokerage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedBrokerages, setSelectedBrokerages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    telefone: '',
    email: ''
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
      
      // Carregar usuários (admin vê todos, trader vê só a si mesmo)
      let usersQuery = supabase.from('users').select('*');
      
      if (!isAdmin && currentUser?.id) {
        usersQuery = usersQuery.eq('id', currentUser.id);
      }
      
      const { data: usersData, error: usersError } = await usersQuery.order('nome');
      
      if (usersError) throw usersError;
      
      // Carregar corretoras
      const { data: brokeragesData, error: brokeragesError } = await supabase
        .from('brokerages')
        .select('*')
        .order('nome');
      
      if (brokeragesError) throw brokeragesError;
      
      // Carregar vinculações (admin vê todas, trader vê só as suas)
      let userBrokeragesQuery = supabase
        .from('user_brokerages')
        .select('*, brokerages(nome)');
      
      if (!isAdmin && currentUser?.id) {
        userBrokeragesQuery = userBrokeragesQuery.eq('user_id', currentUser.id);
      }
      
      const { data: userBrokeragesData, error: ubError } = await userBrokeragesQuery.order('user_id');
      
      if (ubError) throw ubError;
      
      setUsers(usersData || []);
      setBrokerages(brokeragesData || []);
      setUserBrokerages(userBrokeragesData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obter corretoras de um usuário
  const getUserBrokerages = (userId: string): string => {
    const userBrokeragesList = userBrokerages
      .filter(ub => ub.user_id === userId)
      .map(ub => ub.brokerages?.nome)
      .filter(Boolean);
    
    return userBrokeragesList.length > 0 ? userBrokeragesList.join(', ') : 'Nenhuma';
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      cpf: '',
      endereco: '',
      telefone: '',
      email: ''
    });
    setSelectedBrokerages([]);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      cpf: user.cpf,
      endereco: user.endereco,
      telefone: user.telefone,
      email: user.email
    });
    
    // Carregar corretoras vinculadas
    const userBrokerageIds = userBrokerages
      .filter(ub => ub.user_id === user.id)
      .map(ub => ub.brokerage_id);
    setSelectedBrokerages(userBrokerageIds);
    
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (confirm(`Deseja excluir o usuário "${user.nome}"?\n\nCPF: ${user.cpf}\nEmail: ${user.email}\n\nEsta ação não pode ser desfeita.`)) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Recarregar dados
        await loadData();
        
        // Feedback visual
        showToast(`Usuário "${user.nome}" excluído com sucesso!`, 'success');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showToast('Erro ao excluir usuário', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Editar usuário existente
        const { error } = await supabase
          .from('users')
          .update(formData)
          .eq('id', editingUser.id);
        
        if (error) throw error;
        
        // Atualizar corretoras vinculadas
        await updateUserBrokerages(editingUser.id);
        
      } else {
        // Adicionar novo usuário
        try {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
              ...formData,
              is_active: true
            }])
            .select()
            .maybeSingle();
          
          if (error) throw error;
          
          // Vincular corretoras
          if (newUser && selectedBrokerages.length > 0) {
            await updateUserBrokerages(newUser.id);
          }
        } catch (insertError: any) {
          console.error('❌ Erro ao criar usuário:', insertError);
          
          // Se o erro foi no .maybeSingle(), tentar sem ele
          if (insertError.message?.includes('single') || insertError.code === 'PGRST116') {
            
            const { data: newUserArray, error: retryError } = await supabase
              .from('users')
              .insert([{
                ...formData,
                is_active: true
              }])
              .select();
            
            if (retryError) throw retryError;
            
            const newUser = newUserArray?.[0];
            if (newUser && selectedBrokerages.length > 0) {
              await updateUserBrokerages(newUser.id);
            }
          } else {
            throw insertError;
          }
        }
      }
      
      // Recarregar dados
      await loadData();
      setIsModalOpen(false);
      showToast(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      showToast('Erro ao salvar usuário', 'error');
    }
  };

  const updateUserBrokerages = async (userId: string) => {
    try {
      // Remover vinculações antigas
      await supabase
        .from('user_brokerages')
        .delete()
        .eq('user_id', userId);
      
      // Adicionar novas vinculações
      if (selectedBrokerages.length > 0) {
        const newBrokerages = selectedBrokerages.map(brokerageId => ({
          user_id: userId,
          brokerage_id: brokerageId,
          role: 'trader'
        }));
        
        await supabase
          .from('user_brokerages')
          .insert(newBrokerages);
      }
    } catch (error) {
      console.error('Erro ao atualizar corretoras:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBrokerageToggle = (brokerageId: string) => {
    setSelectedBrokerages(prev => 
      prev.includes(brokerageId)
        ? prev.filter(id => id !== brokerageId)
        : [...prev, brokerageId]
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
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="settings-header">
        <div className="settings-header-main" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ margin: 0 }}>
            {isAdmin ? 'Gerenciamento de Usuários' : 'Meu Perfil'}
          </h2>
          <p className="settings-subtitle" style={{ textAlign: 'left', margin: 0 }}>
            {isAdmin 
              ? `Total de ${users.length} usuários cadastrados`
              : 'Visualize e edite suas informações pessoais'
            }
          </p>
        </div>
        <div className="settings-actions">
          {isAdmin && (
            <button 
              className="btn btn-primary btn-header-action"
              onClick={handleAddUser}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              Novo Usuário
            </button>
          )}
          {!isAdmin && users.length > 0 && (
            <button 
              className="btn btn-primary btn-header-action"
              onClick={() => handleEditUser(users[0])}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Endereço</th>
                <th>Contato</th>
                <th>Corretoras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.nome}</strong></td>
                  <td>{user.cpf}</td>
                  <td>{user.endereco}</td>
                  <td>
                    <div style={{ lineHeight: '1.4' }}>
                      <div>{user.telefone}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                  </td>
                  <td>{getUserBrokerages(user.id)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-profile-container" style={{ padding: '20px 0' }}>
          {users.length > 0 && (
            <div className="profile-card" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              padding: '20px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <div className="profile-field">
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nome:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{users[0].nome}</p>
              </div>
              <div className="profile-field">
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>CPF:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{users[0].cpf}</p>
              </div>
              <div className="profile-field">
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{users[0].email}</p>
              </div>
              <div className="profile-field">
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Telefone:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{users[0].telefone}</p>
              </div>
              <div className="profile-field" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Endereço:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{users[0].endereco}</p>
              </div>
              <div className="profile-field" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Corretoras Vinculadas:</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{getUserBrokerages(users[0].id)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para adicionar/editar usuário */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal position-modal">
            {/* Header */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <span className="modal-subtitle">
                  {editingUser ? `Modificar dados de ${editingUser.nome}` : 'Cadastrar novo usuário no sistema'}
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
                {/* Campos principais horizontais */}
                <div className="form-row horizontal-close-fields">
                  <div className="field-group flex-1">
                    <label className="field-label">Nome Completo</label>
                    <input
                      type="text"
                      className="form-input"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="field-group flex-1">
                    <label className="field-label">CPF</label>
                    <input
                      type="text"
                      className="form-input"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                {/* Campo endereço em linha separada */}
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

                {/* Contato em linha horizontal */}
                <div className="form-row horizontal-close-fields">
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
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                {/* Corretoras Vinculadas */}
                <div className="field-group full-width-field">
                  <label className="field-label">Corretoras Vinculadas</label>
                  <div className="checkbox-group" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    {brokerages.map(brokerage => (
                      <label key={brokerage.id} className="checkbox-label" style={{
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
                          checked={selectedBrokerages.includes(brokerage.id)}
                          onChange={() => handleBrokerageToggle(brokerage.id)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '13px' }}>{brokerage.nome}</span>
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
                {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}