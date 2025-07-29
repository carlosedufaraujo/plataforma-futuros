-- VERIFICAR CONSTRAINTS TRANSACTIONS
-- Descobrir valores permitidos para status e outras constraints

-- 1. Verificar todas as constraints da tabela transactions
SELECT 'CONSTRAINTS TRANSACTIONS' as info,
       constraint_name,
       constraint_type,
       check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'transactions' AND tc.table_schema = 'public'

UNION ALL

-- 2. Verificar definição da tabela
SELECT 'COLUNAS COM CONSTRAINTS' as info,
       column_name,
       data_type,
       column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver dados existentes para entender padrão
SELECT 'DADOS EXISTENTES' as info,
       status as constraint_name,
       type as constraint_type,
       'Valores em uso' as check_clause
FROM transactions 
LIMIT 5; 