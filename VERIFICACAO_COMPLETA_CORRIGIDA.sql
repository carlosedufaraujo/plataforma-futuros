-- ================================
-- VERIFICAÇÃO COMPLETA DA ESTRUTURA
-- Execute tudo de uma vez
-- ================================

-- 1. TABELAS EXISTENTES
SELECT 
    '=== TABELAS EXISTENTES ===' as info
UNION ALL
SELECT 
    table_name || ' (' || table_type || ')' as info
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY 1;

-- 2. VERIFICAR SE USER_BROKERAGES EXISTE
SELECT 
    '=== TABELA USER_BROKERAGES ===' as info
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_brokerages'
        ) 
        THEN 'EXISTE: user_brokerages'
        ELSE 'NÃO EXISTE: user_brokerages (PRECISA CRIAR)'
    END as info;

-- 3. STATUS DO RLS
SELECT 
    '=== STATUS DO RLS ===' as info
UNION ALL
SELECT 
    tablename || ': RLS ' || 
    CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESABILITADO' END as info
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY 1;

-- 4. POLÍTICAS RLS EXISTENTES
SELECT 
    '=== POLÍTICAS RLS EXISTENTES ===' as info
UNION ALL
SELECT 
    tablename || ' - ' || policyname || ' (' || cmd || ')' as info
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY 1;

-- 5. TRIGGERS EXISTENTES
SELECT 
    '=== TRIGGERS EXISTENTES ===' as info
UNION ALL
SELECT 
    event_object_table || ' - ' || trigger_name as info
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY 1;

-- 6. COLUNAS DA TABELA USERS
SELECT 
    '=== ESTRUTURA: USERS ===' as info
UNION ALL
SELECT 
    column_name || ' (' || data_type || ')' || 
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END as info
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY 1;

-- 7. VERIFICAR AUTH.USERS
SELECT 
    '=== USUÁRIOS NO AUTH.USERS ===' as info
UNION ALL
SELECT 
    'Total de usuários no auth: ' || COUNT(*)::text as info
FROM auth.users;

-- 8. RESUMO FINAL
SELECT 
    '=== RESUMO ===' as info
UNION ALL
SELECT 'Tabelas: ' || COUNT(*)::text as info
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 'Registros em users: ' || COUNT(*)::text as info FROM users
UNION ALL
SELECT 'Registros em brokerages: ' || COUNT(*)::text as info FROM brokerages
UNION ALL
SELECT 'Registros em positions: ' || COUNT(*)::text as info FROM positions
UNION ALL
SELECT 'Registros em transactions: ' || COUNT(*)::text as info FROM transactions;