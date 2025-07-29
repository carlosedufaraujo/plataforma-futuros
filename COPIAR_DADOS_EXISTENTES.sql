-- COPIAR DADOS EXISTENTES - USAR COMO MODELO
-- Copiar estrutura dos dados existentes e adaptar para Ângelo

-- 1. Ver exatamente que dados já existem (para copiar formato)
SELECT 
    'TRANSACTION EXISTENTE:' as info,
    id,
    user_id,
    type,
    status,
    contract,
    quantity,
    price
FROM transactions 
LIMIT 3;

-- 2. Criar nova transaction baseada na existente
-- Substitua os IDs pelos valores reais que apareceram acima

INSERT INTO transactions (
    user_id,
    brokerage_id,
    position_id,
    date,
    type,
    contract,
    quantity,
    price,
    total,
    fees,
    status,
    created_at,
    custom_id
)
SELECT 
    '7f2dab2b-6772-46a7-9913-28247d0e6485', -- user_id do Ângelo
    brokerage_id,    -- copiar da transaction existente
    position_id,     -- copiar da transaction existente  
    CURRENT_TIMESTAMP - INTERVAL '1 hour', -- data recente
    type,            -- copiar tipo válido da transaction existente
    'CCMK25',        -- contract
    50,              -- quantity
    51.00,           -- price
    2550.00,         -- total
    fees,            -- copiar fees da transaction existente
    status,          -- copiar status válido da transaction existente
    CURRENT_TIMESTAMP - INTERVAL '1 hour', -- created_at
    custom_id        -- copiar custom_id da transaction existente
FROM transactions 
LIMIT 1;

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