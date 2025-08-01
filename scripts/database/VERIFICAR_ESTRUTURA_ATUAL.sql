-- ================================
-- VERIFICAR ESTRUTURA ATUAL DO BANCO
-- ================================

-- 1. Listar todas as tabelas existentes
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela brokerages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'brokerages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se existe tabela user_brokerages
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_brokerages'
) as user_brokerages_exists;

-- 5. Verificar estrutura da tabela positions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'positions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar estrutura da tabela transactions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar quais tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY tablename;

-- 8. Listar todas as políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. Verificar funções customizadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 11. Verificar constraints e foreign keys
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;

-- 12. Contar registros nas tabelas principais
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'brokerages', COUNT(*) FROM brokerages
UNION ALL
SELECT 'positions', COUNT(*) FROM positions
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts;