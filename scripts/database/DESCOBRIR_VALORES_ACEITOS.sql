-- DESCOBRIR VALORES ACEITOS - TYPE E STATUS
-- Ver constraints exatas e dados existentes

-- 1. Ver todas as check constraints da tabela transactions
SELECT 
    'CONSTRAINT: ' || constraint_name as info,
    check_clause as detalhe
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'transactions' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'

UNION ALL

-- 2. Ver dados reais já existentes na tabela (values em uso)
SELECT 
    'DADOS REAIS - Type: ' || COALESCE(type, 'NULL') as info,
    'Status: ' || COALESCE(status, 'NULL') as detalhe
FROM transactions

UNION ALL

-- 3. Ver estrutura das colunas problemáticas
SELECT 
    'COLUNA: ' || column_name as info,
    'Tipo: ' || data_type || ', Default: ' || COALESCE(column_default, 'NULL') as detalhe
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('type', 'status')

ORDER BY info; 