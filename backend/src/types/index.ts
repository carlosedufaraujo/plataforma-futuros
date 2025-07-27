export type ContractType = 'BGI' | 'CCM' | 'ICF' | 'DOL' | 'IND';
export type PositionDirection = 'COMPRA' | 'VENDA';
export type OptionType = 'CALL' | 'PUT';
export type TransactionType = 'BUY' | 'SELL' | 'EXERCISE' | 'EXPIRE';
export type PositionStatus = 'OPEN' | 'CLOSED' | 'PARTIAL';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  initial_capital: number;
  current_capital: number;
  theme: string;
  created_at: Date;
  updated_at: Date;
}

export interface Contract {
  id: string;
  symbol: string;
  contract_type: ContractType;
  expiration_date: Date;
  contract_size: number;
  unit: string;
  name: string;
  is_active: boolean;
  created_at: Date;
}

export interface Price {
  id: string;
  contract_id: string;
  price: number;
  volume: number;
  timestamp: Date;
  is_current: boolean;
}

export interface Position {
  id: string;
  user_id: string;
  contract_id: string;
  direction: PositionDirection;
  quantity: number;
  entry_price: number;
  current_price?: number;
  stop_loss?: number;
  take_profit?: number;
  status: PositionStatus;
  entry_date: Date;
  exit_date?: Date;
  exit_price?: number;
  realized_pnl?: number;
  unrealized_pnl?: number;
  fees: number;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  id: string;
  user_id: string;
  contract_id: string;
  option_type: OptionType;
  strike_price: number;
  premium: number;
  quantity: number;
  expiration_date: Date;
  is_purchased: boolean;
  status: PositionStatus;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  created_at: Date;
  updated_at: Date;
}

export interface OptionStrategy {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  max_profit?: number;
  max_loss?: number;
  breakeven?: number;
  cost?: number;
  status: PositionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  position_id?: string;
  option_id?: string;
  contract_id: string;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  executed_at: Date;
  notes?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  api_url?: string;
  risk_limit: number;
  auto_hedge: boolean;
  notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

// DTOs para requests/responses
export interface CreatePositionDto {
  contract_id: string;
  direction: PositionDirection;
  quantity: number;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface UpdatePositionDto {
  stop_loss?: number;
  take_profit?: number;
  current_price?: number;
}

export interface CreateOptionDto {
  contract_id: string;
  option_type: OptionType;
  strike_price: number;
  premium: number;
  quantity: number;
  expiration_date: string;
  is_purchased: boolean;
  delta?: number;
}

export interface PnLCalculation {
  pnl: number;
  pnl_percentage: number;
  total_quantity: number;
  exposure: number;
  price_diff: number;
}

export interface RentabilityMetrics {
  total_pnl: number;
  roi: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
}

export interface PortfolioSummary {
  total_positions: number;
  total_exposure: number;
  unrealized_pnl: number;
  realized_pnl: number;
  cash_balance: number;
  margin_used: number;
  margin_available: number;
}

// WebSocket messages
export interface WSMessage {
  type: 'price_update' | 'position_update' | 'order_fill' | 'error';
  payload: any;
}

export interface PriceUpdate {
  contract_id: string;
  symbol: string;
  price: number;
  timestamp: Date;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 