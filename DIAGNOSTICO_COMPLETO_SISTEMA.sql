-- ================================================================
-- DIAGNÓSTICO COMPLETO DO SISTEMA - PLATAFORMA FUTUROS
-- ================================================================
-- Execute este script no Supabase SQL Editor para análise completa

-- ================================
-- 1. ESTRUTURA DAS TABELAS
-- ================================
SELECT '=== 1. ESTRUTURA DAS TABELAS ===' as section;

-- Listar todas as tabelas do sistema
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ================================
-- 2. COLUNAS E TIPOS DE DADOS
-- ================================
SELECT '=== 2. COLUNAS POR TABELA ===' as section;

-- Estrutura detalhada de cada tabela
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ================================
-- 3. CONSTRAINTS E VALIDAÇÕES
-- ================================
SELECT '=== 3. TODAS AS CONSTRAINTS ===' as section;

-- Todas as constraints do sistema
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- ================================
-- 4. CHAVES ESTRANGEIRAS
-- ================================
SELECT '=== 4. RELACIONAMENTOS (FKs) ===' as section;

-- Mapeamento de relacionamentos
SELECT
    tc.table_name as tabela_origem,
    kcu.column_name as coluna_origem,
    ccu.table_name AS tabela_destino,
    ccu.column_name AS coluna_destino,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ================================
-- 5. POLÍTICAS RLS ATUAIS
-- ================================
SELECT '=== 5. POLÍTICAS RLS ===' as section;

-- Todas as políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================
-- 6. STATUS DO RLS POR TABELA
-- ================================
SELECT '=== 6. RLS HABILITADO? ===' as section;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerowsecurity as force_rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================
-- 7. DADOS EXISTENTES
-- ================================
SELECT '=== 7. CONTAGEM DE DADOS ===' as section;

-- Contagem de registros por tabela
SELECT 'users' as tabela, count(*) as total FROM users
UNION ALL
SELECT 'brokerages', count(*) FROM brokerages
UNION ALL
SELECT 'user_brokerages', count(*) FROM user_brokerages
UNION ALL
SELECT 'contracts', count(*) FROM contracts
UNION ALL
SELECT 'positions', count(*) FROM positions
UNION ALL
SELECT 'transactions', count(*) FROM transactions
UNION ALL
SELECT 'options', count(*) FROM options
UNION ALL
SELECT 'expirations', count(*) FROM expirations;

-- ================================
-- 8. USUÁRIOS NO AUTH
-- ================================
SELECT '=== 8. USUÁRIOS AUTH.USERS ===' as section;

-- Usuários no sistema de autenticação
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ================================
-- 9. VALORES ÚNICOS EM CAMPOS ENUM
-- ================================
SELECT '=== 9. VALORES ENUM/CHECK ===' as section;

-- Valores distintos em campos com constraints
SELECT 'users.role' as campo, array_agg(DISTINCT role) as valores FROM users WHERE role IS NOT NULL
UNION ALL
SELECT 'positions.status', array_agg(DISTINCT status) FROM positions WHERE status IS NOT NULL
UNION ALL
SELECT 'transactions.status', array_agg(DISTINCT status) FROM transactions WHERE status IS NOT NULL
UNION ALL
SELECT 'transactions.type', array_agg(DISTINCT type) FROM transactions WHERE type IS NOT NULL;

-- ================================
-- 10. PROBLEMAS IDENTIFICADOS
-- ================================
SELECT '=== 10. ANÁLISE DE PROBLEMAS ===' as section;

-- Verificar usuários órfãos
SELECT 
    'Usuários em auth sem perfil' as problema,
    count(*) as quantidade
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL

UNION ALL

-- Verificar associações órfãs
SELECT 
    'Associações user_brokerages órfãs',
    count(*)
FROM user_brokerages ub
LEFT JOIN users u ON ub.user_id = u.id
LEFT JOIN brokerages b ON ub.brokerage_id = b.id
WHERE u.id IS NULL OR b.id IS NULL;

-- ================================
-- FIM DO DIAGNÓSTICO
-- ================================
SELECT '=== FIM DO DIAGNÓSTICO ===' as section;