-- ================================
-- SETUP COMPLETO - TUDO EM UM ARQUIVO
-- Execute este arquivo completo no Supabase SQL Editor
-- ================================

-- ================================================
-- PARTE 1: CRIAR TABELA USER_BROKERAGES
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
-- PARTE 2: INSERIR CORRETORAS
-- ================================================

-- Nova Futura
INSERT INTO brokerages (
    id, nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'b1111111-1111-1111-1111-111111111111'::uuid,
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
    id, nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'b2222222-2222-2222-2222-222222222222'::uuid,
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
    id, nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'b3333333-3333-3333-3333-333333333333'::uuid,
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
    id, nome, cnpj, endereco, assessor, telefone, email,
    corretagem_milho, corretagem_boi, taxas, impostos, is_active
) VALUES (
    'b4444444-4444-4444-4444-444444444444'::uuid,
    'StoneX',
    '33.333.333/0001-33',
    'Av. das Nações Unidas, 12995 - São Paulo, SP',
    'João Pedro Oliveira',
    '(11) 3508-5000',
    'brasil@stonex.com',
    2.75, 3.25, 0.12, 0.05, true
) ON CONFLICT (cnpj) DO UPDATE SET nome = EXCLUDED.nome;

-- ================================================
-- PARTE 3: INSERIR USUÁRIOS
-- ================================================

-- Carlos Eduardo Araujo
INSERT INTO users (
    id, nome, cpf, email, telefone, endereco, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Carlos Eduardo Araujo',
    '123.456.789-00',
    'carloseduardo@acexcapital.com',
    '(54) 98456-9252',
    'Passo Fundo, RS',
    true
) ON CONFLICT (cpf) DO UPDATE SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone;

-- Ângelo Caiado
INSERT INTO users (
    id, nome, cpf, email, telefone, endereco, is_active
) VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
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
-- PARTE 4: CRIAR VINCULAÇÕES
-- ================================================

-- Carlos Eduardo: Acesso a Nova Futura, XP, BTG e StoneX
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'trader'), -- Nova Futura
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'trader'), -- XP
    ('11111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'trader'), -- BTG
    ('11111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'trader') -- StoneX
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- Ângelo Caiado: Acesso apenas a StoneX
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('22222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 'trader') -- StoneX
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- ================================================
-- PARTE 5: CRIAR USUÁRIOS NO AUTH.USERS
-- ================================================

-- Habilitar extensão para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Carlos Eduardo
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_user_meta_data, created_at, updated_at, aud, role
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'carloseduardo@acexcapital.com',
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', 'Carlos Eduardo Araujo',
        'cpf', '123.456.789-00',
        'telefone', '(54) 98456-9252'
    ),
    now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Ângelo Caiado
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, aud, role
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'angelocaiado@rialmaagropecuaria.com.br',
    crypt('Rialma@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', 'Ângelo Caiado',
        'cpf', '987.654.321-00',
        'telefone', '(61) 98157-1920'
    ),
    now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- PARTE 6: HABILITAR RLS EM TODAS AS TABELAS
-- ================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PARTE 7: CRIAR POLÍTICAS RLS
-- ================================================

-- POLÍTICAS PARA USERS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA BROKERAGES
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

-- POLÍTICAS PARA USER_BROKERAGES
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- POLÍTICAS PARA POSITIONS
DROP POLICY IF EXISTS "Users can view own positions" ON positions;
CREATE POLICY "Users can view own positions" ON positions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own positions" ON positions;
CREATE POLICY "Users can create own positions" ON positions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own positions" ON positions;
CREATE POLICY "Users can update own positions" ON positions
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own positions" ON positions;
CREATE POLICY "Users can delete own positions" ON positions
    FOR DELETE USING (user_id = auth.uid());

-- POLÍTICAS PARA TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (user_id = auth.uid());

-- POLÍTICAS PARA OPTIONS
DROP POLICY IF EXISTS "Users can view own options" ON options;
CREATE POLICY "Users can view own options" ON options
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own options" ON options;
CREATE POLICY "Users can create own options" ON options
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own options" ON options;
CREATE POLICY "Users can update own options" ON options
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own options" ON options;
CREATE POLICY "Users can delete own options" ON options
    FOR DELETE USING (user_id = auth.uid());

-- POLÍTICAS PARA CONTRACTS
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- ================================================
-- PARTE 8: CRIAR FUNÇÕES E TRIGGERS
-- ================================================

-- Função para verificar acesso à corretora
CREATE OR REPLACE FUNCTION user_has_brokerage_access(brokerage_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_brokerages
        WHERE user_brokerages.user_id = auth.uid()
        AND user_brokerages.brokerage_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para associar novo usuário à primeira corretora
CREATE OR REPLACE FUNCTION assign_default_brokerage()
RETURNS TRIGGER AS $$
DECLARE
    default_brokerage_id UUID;
BEGIN
    -- Buscar Nova Futura como corretora padrão
    SELECT id INTO default_brokerage_id
    FROM brokerages
    WHERE nome = 'Nova Futura Investimentos'
    LIMIT 1;
    
    IF default_brokerage_id IS NOT NULL THEN
        INSERT INTO user_brokerages (user_id, brokerage_id, role)
        VALUES (NEW.id, default_brokerage_id, 'trader')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS assign_default_brokerage_trigger ON users;
CREATE TRIGGER assign_default_brokerage_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_brokerage();

-- Grant permissões
GRANT EXECUTE ON FUNCTION user_has_brokerage_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_default_brokerage() TO authenticated;

-- ================================================
-- PARTE 9: VERIFICAÇÃO FINAL
-- ================================================

-- Verificar resultado
SELECT 
    '=== SETUP COMPLETO! ===' as titulo,
    'Usuários: ' || (SELECT COUNT(*) FROM users)::text || 
    ' | Corretoras: ' || (SELECT COUNT(*) FROM brokerages)::text ||
    ' | Vinculações: ' || (SELECT COUNT(*) FROM user_brokerages)::text ||
    ' | Auth Users: ' || (SELECT COUNT(*) FROM auth.users)::text as resumo;

-- Mostrar usuários e suas corretoras
SELECT 
    u.nome as usuario,
    u.email,
    string_agg(b.nome, ', ' ORDER BY b.nome) as corretoras
FROM users u
LEFT JOIN user_brokerages ub ON u.id = ub.user_id
LEFT JOIN brokerages b ON ub.brokerage_id = b.id
GROUP BY u.nome, u.email;

-- Mostrar credenciais
SELECT 
    '=== CREDENCIAIS DE ACESSO ===' as titulo
UNION ALL
SELECT 
    'Carlos Eduardo: carloseduardo@acexcapital.com / Senha: Acex@2025'
UNION ALL
SELECT 
    'Ângelo Caiado: angelocaiado@rialmaagropecuaria.com.br / Senha: Rialma@2025';