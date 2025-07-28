-- ================================
-- VERIFICAÇÃO FINAL - QUERY ÚNICA
-- ================================

WITH resumo AS (
    -- Resumo geral
    SELECT 1 as ordem, '=== RESUMO DO SISTEMA ===' as categoria, '' as detalhe
    UNION ALL
    SELECT 2, 'Usuários cadastrados', COUNT(*)::text FROM users
    UNION ALL
    SELECT 3, 'Corretoras cadastradas', COUNT(*)::text FROM brokerages
    UNION ALL
    SELECT 4, 'Vinculações usuário-corretora', COUNT(*)::text FROM user_brokerages
    UNION ALL
    SELECT 5, 'Usuários com login ativo', COUNT(*)::text FROM auth.users
    
    UNION ALL
    -- Separador
    SELECT 10, '', '---'
    UNION ALL
    SELECT 11, '=== USUÁRIOS E CORRETORAS ===', ''
    
    UNION ALL
    -- Usuários e suas corretoras
    SELECT 
        12 + ROW_NUMBER() OVER (ORDER BY u.nome) as ordem,
        u.nome || ' (' || u.email || ')',
        COALESCE(string_agg(b.nome, ', ' ORDER BY b.nome), 'Sem corretoras')
    FROM users u
    LEFT JOIN user_brokerages ub ON u.id = ub.user_id
    LEFT JOIN brokerages b ON ub.brokerage_id = b.id
    GROUP BY u.id, u.nome, u.email
    
    UNION ALL
    -- Separador
    SELECT 20, '', '---'
    UNION ALL
    SELECT 21, '=== STATUS RLS (SEGURANÇA) ===', ''
    
    UNION ALL
    -- Status do RLS
    SELECT 
        22 + ROW_NUMBER() OVER (ORDER BY tablename) as ordem,
        tablename,
        CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
    
    UNION ALL
    -- Separador
    SELECT 30, '', '---'
    UNION ALL
    SELECT 31, '=== SINCRONIZAÇÃO COM AUTH ===', ''
    
    UNION ALL
    -- Sincronização auth
    SELECT 
        32 + ROW_NUMBER() OVER (ORDER BY u.nome) as ordem,
        u.nome,
        CASE 
            WHEN au.id IS NOT NULL THEN '✅ Login ativo'
            ELSE '❌ Falta criar login'
        END
    FROM users u
    LEFT JOIN auth.users au ON u.id = au.id
    
    UNION ALL
    -- Separador
    SELECT 40, '', '---'
    UNION ALL
    SELECT 41, '=== CREDENCIAIS DE ACESSO ===', ''
    
    UNION ALL
    -- Credenciais
    SELECT 42, 'Carlos Eduardo', 'Email: carloseduardo@acexcapital.com | Senha: Acex@2025'
    UNION ALL
    SELECT 43, 'Ângelo Caiado', 'Email: angelocaiado@rialmaagropecuaria.com.br | Senha: Rialma@2025'
)
SELECT categoria, detalhe
FROM resumo
ORDER BY ordem;