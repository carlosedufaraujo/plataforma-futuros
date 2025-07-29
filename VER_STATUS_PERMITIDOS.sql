-- VER STATUS PERMITIDOS - DESCOBRIR CONSTRAINT EXATA
-- Descobrir exatamente quais valores são aceitos para status

-- 1. Ver constraint exata
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'transactions' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
AND cc.check_clause LIKE '%status%';

-- 2. Ver dados existentes na tabela
SELECT 
    status,
    type,
    count(*) as quantidade
FROM transactions 
GROUP BY status, type;

-- 3. Ver estrutura da coluna status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name = 'status';

-- 4. Tentar descobrir valores válidos testando alguns comuns
-- (não executará se der erro)
SELECT 'Testando valores de status:' as info;

-- Comentar/descomentar conforme necessário:
-- SELECT 'open' as status_test UNION ALL SELECT 'closed' UNION ALL SELECT 'pending' UNION ALL SELECT 'active' UNION ALL SELECT 'executed'; 