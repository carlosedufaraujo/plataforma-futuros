-- ================================
-- SINCRONIZAR USUÁRIOS E TESTAR LOGIN
-- ================================

-- 1. Verificar se os usuários existem em public.users
SELECT 
    'auth.users' as tabela,
    id,
    email
FROM auth.users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br')

UNION ALL

SELECT 
    'public.users' as tabela,
    id,
    email
FROM public.users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');

-- 2. Se não existirem em public.users, inserir
INSERT INTO public.users (id, email, nome, role)
SELECT 
    id,
    email,
    CASE 
        WHEN email = 'carloseduardo@acexcapital.com' THEN 'Carlos Eduardo'
        WHEN email = 'angelocaiado@rialmaagropecuaria.com.br' THEN 'Angelo Caiado'
    END as nome,
    CASE 
        WHEN email = 'carloseduardo@acexcapital.com' THEN 'admin'
        ELSE 'user'
    END as role
FROM auth.users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br')
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    role = EXCLUDED.role;

-- 3. Verificar associações com corretoras
SELECT 
    u.email,
    u.nome,
    u.role,
    b.name as corretora
FROM users u
LEFT JOIN user_brokerages ub ON u.id = ub.user_id
LEFT JOIN brokerages b ON ub.brokerage_id = b.id
WHERE u.email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');

-- 4. Se não houver corretoras, criar associações de exemplo
-- Primeiro, verificar corretoras existentes
SELECT id, name FROM brokerages;

-- 5. Testar políticas RLS para Carlos (admin)
SET LOCAL "request.jwt.claims" = '{"sub":"59ecd002-468c-41a9-b32f-23555303e5a4"}';
SELECT 'Carlos pode ver:' as teste, count(*) as total_users FROM users;
SELECT 'Carlos pode ver:' as teste, count(*) as total_brokerages FROM brokerages;
RESET ALL;

-- 6. Testar políticas RLS para Angelo (user)
SET LOCAL "request.jwt.claims" = '{"sub":"7f2dab2b-6772-46a7-9913-28247d0e6485"}';
SELECT 'Angelo pode ver:' as teste, count(*) as total_users FROM users;
SELECT 'Angelo pode ver:' as teste, count(*) as total_brokerages FROM brokerages;
RESET ALL;