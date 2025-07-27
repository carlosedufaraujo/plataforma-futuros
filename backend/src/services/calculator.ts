import { Position, PositionDirection, PnLCalculation, RentabilityMetrics, Contract } from '../types';

// Tamanhos de contratos conforme o original
export const CONTRACT_SIZES = {
  BGI: { size: 330, unit: 'arrobas', name: 'Boi Gordo' },
  CCM: { size: 450, unit: 'sacos', name: 'Milho' }
} as const;

/**
 * Calcula P&L de uma posição EXATAMENTE como no HTML original
 * LONG (Compra): Ganha quando o preço SOBE, perde quando CAI
 * SHORT (Venda): Ganha quando o preço CAI, perde quando SOBE
 */
export const calculatePositionPnL = (position: {
  direction: PositionDirection;
  quantity: number;
  entry_price: number;
  current_price: number;
  contract_size: number;
}): PnLCalculation => {
  const { direction, quantity, entry_price, current_price, contract_size } = position;
  
  // Quantidade total (contratos * tamanho)
  const totalQuantity = quantity * contract_size;
  
  // Diferença de preço
  const priceDiff = current_price - entry_price;
  
  // P&L baseado na direção - REPLICANDO LÓGICA EXATA DO HTML
  let pnl = 0;
  if (direction === 'LONG') {
    // LONG: P&L = (Preço Atual - Preço Entrada) * Quantidade Total
    pnl = priceDiff * totalQuantity;
  } else {
    // SHORT: P&L = (Preço Entrada - Preço Atual) * Quantidade Total
    // Ou seja: -(Preço Atual - Preço Entrada) * Quantidade Total
    pnl = -priceDiff * totalQuantity;
  }
  
  // Exposição (valor nocional da posição)
  const exposure = entry_price * totalQuantity;
  
  // P&L percentual
  const pnl_percentage = exposure > 0 ? (pnl / exposure) * 100 : 0;
  
  return {
    pnl,
    pnl_percentage,
    total_quantity: totalQuantity,
    exposure,
    price_diff: priceDiff
  };
};

/**
 * Calcula preço alvo para determinado P&L
 */
export const calculateTargetPrice = (position: {
  direction: PositionDirection;
  entry_price: number;
  quantity: number;
  contract_size: number;
}, targetPnL: number): number => {
  const { direction, entry_price, quantity, contract_size } = position;
  const totalQuantity = quantity * contract_size;
  
  if (direction === 'LONG') {
    // Para LONG: targetPrice = entryPrice + (targetPnL / totalQuantity)
    return entry_price + (targetPnL / totalQuantity);
  } else {
    // Para SHORT: targetPrice = entryPrice - (targetPnL / totalQuantity)
    return entry_price - (targetPnL / totalQuantity);
  }
};

/**
 * Calcula métricas de rentabilidade
 */
export const calculateRentabilityMetrics = (
  positions: Position[],
  initialCapital: number
): RentabilityMetrics => {
  // Filtrar posições fechadas para cálculos históricos
  const closedPositions = positions.filter(p => p.status === 'CLOSED' && p.realized_pnl !== null);
  
  // P&L total realizado
  const totalPnL = closedPositions.reduce((sum, pos) => sum + (pos.realized_pnl || 0), 0);
  
  // ROI
  const roi = initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;
  
  // Win Rate
  const winningTrades = closedPositions.filter(p => (p.realized_pnl || 0) > 0).length;
  const totalTrades = closedPositions.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  // Sharpe Ratio (simplificado)
  const returns = closedPositions.map(p => ((p.realized_pnl || 0) / initialCapital) * 100);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const returnStdDev = calculateStandardDeviation(returns);
  const sharpeRatio = returnStdDev > 0 ? avgReturn / returnStdDev : 0;
  
  // Max Drawdown
  let peak = initialCapital;
  let maxDrawdown = 0;
  let runningCapital = initialCapital;
  
  closedPositions
    .sort((a, b) => new Date(a.exit_date || 0).getTime() - new Date(b.exit_date || 0).getTime())
    .forEach(position => {
      runningCapital += (position.realized_pnl || 0);
      if (runningCapital > peak) {
        peak = runningCapital;
      }
      const drawdown = ((peak - runningCapital) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
  
  return {
    total_pnl: totalPnL,
    roi,
    win_rate: winRate,
    sharpe_ratio: sharpeRatio,
    max_drawdown: maxDrawdown,
    total_trades: totalTrades,
    winning_trades: winningTrades,
    losing_trades: totalTrades - winningTrades
  };
};

/**
 * Calcula desvio padrão
 */
const calculateStandardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  
  return Math.sqrt(avgSquareDiff);
};

/**
 * Calcula payoff de opção (para o gráfico)
 */
export const calculateOptionPayoff = (
  optionType: 'CALL' | 'PUT',
  strikePrice: number,
  premium: number,
  underlyingPrice: number,
  isPurchased: boolean,
  contractSize: number = 330
): number => {
  let intrinsicValue = 0;
  
  if (optionType === 'CALL') {
    intrinsicValue = Math.max(underlyingPrice - strikePrice, 0);
  } else {
    intrinsicValue = Math.max(strikePrice - underlyingPrice, 0);
  }
  
  const payoff = isPurchased 
    ? (intrinsicValue - premium) * contractSize
    : (premium - intrinsicValue) * contractSize;
  
  return payoff;
};

/**
 * Simula dados de payoff para gráfico (como no HTML original)
 */
export const generatePayoffData = (
  optionType: 'CALL' | 'PUT',
  strikePrice: number,
  premium: number,
  isPurchased: boolean,
  contractSize: number = 330,
  priceRange: { min: number; max: number; step: number } = { min: 300, max: 360, step: 2 }
): Array<{ price: number; payoff: number }> => {
  const data = [];
  
  for (let price = priceRange.min; price <= priceRange.max; price += priceRange.step) {
    const payoff = calculateOptionPayoff(optionType, strikePrice, premium, price, isPurchased, contractSize);
    data.push({ price, payoff });
  }
  
  return data;
};

/**
 * Calcula exposição total do portfólio
 */
export const calculatePortfolioExposure = (positions: Position[], contracts: Contract[]): number => {
  const contractMap = new Map(contracts.map(c => [c.id, c]));
  
  return positions
    .filter(p => p.status === 'OPEN')
    .reduce((total, position) => {
      const contract = contractMap.get(position.contract_id);
      if (!contract) return total;
      
      const exposure = position.entry_price * position.quantity * contract.contract_size;
      return total + exposure;
    }, 0);
};

/**
 * Calcula margem necessária (simplificado - 10% da exposição)
 */
export const calculateMarginRequired = (exposure: number): number => {
  return exposure * 0.1; // 10% de margem
};

/**
 * Formata valores monetários para exibição
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata percentual para exibição
 */
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}; 