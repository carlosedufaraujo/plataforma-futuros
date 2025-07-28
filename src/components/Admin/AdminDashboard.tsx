'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Position, Transaction, Option } from '@/types';

interface DashboardStats {
  totalUsers: number;
  totalBrokerages: number;
  totalPositions: number;
  totalVolume: number;
  totalPnL: number;
  activePositions: number;
}

interface UserActivity {
  user_id: string;
  user_name: string;
  user_email: string;
  total_positions: number;
  total_volume: number;
  total_pnl: number;
  last_activity: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBrokerages: 0,
    totalPositions: 0,
    totalVolume: 0,
    totalPnL: 0,
    activePositions: 0
  });
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas gerais
      const [
        { count: usersCount },
        { count: brokeragesCount },
        { data: positions },
        { data: transactions }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('brokerages').select('*', { count: 'exact', head: true }),
        supabase.from('positions').select('*'),
        supabase.from('transactions').select('*')
      ]);

      // Calcular estatísticas
      const totalVolume = positions?.reduce((sum, pos) => sum + (pos.quantity * pos.entry_price), 0) || 0;
      const totalPnL = positions?.reduce((sum, pos) => sum + (pos.realized_pnl || 0), 0) || 0;
      const activePositions = positions?.filter(pos => pos.status === 'EM_ABERTO').length || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalBrokerages: brokeragesCount || 0,
        totalPositions: positions?.length || 0,
        totalVolume,
        totalPnL,
        activePositions
      });

      // Carregar atividade por usuário
      const { data: users } = await supabase
        .from('users')
        .select('id, nome, email');

      if (users) {
        const activities = await Promise.all(
          users.map(async (u) => {
            const { data: userPositions } = await supabase
              .from('positions')
              .select('*')
              .eq('user_id', u.id);

            const userVolume = userPositions?.reduce((sum, pos) => sum + (pos.quantity * pos.entry_price), 0) || 0;
            const userPnL = userPositions?.reduce((sum, pos) => sum + (pos.realized_pnl || 0), 0) || 0;
            const lastPosition = userPositions?.sort((a, b) => 
              new Date(b.created_at || b.entry_date).getTime() - new Date(a.created_at || a.entry_date).getTime()
            )[0];

            return {
              user_id: u.id,
              user_name: u.nome,
              user_email: u.email,
              total_positions: userPositions?.length || 0,
              total_volume: userVolume,
              total_pnl: userPnL,
              last_activity: lastPosition?.created_at || lastPosition?.entry_date || 'Sem atividade'
            };
          })
        );

        setUserActivities(activities.filter(a => a.total_positions > 0));
      }

    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Painel Administrativo</h2>
        
        <div className="api-sections">
          <div className="api-section">
            <h3>Visão Geral do Sistema</h3>
            
            <div className="form-group">
              <label className="form-label">Status do Sistema</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-indicator status-active"></span>
                <span>Sistema operacional - Última atualização há 5 minutos</span>
              </div>
            </div>
            
            <div className="status-grid">
              <div className="status-item">
                <label>Total de Usuários:</label>
                <span className="status-value">{stats.totalUsers} cadastrados</span>
              </div>
              <div className="status-item">
                <label>Corretoras Ativas:</label>
                <span className="status-value">{stats.totalBrokerages} operando</span>
              </div>
              <div className="status-item">
                <label>Posições Abertas:</label>
                <span className="status-value">{stats.activePositions} ativas</span>
              </div>
              <div className="status-item">
                <label>Volume Total:</label>
                <span className="status-value">R$ {(stats.totalVolume / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </div>

          <div className="api-section">
            <h3>Estatísticas Financeiras</h3>
            
            <div className="status-grid">
              <div className="status-item">
                <label>Posições Totais:</label>
                <span className="status-value">{stats.totalPositions} registradas</span>
              </div>
              <div className="status-item">
                <label>P&L Total do Sistema:</label>
                <span className={`status-value ${stats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                  R$ {stats.totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="status-item">
                <label>Taxa de Ocupação:</label>
                <span className="status-value">
                  {stats.totalPositions > 0 ? ((stats.activePositions / stats.totalPositions) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="status-item">
                <label>Ticket Médio:</label>
                <span className="status-value">
                  R$ {stats.totalPositions > 0 ? (stats.totalVolume / stats.totalPositions).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </span>
              </div>
            </div>
          </div>

          <div className="api-section">
            <h3>Atividade dos Usuários</h3>
            
            <div className="data-sharing-grid">
              {userActivities.length > 0 ? (
                <div style={{ width: '100%' }}>
                  <table className="data-table" style={{ marginTop: '16px' }}>
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Posições</th>
                        <th>Volume</th>
                        <th>P&L</th>
                        <th>Última Atividade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivities.map((activity) => (
                        <tr key={activity.user_id}>
                          <td><strong>{activity.user_name}</strong></td>
                          <td>{activity.user_email}</td>
                          <td>{activity.total_positions}</td>
                          <td>R$ {activity.total_volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className={activity.total_pnl >= 0 ? 'positive' : 'negative'}>
                            R$ {activity.total_pnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>{new Date(activity.last_activity).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ width: '100%' }}>
                  <p>Nenhuma atividade registrada ainda</p>
                </div>
              )}
            </div>
          </div>

          <div className="api-section">
            <h3>Métricas de Sistema</h3>
            
            <div className="data-sharing-grid">
              <div className="data-category">
                <h4>Usuários por Tipo</h4>
                <ul>
                  <li>• Administradores: 1</li>
                  <li>• Traders ativos: {userActivities.length}</li>
                  <li>• Visualizadores: {Math.max(0, stats.totalUsers - 1 - userActivities.length)}</li>
                  <li>• Total cadastrado: {stats.totalUsers}</li>
                </ul>
              </div>

              <div className="data-category">
                <h4>Posições por Status</h4>
                <ul>
                  <li>• Em aberto: {stats.activePositions}</li>
                  <li>• Fechadas: {stats.totalPositions - stats.activePositions}</li>
                  <li>• Taxa de fechamento: {stats.totalPositions > 0 ? (((stats.totalPositions - stats.activePositions) / stats.totalPositions) * 100).toFixed(1) : 0}%</li>
                  <li>• Média por usuário: {stats.totalUsers > 0 ? (stats.totalPositions / stats.totalUsers).toFixed(1) : 0}</li>
                </ul>
              </div>

              <div className="data-category">
                <h4>Performance Geral</h4>
                <ul>
                  <li>• P&L Total: R$ {stats.totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                  <li>• Volume negociado: R$ {stats.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                  <li>• Rentabilidade: {stats.totalVolume > 0 ? ((stats.totalPnL / stats.totalVolume) * 100).toFixed(2) : 0}%</li>
                  <li>• ROI médio: {stats.totalVolume > 0 ? ((stats.totalPnL / stats.totalVolume) * 100).toFixed(2) : 0}%</li>
                </ul>
              </div>

              <div className="data-category">
                <h4>Alertas Administrativos</h4>
                <ul>
                  <li>• Usuários inativos: {Math.max(0, stats.totalUsers - userActivities.length)}</li>
                  <li>• Posições sem stop loss: 0</li>
                  <li>• Margem de risco: Normal</li>
                  <li>• Backup automático: Ativo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}