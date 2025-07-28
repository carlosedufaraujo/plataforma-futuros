-- ================================
-- SETUP DE USUÁRIOS E CORRETORAS - VERSÃO FINAL
-- ================================

-- PASSO 1: Limpar dados existentes (opcional - comente se quiser manter)
-- DELETE FROM user_brokerages;
-- DELETE FROM transactions;
-- DELETE FROM positions;
-- DELETE FROM options;
-- DELETE FROM users;
-- DELETE FROM brokerages;

-- PASSO 2: Criar/Atualizar Corretoras
-- Corretora 1: ACEX Capital Markets
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
    'contato@acexcapital.com',
    2.50,
    3.00,
    0.10,
    0.05,
    true
) ON CONFLICT (cnpj) DO UPDATE SET
    nome = EXCLUDED.nome,
    assessor = EXCLUDED.assessor,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email;

-- Corretora 2: Rialma Agropecuária
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
    'Rialma Agropecuária',
    '98.765.432/0001-10',
    'SEPS 705/905 - Brasília, DF',
    'Maria Oliveira',
    '(61) 3333-5555',
    'contato@rialmaagropecuaria.com.br',
    2.75,
    3.25,
    0.12,
    0.05,
    true
) ON CONFLICT (cnpj) DO NOTHING;

-- PASSO 3: Criar tabela user_brokerages se não existir
CREATE TABLE IF NOT EXISTS user_brokerages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- PASSO 4: Criar/Atualizar Usuários na tabela users
-- Usuario 1: Carlos Eduardo Araujo
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

-- Usuario 2: Ângelo Caiado
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
    'Ângelo Caiado',
    '987.654.321-00',
    'angelocaiado@rialmaagropecuaria.com.br',
    '(61) 98157-1920',
    'Brasília, DF',
    true
) ON CONFLICT (cpf) DO NOTHING;

-- PASSO 5: Criar vinculações
-- Carlos Eduardo tem acesso à ACEX (admin) e Rialma (trader)
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'admin'),
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'trader')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- Ângelo Caiado tem acesso à Rialma (admin) e ACEX (viewer)
INSERT INTO user_brokerages (user_id, brokerage_id, role) VALUES
    ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'viewer')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- PASSO 6: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_brokerages_user_id ON user_brokerages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brokerages_brokerage_id ON user_brokerages(brokerage_id);

-- PASSO 7: Verificar resultado
SELECT 
    '=== USUÁRIOS CRIADOS ===' as categoria,
    '' as info
UNION ALL
SELECT 
    'Usuário',
    u.nome || ' - ' || u.email || ' - ' || u.telefone
FROM users u
UNION ALL
SELECT 
    '=== CORRETORAS CRIADAS ===',
    ''
UNION ALL
SELECT 
    'Corretora',
    b.nome || ' - Assessor: ' || b.assessor || ' - ' || b.endereco
FROM brokerages b
UNION ALL
SELECT 
    '=== VINCULAÇÕES ===',
    ''
UNION ALL
SELECT 
    'Acesso',
    u.nome || ' → ' || b.nome || ' [' || ub.role || ']'
FROM user_brokerages ub
JOIN users u ON u.id = ub.user_id
JOIN brokerages b ON b.id = ub.brokerage_id
ORDER BY 1, 2;

-- PASSO 8: Instruções para os próximos passos
SELECT 
    '=== PRÓXIMOS PASSOS ===' as titulo,
    '1. Execute CRIAR_USUARIOS_AUTH_FINAL.sql para criar usuários no Supabase Auth' as passo_1,
    '2. Execute SETUP_AUTENTICACAO_COMPLETO.sql para habilitar RLS' as passo_2;