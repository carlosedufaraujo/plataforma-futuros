-- VERIFICAR SISTEMA DE ADMIN IMPLEMENTADO
-- Mostra as permissões completas do sistema

SELECT '1. ADMIN USER' as ordem, '👑 ADMIN DEFINIDO' as info, 
       'Carlos Eduardo: ' || email as detalhe, 'Role: ' || role as extra
FROM users WHERE role = 'admin'

UNION ALL

SELECT '2. POLÍTICAS USERS' as ordem, '👤 ' || policyname as info, 
       'Operação: ' || cmd as detalhe, 'Tabela: users' as extra
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'

UNION ALL

SELECT '3. POLÍTICAS BROKERAGES' as ordem, '🏢 ' || policyname as info, 
       'Operação: ' || cmd as detalhe, 'Tabela: brokerages' as extra
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'brokerages'

UNION ALL

SELECT '4. POLÍTICAS POSITIONS' as ordem, '📊 ' || policyname as info, 
       'Operação: ' || cmd as detalhe, 'Tabela: positions' as extra
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'positions'

UNION ALL

SELECT '5. POLÍTICAS TRANSACTIONS' as ordem, '💰 ' || policyname as info, 
       'Operação: ' || cmd as detalhe, 'Tabela: transactions' as extra
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'transactions'

UNION ALL

SELECT '6. POLÍTICAS OPTIONS' as ordem, '📋 ' || policyname as info, 
       'Operação: ' || cmd as detalhe, 'Tabela: options' as extra
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'options'

UNION ALL

SELECT '7. TOTAL POLÍTICAS' as ordem, '📊 RESUMO COMPLETO' as info, 
       'Total de políticas: ' || count(*)::text as detalhe, 'Sistema: RLS Ativo' as extra
FROM pg_policies WHERE schemaname = 'public'

UNION ALL

SELECT '8. PERMISSÕES ADMIN' as ordem, '🔒 CARLOS EDUARDO PODE:' as info, 
       'Ver/Editar TODOS os dados' as detalhe, 'Controle Total!' as extra

UNION ALL

SELECT '9. PERMISSÕES USER' as ordem, '🔒 ANGELO CAIADO PODE:' as info, 
       'Ver/Editar apenas seus dados' as detalhe, 'Acesso Limitado' as extra

ORDER BY ordem; 