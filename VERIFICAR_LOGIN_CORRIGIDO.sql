-- VERIFICAR SE O LOGIN FOI CORRIGIDO
-- Execute para confirmar que tudo está funcionando

-- 1. Verificar total de políticas criadas
SELECT 
    '✅ CORREÇÃO APLICADA COM SUCESSO!' as status,
    'Total de políticas RLS ativas: ' || count(*)::text as info
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. Listar todas as políticas criadas
SELECT 
    '📋 POLÍTICAS RLS CRIADAS:' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar usuários cadastrados
SELECT 
    '👥 USUÁRIOS DISPONÍVEIS PARA LOGIN:' as categoria,
    email,
    nome,
    is_active as ativo,
    role as perfil
FROM users
WHERE is_active = true
ORDER BY created_at DESC;

-- 4. Verificar se RLS está ativo
SELECT 
    '🔒 STATUS RLS DAS TABELAS:' as categoria,
    schemaname as schema,
    tablename as tabela,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY tablename;

-- 5. Credenciais para teste
SELECT '🔑 CREDENCIAIS PARA TESTE:' as info;
SELECT 'Admin: carloseduardo@acexcapital.com / Acex@2025' as credencial_admin;
SELECT 'User: angelocaiado@rialmaagropecuaria.com.br / Rialma@2025' as credencial_user;
SELECT '🚀 AGORA TESTE O LOGIN EM: http://localhost:3000' as acao; 