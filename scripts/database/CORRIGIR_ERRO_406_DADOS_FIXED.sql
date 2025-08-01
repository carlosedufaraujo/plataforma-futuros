-- CORRIGIR ERRO 406 - INSERIR DADOS PARA ÂNGELO (VERSÃO CORRIGIDA)
-- Usar valores de status compatíveis com constraints

-- 1. Inserir transactions de exemplo para Ângelo Caiado
INSERT INTO transactions (
    user_id,
    date,
    type,
    contract,
    quantity,
    price,
    total,
    status,
    created_at
) VALUES 
-- Transaction 1: Compra
(
    '7f2dab2b-6772-46a7-9913-28247d0e6485',  -- Ângelo user_id
    CURRENT_TIMESTAMP - INTERVAL '2 days',    -- 2 dias atrás
    'BUY',
    'CCMK25',
    100,
    50.00,
    5000.00,
    'active',  -- Usar 'active' em vez de 'completed'
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
-- Transaction 2: Venda parcial
(
    '7f2dab2b-6772-46a7-9913-28247d0e6485',  -- Ângelo user_id
    CURRENT_TIMESTAMP - INTERVAL '1 day',     -- 1 dia atrás
    'SELL',
    'CCMK25',
    50,
    52.00,
    2600.00,
    'closed',  -- Usar 'closed' para venda
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
-- Transaction 3: Compra recente
(
    '7f2dab2b-6772-46a7-9913-28247d0e6485',  -- Ângelo user_id
    CURRENT_TIMESTAMP - INTERVAL '2 hours',   -- 2 horas atrás
    'BUY',
    'CCMK25',
    25,
    51.50,
    1287.50,
    'pending',  -- Usar 'pending' para recente
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
);

-- 2. Se ainda der erro, tentar sem status (usar default)
-- INSERT INTO transactions (
--     user_id,
--     date, 
--     type,
--     contract,
--     quantity,
--     price,
--     total,
--     created_at
-- ) VALUES 
-- (
--     '7f2dab2b-6772-46a7-9913-28247d0e6485',
--     CURRENT_TIMESTAMP - INTERVAL '1 hour',
--     'BUY',
--     'CCMK25',
--     10,
--     51.00,
--     510.00,
--     CURRENT_TIMESTAMP - INTERVAL '1 hour'
-- );

-- 3. Verificar inserção
SELECT 'VERIFICAÇÃO INSERÇÃO' as teste,
       count(*)::text as transactions_angelo,
       'Dados inseridos para Ângelo' as resultado
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 4. Testar a query que estava falhando
SELECT * 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
ORDER BY date DESC 
LIMIT 1; 