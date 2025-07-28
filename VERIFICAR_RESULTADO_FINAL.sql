-- ================================
-- VERIFICAR RESULTADO FINAL
-- ================================

-- 1. Resumo Geral
SELECT 
    '=== RESUMO DO SISTEMA ===' as categoria,
    '' as info
UNION ALL
SELECT 
    'Total de Usuários',
    COUNT(*)::text || ' usuários cadastrados'
FROM users
UNION ALL
SELECT 
    'Total de Corretoras',
    COUNT(*)::text || ' corretoras cadastradas'
FROM brokerages
UNION ALL
SELECT 
    'Total de Vinculações',
    COUNT(*)::text || ' vinculações usuário-corretora'
FROM user_brokerages
UNION ALL
SELECT 
    'Usuários no Auth',
    COUNT(*)::text || ' usuários com login ativo'
FROM auth.users;

-- 2. Detalhes dos Usuários e Corretoras
SELECT '---' as divisor;
SELECT 
    '=== USUÁRIOS E SUAS CORRETORAS ===' as titulo;

SELECT 
    u.nome as "Usuário",
    u.email as "Email",
    u.telefone as "Telefone",
    COUNT(ub.id) as "Qtd Corretoras",
    string_agg(b.nome, ', ' ORDER BY b.nome) as "Corretoras com Acesso"
FROM users u
LEFT JOIN user_brokerages ub ON u.id = ub.user_id
LEFT JOIN brokerages b ON ub.brokerage_id = b.id
GROUP BY u.id, u.nome, u.email, u.telefone
ORDER BY u.nome;

-- 3. Status do RLS
SELECT '---' as divisor;
SELECT 
    '=== STATUS DO RLS ===' as titulo;

SELECT 
    tablename as "Tabela",
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado' 
        ELSE '❌ RLS Desabilitado' 
    END as "Status RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY tablename;

-- 4. Verificar se auth.users está sincronizado
SELECT '---' as divisor;
SELECT 
    '=== SINCRONIZAÇÃO AUTH ===' as titulo;

SELECT 
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Sincronizado'
        ELSE '❌ Falta criar no auth'
    END as "Status Auth",
    u.nome as "Usuário",
    u.email as "Email"
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.nome;

-- 5. Credenciais de Acesso
SELECT '---' as divisor;
SELECT 
    '=== CREDENCIAIS DE ACESSO ===' as titulo;

SELECT 
    '👤 ' || nome as "Usuário",
    '📧 ' || email as "Email",
    '🔑 ' || CASE 
        WHEN email = 'carloseduardo@acexcapital.com' THEN 'Acex@2025'
        WHEN email = 'angelocaiado@rialmaagropecuaria.com.br' THEN 'Rialma@2025'
        ELSE 'Senha não definida'
    END as "Senha"
FROM users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');