-- =====================================================
-- VERIFICAR TODAS AS TABELAS DO SISTEMA
-- =====================================================

-- 1. Verificar tabela users
SELECT 
    '=== TABELA USERS ===' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN is_active = true THEN 1 END) as registros_ativos
FROM users;

SELECT * FROM users LIMIT 5;

-- 2. Verificar tabela brokerages
SELECT 
    '=== TABELA BROKERAGES ===' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN is_active = true THEN 1 END) as registros_ativos
FROM brokerages;

SELECT * FROM brokerages LIMIT 5;

-- 3. Verificar tabela contracts
SELECT 
    '=== TABELA CONTRACTS ===' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN is_active = true THEN 1 END) as registros_ativos
FROM contracts;

SELECT * FROM contracts LIMIT 5;

-- 4. Verificar tabela positions
SELECT 
    '=== TABELA POSITIONS ===' as info,
    COUNT(*) as total_registros
FROM positions;

SELECT * FROM positions LIMIT 5;

-- 5. Verificar tabela transactions
SELECT 
    '=== TABELA TRANSACTIONS ===' as info,
    COUNT(*) as total_registros
FROM transactions;

-- 6. Verificar estrutura da tabela users (auth)
SELECT 
    '=== USUÁRIOS DO SUPABASE AUTH ===' as info;
    
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data->>'nome' as nome
FROM auth.users
LIMIT 10;

-- 7. Verificar se precisamos popular as tabelas
SELECT 
    '=== RESUMO DO BANCO ===' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM users) = 0 THEN '❌ Tabela users está vazia'
        ELSE '✅ Tabela users tem dados'
    END as users_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM brokerages) = 0 THEN '❌ Tabela brokerages está vazia'
        ELSE '✅ Tabela brokerages tem dados'
    END as brokerages_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM contracts) = 0 THEN '❌ Tabela contracts está vazia'
        ELSE '✅ Tabela contracts tem dados'
    END as contracts_status;