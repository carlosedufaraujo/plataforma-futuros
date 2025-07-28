-- ================================
-- VERIFICAR E SETUP COMPLETO
-- Execute este arquivo completo no Supabase SQL Editor
-- ================================

-- ================================================
-- PARTE 1: VERIFICAR O QUE JÁ EXISTE
-- ================================================

-- Verificar usuários existentes
SELECT 'USUÁRIOS EXISTENTES:' as info;
SELECT id, nome, email FROM users;

-- Verificar corretoras existentes
SELECT '---' as divisor;
SELECT 'CORRETORAS EXISTENTES:' as info;
SELECT id, nome, cnpj FROM brokerages;

-- Verificar se user_brokerages existe
SELECT '---' as divisor;
SELECT 'TABELA USER_BROKERAGES:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_brokerages'
) as existe;

-- ================================================
-- PARTE 2: CRIAR TABELA USER_BROKERAGES (SE NÃO EXISTIR)
-- ================================================

CREATE TABLE IF NOT EXISTS user_brokerages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_brokerages_user_id ON user_brokerages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brokerages_brokerage_id ON user_brokerages(brokerage_id);

-- ================================================
-- PARTE 3: ATUALIZAR/CRIAR USUÁRIOS
-- ================================================

-- Se já existe um usuário com email carlos@acex.com, vamos atualizá-lo
UPDATE users SET 
    nome = 'Carlos Eduardo Araujo',
    email = 'carloseduardo@acexcapital.com',
    telefone = '(54) 98456-9252',
    endereco = 'Passo Fundo, RS'
WHERE email = 'carlos@acex.com';

-- Se não atualizou nenhum registro, criar novo
INSERT INTO users (
    nome, cpf, email, telefone, endereco, is_active
) 
SELECT 
    'Carlos Eduardo Araujo',
    '123.456.789-00',
    'carloseduardo@acexcapital.com',
    '(54) 98456-9252',
    'Passo Fundo, RS',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email IN ('carlos@acex.com', 'carloseduardo@acexcapital.com')
);

-- Criar Ângelo Caiado
INSERT INTO users (
    nome, cpf, email, telefone, endereco, is_active
) VALUES (
    'Ângelo Caiado',
    '987.654.321-00',
    'angelocaiado@rialmaagropecuaria.com.br',
    '(61) 98157-1920',
    'Brasília, DF',
    true
) ON CONFLICT (cpf) DO UPDATE SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone;

-- ================================================
-- PARTE 4: ATUALIZAR/CRIAR CORRETORAS
-- ================================================

-- Se já existe ACEX, vamos removê-la para adicionar as corretas
DELETE FROM brokerages WHERE nome = 'ACEX Capital Markets';

-- Nova Futura
INSERT INTO brokerages (
    nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'Nova Futura Investimentos',
    '11.111.111/0001-11',
    'Av. Paulista, 1842 - São Paulo, SP',
    'Ricardo Santos',
    '(11) 3333-1111',
    'contato@novafutura.com.br',
    2.50, 3.00, 0.10, 0.05, true
) ON CONFLICT (cnpj) DO UPDATE SET nome = EXCLUDED.nome;

-- XP Investimentos
INSERT INTO brokerages (
    nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'XP Investimentos',
    '02.332.886/0001-04',
    'Av. Chedid Jafet, 75 - São Paulo, SP',
    'Marcos Silva',
    '(11) 4004-3710',
    'atendimento@xpi.com.br',
    2.25, 2.75, 0.08, 0.05, true
) ON CONFLICT (cnpj) DO UPDATE SET nome = EXCLUDED.nome;

-- BTG Pactual
INSERT INTO brokerages (
    nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'BTG Pactual',
    '30.306.294/0001-45',
    'Av. Brigadeiro Faria Lima, 3477 - São Paulo, SP',
    'Ana Paula Costa',
    '(11) 3383-2000',
    'atendimento@btgpactual.com',
    2.00, 2.50, 0.07, 0.05, true
) ON CONFLICT (cnpj) DO UPDATE SET nome = EXCLUDED.nome;

-- StoneX
INSERT INTO brokerages (
    nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'StoneX',
    '33.333.333/0001-33',
    'Av. das Nações Unidas, 12995 - São Paulo, SP',
    'João Pedro Oliveira',
    '(11) 3508-5000',
    'brasil@stonex.com',
    2.75, 3.25, 0.12, 0.05, true
) ON CONFLICT (cnpj) DO UPDATE SET nome = EXCLUDED.nome;

-- ================================================
-- PARTE 5: CRIAR VINCULAÇÕES (USANDO IDs REAIS)
-- ================================================

-- Limpar vinculações antigas
DELETE FROM user_brokerages;

-- Vincular Carlos Eduardo com todas as corretoras
INSERT INTO user_brokerages (user_id, brokerage_id, role)
SELECT 
    u.id,
    b.id,
    'trader'
FROM users u
CROSS JOIN brokerages b
WHERE u.email = 'carloseduardo@acexcapital.com'
AND b.nome IN ('Nova Futura Investimentos', 'XP Investimentos', 'BTG Pactual', 'StoneX');

-- Vincular Ângelo apenas com StoneX
INSERT INTO user_brokerages (user_id, brokerage_id, role)
SELECT 
    u.id,
    b.id,
    'trader'
FROM users u
CROSS JOIN brokerages b
WHERE u.email = 'angelocaiado@rialmaagropecuaria.com.br'
AND b.nome = 'StoneX';

-- ================================================
-- PARTE 6: CRIAR USUÁRIOS NO AUTH.USERS
-- ================================================

-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar Carlos Eduardo no auth
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, aud, role
)
SELECT 
    u.id,
    u.email,
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    jsonb_build_object('nome', u.nome, 'cpf', u.cpf, 'telefone', u.telefone),
    now(), now(), 'authenticated', 'authenticated'
FROM users u
WHERE u.email = 'carloseduardo@acexcapital.com'
ON CONFLICT (id) DO NOTHING;

-- Criar Ângelo no auth
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, aud, role
)
SELECT 
    u.id,
    u.email,
    crypt('Rialma@2025', gen_salt('bf')),
    now(),
    jsonb_build_object('nome', u.nome, 'cpf', u.cpf, 'telefone', u.telefone),
    now(), now(), 'authenticated', 'authenticated'
FROM users u
WHERE u.email = 'angelocaiado@rialmaagropecuaria.com.br'
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- PARTE 7: HABILITAR RLS
-- ================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PARTE 8: CRIAR POLÍTICAS RLS (SIMPLIFICADAS)
-- ================================================

-- Políticas para USERS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para BROKERAGES
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

-- Políticas para USER_BROKERAGES
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- Políticas para POSITIONS
DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
CREATE POLICY "Users can manage own positions" ON positions
    FOR ALL USING (user_id = auth.uid());

-- Políticas para TRANSACTIONS
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- Políticas para OPTIONS
DROP POLICY IF EXISTS "Users can manage own options" ON options;
CREATE POLICY "Users can manage own options" ON options
    FOR ALL USING (user_id = auth.uid());

-- Políticas para CONTRACTS
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- ================================================
-- PARTE 9: VERIFICAÇÃO FINAL
-- ================================================

SELECT '=== SETUP COMPLETO! ===' as titulo;

-- Mostrar usuários e suas corretoras
SELECT 
    u.nome as usuario,
    u.email,
    string_agg(b.nome, ', ' ORDER BY b.nome) as corretoras
FROM users u
LEFT JOIN user_brokerages ub ON u.id = ub.user_id
LEFT JOIN brokerages b ON ub.brokerage_id = b.id
GROUP BY u.nome, u.email;

-- Mostrar resumo
SELECT 
    'Usuários: ' || (SELECT COUNT(*) FROM users)::text as usuarios,
    'Corretoras: ' || (SELECT COUNT(*) FROM brokerages)::text as corretoras,
    'Vinculações: ' || (SELECT COUNT(*) FROM user_brokerages)::text as vinculacoes,
    'Auth Users: ' || (SELECT COUNT(*) FROM auth.users)::text as auth_users;

-- Credenciais
SELECT '---' as divisor;
SELECT 'CREDENCIAIS:' as info;
SELECT 'Carlos Eduardo: carloseduardo@acexcapital.com / Senha: Acex@2025' as credencial_1;
SELECT 'Ângelo Caiado: angelocaiado@rialmaagropecuaria.com.br / Senha: Rialma@2025' as credencial_2;