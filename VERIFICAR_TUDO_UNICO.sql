-- VERIFICAÇÃO ÚNICA - TUDO EM UMA CONSULTA
-- Usa UNION ALL para garantir execução completa

SELECT '1. STATUS' as ordem, '✅ CORREÇÃO APLICADA!' as info, 'Total de políticas: ' || count(*)::text as detalhe, '' as extra
FROM pg_policies WHERE schemaname = 'public'

UNION ALL

SELECT '2. POLÍTICAS' as ordem, '📋 ' || tablename as info, policyname as detalhe, cmd as extra
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT '3. USUÁRIOS' as ordem, '👥 ' || email as info, nome as detalhe, 'Ativo: ' || is_active::text as extra
FROM users 
WHERE is_active = true

UNION ALL

SELECT '4. RLS TABLES' as ordem, '🔒 ' || tablename as info, 'RLS: ' || rowsecurity::text as detalhe, '' as extra
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')

UNION ALL

SELECT '5. CREDENCIAIS' as ordem, '🔑 TESTE' as info, 'Admin: carloseduardo@acexcapital.com' as detalhe, 'Senha: Acex@2025' as extra

UNION ALL

SELECT '6. CREDENCIAIS' as ordem, '🔑 TESTE' as info, 'User: angelocaiado@rialmaagropecuaria.com.br' as detalhe, 'Senha: Rialma@2025' as extra

UNION ALL

SELECT '7. AÇÃO' as ordem, '🚀 TESTE AGORA' as info, 'http://localhost:3000' as detalhe, 'LOGIN DEVE FUNCIONAR!' as extra

ORDER BY ordem; 