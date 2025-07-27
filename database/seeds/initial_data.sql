-- Limpar dados existentes
DELETE FROM strategy_components;
DELETE FROM option_strategies;
DELETE FROM transactions;
DELETE FROM options;
DELETE FROM positions;
DELETE FROM prices;
DELETE FROM contracts;
DELETE FROM user_settings;
DELETE FROM users;

-- Inserir usuário de exemplo
INSERT INTO users (id, email, password_hash, name, initial_capital, current_capital) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@futurestrader.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewgYjvuPJ.YJ0K6G', 'Administrador', 200000.00, 245780.00);

-- Inserir contratos disponíveis
INSERT INTO contracts (id, symbol, contract_type, expiration_date, contract_size, unit, name) VALUES 
('c1000000-e29b-41d4-a716-446655440000', 'BGIK25', 'BGI', '2025-05-30', 330, 'arrobas', 'Boi Gordo - Maio/2025'),
('c2000000-e29b-41d4-a716-446655440000', 'BGIU25', 'BGI', '2025-09-30', 330, 'arrobas', 'Boi Gordo - Setembro/2025'),
('c3000000-e29b-41d4-a716-446655440000', 'BGIZ25', 'BGI', '2025-12-30', 330, 'arrobas', 'Boi Gordo - Dezembro/2025'),
('c4000000-e29b-41d4-a716-446655440000', 'CCMK25', 'CCM', '2025-05-30', 450, 'sacos', 'Milho - Maio/2025'),
('c5000000-e29b-41d4-a716-446655440000', 'CCMN25', 'CCM', '2025-07-30', 450, 'sacos', 'Milho - Julho/2025');

-- Inserir preços atuais
INSERT INTO prices (contract_id, price, volume) VALUES 
('c1000000-e29b-41d4-a716-446655440000', 335.50, 1250),
('c2000000-e29b-41d4-a716-446655440000', 342.80, 890),
('c3000000-e29b-41d4-a716-446655440000', 348.20, 567),
('c4000000-e29b-41d4-a716-446655440000', 85.20, 2340),
('c5000000-e29b-41d4-a716-446655440000', 86.20, 1876);

-- Inserir histórico de preços para gráficos
INSERT INTO prices (contract_id, price, volume, timestamp, is_current) VALUES 
-- BGI K25 (últimos 30 dias)
('c1000000-e29b-41d4-a716-446655440000', 330.00, 1100, NOW() - INTERVAL '30 days', false),
('c1000000-e29b-41d4-a716-446655440000', 328.50, 1200, NOW() - INTERVAL '25 days', false),
('c1000000-e29b-41d4-a716-446655440000', 331.20, 980, NOW() - INTERVAL '20 days', false),
('c1000000-e29b-41d4-a716-446655440000', 334.10, 1350, NOW() - INTERVAL '15 days', false),
('c1000000-e29b-41d4-a716-446655440000', 337.80, 1400, NOW() - INTERVAL '10 days', false),
('c1000000-e29b-41d4-a716-446655440000', 339.20, 1100, NOW() - INTERVAL '5 days', false),
-- CCM N25 (últimos 30 dias)
('c5000000-e29b-41d4-a716-446655440000', 85.00, 2100, NOW() - INTERVAL '30 days', false),
('c5000000-e29b-41d4-a716-446655440000', 83.20, 2400, NOW() - INTERVAL '25 days', false),
('c5000000-e29b-41d4-a716-446655440000', 84.50, 1900, NOW() - INTERVAL '20 days', false),
('c5000000-e29b-41d4-a716-446655440000', 85.80, 2200, NOW() - INTERVAL '15 days', false),
('c5000000-e29b-41d4-a716-446655440000', 86.90, 2500, NOW() - INTERVAL '10 days', false),
('c5000000-e29b-41d4-a716-446655440000', 86.40, 1800, NOW() - INTERVAL '5 days', false);

-- Inserir posições abertas de exemplo
INSERT INTO positions (
    id, user_id, contract_id, direction, quantity, entry_price, current_price, 
    stop_loss, take_profit, status, entry_date, unrealized_pnl
) VALUES 
(
    'p1000000-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    'c1000000-e29b-41d4-a716-446655440000',
    'LONG', 10, 330.00, 335.50, 325.00, 340.00, 'OPEN',
    NOW() - INTERVAL '7 days',
    18150.00
),
(
    'p2000000-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    'c5000000-e29b-41d4-a716-446655440000',
    'SHORT', 15, 85.00, 86.20, 88.00, 82.00, 'OPEN',
    NOW() - INTERVAL '5 days',
    -8100.00
);

-- Inserir posições fechadas (histórico)
INSERT INTO positions (
    id, user_id, contract_id, direction, quantity, entry_price, exit_price, 
    status, entry_date, exit_date, realized_pnl
) VALUES 
(
    'p3000000-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    'c2000000-e29b-41d4-a716-446655440000',
    'LONG', 5, 318.00, 322.50, 'CLOSED',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '13 days',
    7425.00
),
(
    'p4000000-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    'c4000000-e29b-41d4-a716-446655440000',
    'SHORT', 10, 84.50, 83.70, 'CLOSED',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '18 days',
    3600.00
),
(
    'p5000000-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    'c3000000-e29b-41d4-a716-446655440000',
    'LONG', 3, 340.00, 338.00, 'CLOSED',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '8 days',
    -1980.00
);

-- Inserir opções de exemplo
INSERT INTO options (
    id, user_id, contract_id, option_type, strike_price, premium, quantity, 
    expiration_date, is_purchased, delta, status
) VALUES 
(
    'o1000000-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'c1000000-e29b-41d4-a716-446655440000',
    'CALL', 340.00, 2.50, 10, '2025-05-30', true, 0.45, 'OPEN'
),
(
    'o2000000-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'c5000000-e29b-41d4-a716-446655440000',
    'PUT', 82.00, 1.80, 15, '2025-07-30', false, -0.32, 'OPEN'
);

-- Inserir estratégia de exemplo (Bull Call Spread)
INSERT INTO option_strategies (
    id, user_id, name, description, max_profit, max_loss, breakeven, cost, status
) VALUES 
(
    's1000000-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'Bull Call Spread', 
    'Compra Call 330 + Venda Call 340 no BGIK25',
    3300.00, 1250.00, 333.80, 1250.00, 'OPEN'
);

-- Inserir componentes da estratégia
INSERT INTO strategy_components (strategy_id, option_id) VALUES 
('s1000000-e29b-41d4-a716-446655440000', 'o1000000-e29b-41d4-a716-446655440000');

-- Inserir transações de exemplo
INSERT INTO transactions (
    user_id, position_id, contract_id, transaction_type, quantity, price, total_amount, fees, executed_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'p1000000-e29b-41d4-a716-446655440000',
    'c1000000-e29b-41d4-a716-446655440000',
    'BUY', 10, 330.00, 1089000.00, 25.00,
    NOW() - INTERVAL '7 days'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'p2000000-e29b-41d4-a716-446655440000',
    'c5000000-e29b-41d4-a716-446655440000',
    'SELL', 15, 85.00, 573750.00, 18.75,
    NOW() - INTERVAL '5 days'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'p3000000-e29b-41d4-a716-446655440000',
    'c2000000-e29b-41d4-a716-446655440000',
    'SELL', 5, 322.50, 531825.00, 12.50,
    NOW() - INTERVAL '13 days'
);

-- Inserir configurações do usuário
INSERT INTO user_settings (
    user_id, api_url, risk_limit, auto_hedge, notifications
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'wss://api.b3.com.br/marketdata/v1',
    50000.00, false, true
); 