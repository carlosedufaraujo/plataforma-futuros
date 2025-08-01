-- DIAGNOSTICAR ERRO 500 - POLÍTICAS RLS BLOQUEANDO ACESSO
-- Verificar se as políticas estão muito restritivas

-- 1. Verificar se Carlos Eduardo existe no auth e na tabela users
SELECT 
    '1. VERIFICAÇÃO CARLOS EDUARDO' as categoria,
    'Auth: ' || COALESCE(au.email, 'NÃO ENCONTRADO') as auth_status,
    'Users: ' || COALESCE(u.email, 'NÃO ENCONTRADO') as users_status,
    'Role: ' || COALESCE(u.role, 'SEM ROLE') as role_status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'carloseduardo@acexcapital.com' OR u.email = 'carloseduardo@acexcapital.com'

UNION ALL

-- 2. Verificar Ângelo também
SELECT 
    '2. VERIFICAÇÃO ANGELO CAIADO' as categoria,
    'Auth: ' || COALESCE(au.email, 'NÃO ENCONTRADO') as auth_status,
    'Users: ' || COALESCE(u.email, 'NÃO ENCONTRADO') as users_status,
    'Role: ' || COALESCE(u.role, 'SEM ROLE') as role_status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'angelocaiado@rialmaagropecuaria.com.br' OR u.email = 'angelocaiado@rialmaagropecuaria.com.br'

UNION ALL

-- 3. Contar políticas por tabela
SELECT 
    '3. POLÍTICAS USERS' as categoria,
    'Total: ' || count(*)::text as auth_status,
    'Nomes: ' || string_agg(policyname, ', ') as users_status,
    'Pode estar bloqueando SELECT' as role_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'

UNION ALL

SELECT 
    '4. POLÍTICAS BROKERAGES' as categoria,
    'Total: ' || count(*)::text as auth_status,
    'Nomes: ' || string_agg(policyname, ', ') as users_status,
    'Pode estar bloqueando SELECT' as role_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'brokerages'

UNION ALL

-- 4. Ver se RLS está habilitado
SELECT 
    '5. STATUS RLS' as categoria,
    'Users: ' || (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') as auth_status,
    'Brokerages: ' || (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'brokerages' AND schemaname = 'public') as users_status,
    'RLS pode estar bloqueando' as role_status

UNION ALL

-- 5. Verificar IDs que batem
SELECT 
    '6. ID CONSISTENCY' as categoria,
    'Carlos Auth ID: ' || COALESCE(au.id::text, 'NONE') as auth_status,
    'Carlos User ID: ' || COALESCE(u.id::text, 'NONE') as users_status,
    CASE WHEN au.id = u.id THEN 'IDs BATEM ✅' ELSE 'IDs DIFERENTES ❌' END as role_status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'carloseduardo@acexcapital.com' OR u.email = 'carloseduardo@acexcapital.com'

ORDER BY categoria; 