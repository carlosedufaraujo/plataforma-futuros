-- VERIFICAR SE CORREÇÃO DO ERRO 500 FOI APLICADA
-- Confirmar que as políticas permissivas estão funcionando

SELECT '1. POLÍTICAS ATIVAS' as ordem, 
       'Total: ' || count(*)::text as info,
       'Devem ser 7 políticas temporárias' as detalhe,
       'Todas com acesso total' as extra
FROM pg_policies WHERE schemaname = 'public'

UNION ALL

SELECT '2. POLÍTICAS POR TABELA' as ordem,
       '📋 ' || tablename as info,
       policyname as detalhe,
       'Operação: ' || cmd as extra
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT '3. STATUS RLS' as ordem,
       '🔒 ' || tablename as info,
       'RLS: ' || rowsecurity::text as detalhe,
       'Deve estar TRUE' as extra
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')

UNION ALL

SELECT '4. USUÁRIOS CADASTRADOS' as ordem,
       '👤 ' || email as info,
       nome as detalhe,
       'Role: ' || role as extra
FROM users
WHERE is_active = true

UNION ALL

SELECT '5. AUTH x USERS SYNC' as ordem,
       '🔄 SINCRONIZAÇÃO' as info,
       'Carlos: ' || CASE WHEN EXISTS(
           SELECT 1 FROM auth.users au 
           JOIN users u ON au.id = u.id 
           WHERE au.email = 'carloseduardo@acexcapital.com'
       ) THEN '✅ OK' ELSE '❌ ERRO' END as detalhe,
       'Angelo: ' || CASE WHEN EXISTS(
           SELECT 1 FROM auth.users au 
           JOIN users u ON au.id = u.id 
           WHERE au.email = 'angelocaiado@rialmaagropecuaria.com.br'
       ) THEN '✅ OK' ELSE '❌ ERRO' END as extra

UNION ALL

SELECT '6. TESTE DE ACESSO' as ordem,
       '🚀 PRÓXIMO PASSO' as info,
       'Teste login na aplicação' as detalhe,
       'Erro 500 deve estar resolvido' as extra

ORDER BY ordem; 