-- ================================
-- SETUP DE USUÁRIOS E CORRETORAS PRÉ-DEFINIDOS
-- ================================

-- PASSO 1: Limpar dados existentes (opcional - comente se quiser manter)
-- DELETE FROM user_brokerages;
-- DELETE FROM transactions;
-- DELETE FROM positions;
-- DELETE FROM options;
-- DELETE FROM users;
-- DELETE FROM brokerages;

-- PASSO 2: Criar/Atualizar Corretoras
-- Corretora 1: ACEX Capital Markets (pode já existir)
INSERT INTO brokerages (
    id,
    nome,
    cnpj,
    endereco,
    assessor,
    telefone,
    email,
    corretagem_milho,
    corretagem_boi,
    taxas,
    impostos,
    is_active
) VALUES (
    'b1111111-1111-1111-1111-111111111111'::uuid,
    'ACEX Capital Markets',
    '12.345.678/0001-90',
    'Av. Faria Lima, 3477 - São Paulo, SP',
    'João Silva',
    '(11) 3333-4444',
    'contato@acex.com',
    2.50,
    3.00,
    0.10,
    0.05,
    true
) ON CONFLICT (cnpj) DO UPDATE SET
    nome = EXCLUDED.nome,
    assessor = EXCLUDED.assessor,
    telefone = EXCLUDED.telefone;

-- Corretora 2: Prime Investimentos
INSERT INTO brokerages (
    id,
    nome,
    cnpj,
    endereco,
    assessor,
    telefone,
    email,
    corretagem_milho,
    corretagem_boi,
    taxas,
    impostos,
    is_active
) VALUES (
    'b2222222-2222-2222-2222-222222222222'::uuid,
    'Prime Investimentos',
    '98.765.432/0001-10',
    'Av. Brigadeiro Faria Lima, 2391 - São Paulo, SP',
    'Maria Santos',
    '(11) 5555-6666',
    'contato@primeinvest.com.br',
    2.25,
    2.75,
    0.08,
    0.05,
    true
) ON CONFLICT (cnpj) DO NOTHING;

-- PASSO 3: Criar Usuários no Supabase Auth
-- IMPORTANTE: Execute este bloco no Supabase Dashboard > Authentication > Users
-- Ou use a API do Supabase para criar os usuários

-- Usuario 1: Carlos Eduardo (Admin ACEX)
-- Email: carlos@acex.com
-- Senha: Acex@2025
-- ID: 11111111-1111-1111-1111-111111111111

-- Usuario 2: Ana Paula (Trader Prime)
-- Email: ana@primeinvest.com
-- Senha: Prime@2025
-- ID: 22222222-2222-2222-2222-222222222222

-- PASSO 4: Criar/Atualizar Usuários na tabela users
-- Usuario 1: Carlos Eduardo
INSERT INTO users (
    id,
    nome,
    cpf,
    email,
    telefone,
    endereco,
    is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Carlos Eduardo',
    '123.456.789-00',
    'carlos@acex.com',
    '(11) 99999-9999',
    'São Paulo, SP',
    true
) ON CONFLICT (cpf) DO UPDATE SET
    email = EXCLUDED.email,
    nome = EXCLUDED.nome;

-- Usuario 2: Ana Paula
INSERT INTO users (
    id,
    nome,
    cpf,
    email,
    telefone,
    endereco,
    is_active
) VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Ana Paula Silva',
    '987.654.321-00',
    'ana@primeinvest.com',
    '(11) 88888-7777',
    'São Paulo, SP',
    true
) ON CONFLICT (cpf) DO NOTHING;

-- PASSO 5: Criar tabela user_brokerages se não existir
CREATE TABLE IF NOT EXISTS user_brokerages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- PASSO 6: Criar vinculações
-- Carlos tem acesso às duas corretoras (admin na ACEX, trader na Prime)
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'admin'),
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'trader')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- Ana tem acesso apenas à Prime (trader)
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'trader')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- PASSO 7: Aplicar todas as configurações de RLS do script anterior
-- (Cole aqui o conteúdo do SETUP_AUTENTICACAO_COMPLETO.sql a partir do PASSO 3)

-- PASSO 8: Verificar resultado
SELECT 
    '=== USUÁRIOS CRIADOS ===' as info
UNION ALL
SELECT 
    u.nome || ' (' || u.email || ')' as info
FROM users u
ORDER BY 1;

SELECT 
    '=== CORRETORAS CRIADAS ===' as info
UNION ALL
SELECT 
    b.nome || ' - ' || b.assessor as info
FROM brokerages b
ORDER BY 1;

SELECT 
    '=== VINCULAÇÕES ===' as info
UNION ALL
SELECT 
    u.nome || ' -> ' || b.nome || ' (' || ub.role || ')' as info
FROM user_brokerages ub
JOIN users u ON u.id = ub.user_id
JOIN brokerages b ON b.id = ub.brokerage_id
ORDER BY 1;

-- PASSO 9: Instruções para criar usuários no Supabase Auth
SELECT 
    '=== PRÓXIMO PASSO ===' as titulo,
    'Execute os comandos SQL abaixo no Supabase para criar os usuários no Auth' as instrucao;

-- Comando para criar usuários via SQL (execute no Supabase)
/*
-- Usuario 1: Carlos Eduardo
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    instance_id,
    aud,
    role
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'carlos@acex.com',
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    '{"nome": "Carlos Eduardo", "cpf": "123.456.789-00"}'::jsonb,
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
);

-- Usuario 2: Ana Paula
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    instance_id,
    aud,
    role
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'ana@primeinvest.com',
    crypt('Prime@2025', gen_salt('bf')),
    now(),
    '{"nome": "Ana Paula Silva", "cpf": "987.654.321-00"}'::jsonb,
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
);
*/