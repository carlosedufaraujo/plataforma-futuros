-- ================================
-- CORREÇÃO FINAL E TESTE COMPLETO V2
-- ================================

-- 1. Primeiro verificar os valores permitidos para role
SELECT DISTINCT role FROM users WHERE role IS NOT NULL;

-- 2. Garantir que os usuários existam em public.users
-- Usando 'usuario' ao invés de 'user' (provavelmente o valor correto)
INSERT INTO public.users (id, email, nome, cpf, role)
VALUES 
    ('59ecd002-468c-41a9-b32f-23555303e5a4', 'carloseduardo@acexcapital.com', 'Carlos Eduardo', '111.111.111-11', 'admin'),
    ('7f2dab2b-6772-46a7-9913-28247d0e6485', 'angelocaiado@rialmaagropecuaria.com.br', 'Angelo Caiado', '222.222.222-22', 'usuario')
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role;

-- 3. Criar corretoras se não existirem
INSERT INTO brokerages (id, name)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'ACEX Capital'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Rialma Agropecuária')
ON CONFLICT (id) DO NOTHING;

-- 4. Associar usuários às corretoras
INSERT INTO user_brokerages (user_id, brokerage_id)
VALUES 
    ('59ecd002-468c-41a9-b32f-23555303e5a4', '550e8400-e29b-41d4-a716-446655440001'),
    ('7f2dab2b-6772-46a7-9913-28247d0e6485', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- 5. Verificar resultado final
SELECT 
    u.email,
    u.nome,
    u.role,
    b.name as corretora
FROM users u
JOIN user_brokerages ub ON u.id = ub.user_id
JOIN brokerages b ON ub.brokerage_id = b.id
ORDER BY u.email;

-- 6. Testar acesso com RLS
-- Teste para Carlos (admin)
SET LOCAL "request.jwt.claims" = '{"sub":"59ecd002-468c-41a9-b32f-23555303e5a4"}';
SELECT 'Carlos - Users:' as teste, count(*) FROM users;
SELECT 'Carlos - Brokerages:' as teste, count(*) FROM brokerages;
RESET ALL;

-- 7. Teste para Angelo (usuario)
SET LOCAL "request.jwt.claims" = '{"sub":"7f2dab2b-6772-46a7-9913-28247d0e6485"}';
SELECT 'Angelo - Users:' as teste, count(*) FROM users;
SELECT 'Angelo - Brokerages:' as teste, count(*) FROM brokerages;
RESET ALL;