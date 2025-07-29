-- CORREÇÃO SIMPLES ERRO 406 - USAR STATUS EXISTENTE
-- Primeiro ver que status já existe, depois usar o mesmo

-- 1. Ver que status está sendo usado na tabela
SELECT DISTINCT status FROM transactions;

-- 2. Inserir uma transaction simples usando o status existente
-- (substitua 'STATUS_EXISTENTE' pelo valor que apareceu acima)

INSERT INTO transactions (
    user_id,
    date,
    type,
    contract,
    quantity,
    price,
    total,
    created_at
) VALUES (
    '7f2dab2b-6772-46a7-9913-28247d0e6485',  -- Ângelo user_id
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    'BUY',
    'CCMK25',
    50,
    51.00,
    2550.00,
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
);

-- 3. Verificar se funcionou
SELECT count(*) as total_angelo
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 4. Testar query problemática
SELECT * 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
ORDER BY date DESC 
LIMIT 1; 