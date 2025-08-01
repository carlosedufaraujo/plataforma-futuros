'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Target } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { useData } from '@/contexts/DataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Chart, registerables } from 'chart.js';

// Registrar componentes do Chart.js
Chart.register(...registerables);

interface RentabilidadePageProps {
  selectedPeriod: string;
}

export default function RentabilidadePage({ selectedPeriod }: RentabilidadePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  
  const { positions, transactions, options, currentUser, loading } = useData();
  const { user, loading: authLoading } = useAuth();
  
  // Referencias para os gráficos
  const capitalChartRef = useRef<HTMLCanvasElement>(null);
  const plByContractChartRef = useRef<HTMLCanvasElement>(null);

  // Calcular dados reais baseados nas posições e transações
  const portfolioData = useMemo(() => {
    
    if (!currentUser) {
      return {
        totalValue: 0,
        dailyPnL: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        initialCapital: 0,
        totalInvested: 0,
        totalRealized: 0,
        openPositionsValue: 0,
        closedPositionsValue: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        totalTrades: 0,
        profitableTrades: 0,
        losingTrades: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        roi: 0
      };
    }

    // Filtrar posições do usuário atual
    const userPositions = positions.filter(p => p.user_id === currentUser.id);
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);

    // Calcular métricas básicas
    const openPositions = userPositions.filter(p => p.status === 'EXECUTADA' || p.status === 'EM_ABERTO');
    const closedPositions = userPositions.filter(p => p.status === 'FECHADA');

    const totalInvested = userTransactions
      .filter(t => t.type === 'COMPRA')
      .reduce((sum, t) => sum + t.total, 0);

    const totalRealized = closedPositions
      .reduce((sum, p) => sum + (p.realized_pnl || 0), 0);

    const openPositionsValue = openPositions
      .reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);

    const totalPnL = totalRealized + openPositionsValue;
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    // Calcular win rate
    const profitableTrades = closedPositions.filter(p => (p.realized_pnl || 0) > 0).length;
    const losingTrades = closedPositions.filter(p => (p.realized_pnl || 0) < 0).length;
    const totalTrades = closedPositions.length;
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    // Calcular médias
    const wins = closedPositions.filter(p => (p.realized_pnl || 0) > 0);
    const losses = closedPositions.filter(p => (p.realized_pnl || 0) < 0);
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + (p.realized_pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + (p.realized_pnl || 0), 0) / losses.length : 0;

    // Melhor e pior trade
    const pnls = closedPositions.map(p => p.realized_pnl || 0);
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

    return {
      totalValue: totalInvested + totalPnL,
      dailyPnL: 0, // Implementar cálculo diário
      totalPnL,
      totalPnLPercentage,
      initialCapital: totalInvested,
      totalInvested,
      totalRealized,
      openPositionsValue,
      closedPositionsValue: totalRealized,
      winRate,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      totalTrades,
      profitableTrades,
      losingTrades,
      sharpeRatio: 0, // Implementar cálculo
      maxDrawdown: 0, // Implementar cálculo
      roi: totalPnLPercentage
    };
  }, [positions, transactions, currentUser, selectedPeriod]);

  // Estados de loading e vazio
  if (authLoading || loading) {
    return (
      <div className="rentabilidade-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Carregando Dashboard...</div>
          <div className="loading-subtitle">Processando dados de rentabilidade</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rentabilidade-page">
        <div className="empty-state">
          <div className="empty-icon">
            <DollarSign size={48} />
          </div>
          <h3 className="empty-title">Acesso Restrito</h3>
          <p className="empty-description">
            Faça login para visualizar seus dados de rentabilidade
          </p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="portfolio-summary">
      {/* Dashboard Principal */}
      <div className="portfolio-main">
        <div className="portfolio-header">
          <h2>Portfolio Overview</h2>
          <div className="period-badge">
            <span>{selectedPeriod === 'all' ? 'Todo período' : selectedPeriod}</span>
          </div>
        </div>

        {/* Métricas Principais em Grid */}
        <div className="portfolio-overview">
          <div className="metric-card">
            <div className="metric-card-icon">
              <DollarSign size={20} />
            </div>
            <div className={`metric-card-value ${portfolioData.totalValue >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div className="metric-card-label">Valor Total</div>
            {portfolioData.totalPnLPercentage !== 0 && (
              <div className={`metric-card-change ${portfolioData.totalPnLPercentage >= 0 ? 'positive' : 'negative'}`}>
                {portfolioData.totalPnLPercentage >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {formatPercentage(Math.abs(portfolioData.totalPnLPercentage))}
              </div>
            )}
          </div>

          <div className="metric-card">
            <div className="metric-card-icon">
              <BarChart3 size={20} />
            </div>
            <div className={`metric-card-value ${portfolioData.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolioData.totalPnL)}
            </div>
            <div className="metric-card-label">P&L Total</div>
            <div className={`metric-card-change ${portfolioData.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {portfolioData.totalPnL >= 0 ? '+' : ''}{formatPercentage(portfolioData.totalPnLPercentage)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-icon">
              <Target size={20} />
            </div>
            <div className={`metric-card-value ${portfolioData.winRate >= 50 ? 'positive' : 'negative'}`}>
              {formatPercentage(portfolioData.winRate)}
            </div>
            <div className="metric-card-label">Win Rate</div>
            <div className="metric-card-change neutral">
              {portfolioData.totalTrades} trades
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-icon">
              <PieChart size={20} />
            </div>
            <div className="metric-card-value">
              {formatCurrency(portfolioData.totalInvested)}
            </div>
            <div className="metric-card-label">Total Investido</div>
            <div className="metric-card-change neutral">
              {positions.filter(p => p.user_id === currentUser?.id).length} posições
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução do Capital */}
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-placeholder-icon">
              <BarChart3 size={48} />
            </div>
            <div className="chart-placeholder-title">Evolução do Capital</div>
            <div className="chart-placeholder-text">
              Gráfico será renderizado quando houver dados suficientes
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar com Estatísticas Detalhadas */}
      <div className="portfolio-sidebar">
        <h3>Estatísticas Detalhadas</h3>
        
        <div className="portfolio-stats">
          <div className="stat-item">
            <span className="stat-label">Posições Abertas</span>
            <span className={`stat-value ${portfolioData.openPositionsValue >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolioData.openPositionsValue)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Posições Fechadas</span>
            <span className={`stat-value ${portfolioData.closedPositionsValue >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolioData.closedPositionsValue)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Melhor Trade</span>
            <span className="stat-value positive">
              {formatCurrency(portfolioData.bestTrade)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Pior Trade</span>
            <span className="stat-value negative">
              {formatCurrency(portfolioData.worstTrade)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Ganho Médio</span>
            <span className="stat-value positive">
              {formatCurrency(portfolioData.avgWin)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Perda Média</span>
            <span className="stat-value negative">
              {formatCurrency(portfolioData.avgLoss)}
            </span>
          </div>
        </div>

        {/* Gráfico de P&L por Contrato */}
        <div className="chart-container" style={{ height: '220px', marginTop: '16px' }}>
          <div className="chart-placeholder">
            <div className="chart-placeholder-icon">
              <PieChart size={36} />
            </div>
            <div className="chart-placeholder-title">P&L por Contrato</div>
            <div className="chart-placeholder-text">
              Distribuição por ativo
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rentabilidade-page">
      {renderOverview()}
    </div>
  );
} 