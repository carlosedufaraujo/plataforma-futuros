-- ================================
-- VERIFICAÇÃO COMPLETA EM UMA ÚNICA QUERY
-- ================================

WITH verificacoes AS (
    -- 1. TABELAS EXISTENTES
    SELECT 1 as ordem, '=== TABELAS EXISTENTES ===' as categoria, '' as info
    UNION ALL
    SELECT 2, 'Tabela', table_name || ' (' || table_type || ')'
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    
    UNION ALL
    -- 2. VERIFICAR USER_BROKERAGES
    SELECT 10, '=== TABELA USER_BROKERAGES ===', ''
    UNION ALL
    SELECT 11, 'Status', 
        CASE 
            WHEN EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_brokerages'
            ) 
            THEN '✅ EXISTE'
            ELSE '❌ NÃO EXISTE (PRECISA CRIAR)'
        END
    
    UNION ALL
    -- 3. STATUS DO RLS
    SELECT 20, '=== STATUS DO RLS ===', ''
    UNION ALL
    SELECT 21, tablename, 
        'RLS ' || CASE WHEN rowsecurity THEN '✅ HABILITADO' ELSE '❌ DESABILITADO' END
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
    
    UNION ALL
    -- 4. POLÍTICAS RLS
    SELECT 30, '=== POLÍTICAS RLS EXISTENTES ===', ''
    UNION ALL
    SELECT 31, tablename, policyname || ' (' || cmd || ')'
    FROM pg_policies
    WHERE schemaname = 'public'
    
    UNION ALL
    -- 5. TRIGGERS
    SELECT 40, '=== TRIGGERS EXISTENTES ===', ''
    UNION ALL
    SELECT 41, event_object_table, trigger_name
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    
    UNION ALL
    -- 6. ESTRUTURA USERS
    SELECT 50, '=== ESTRUTURA DA TABELA USERS ===', ''
    UNION ALL
    SELECT 51, column_name, 
        data_type || CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
    FROM information_schema.columns
    WHERE table_name = 'users' AND table_schema = 'public'
    
    UNION ALL
    -- 7. CONTAGEM DE REGISTROS
    SELECT 60, '=== CONTAGEM DE REGISTROS ===', ''
    UNION ALL
    SELECT 61, 'users', (SELECT COUNT(*)::text FROM users)
    UNION ALL
    SELECT 62, 'brokerages', (SELECT COUNT(*)::text FROM brokerages)
    UNION ALL
    SELECT 63, 'positions', (SELECT COUNT(*)::text FROM positions)
    UNION ALL
    SELECT 64, 'transactions', (SELECT COUNT(*)::text FROM transactions)
    UNION ALL
    SELECT 65, 'contracts', (SELECT COUNT(*)::text FROM contracts)
    UNION ALL
    SELECT 66, 'auth.users', (SELECT COUNT(*)::text FROM auth.users)
)
SELECT categoria, info
FROM verificacoes
ORDER BY ordem;