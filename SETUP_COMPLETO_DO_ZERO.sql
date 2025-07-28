-- ================================
-- SETUP COMPLETO DO ZERO - SCRIPT ÚNICO
-- Execute TODO este script de uma vez no Supabase SQL Editor
-- ================================

-- PARTE 1: LIMPAR TUDO
-- ================================
DELETE FROM auth.users WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');
DELETE FROM user_brokerages WHERE id IS NOT NULL;
DELETE FROM brokerages WHERE nome IN ('Nova Futura Investimentos', 'XP Investimentos', 'BTG Pactual', 'StoneX');
DELETE FROM users WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');

-- PARTE 2: CRIAR TABELA USER_BROKERAGES
-- ================================
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

-- PARTE 3: CRIAR USUÁRIOS NA TABELA USERS
-- ================================
INSERT INTO users (nome, cpf, email, telefone, endereco, is_active) VALUES
('Carlos Eduardo Araujo', '123.456.789-00', 'carloseduardo@acexcapital.com', '(54) 98456-9252', 'Passo Fundo, RS', true),
('Ângelo Caiado', '987.654.321-00', 'angelocaiado@rialmaagropecuaria.com.br', '(61) 98157-1920', 'Brasília, DF', true);

-- PARTE 4: CRIAR CORRETORAS
-- ================================
INSERT INTO brokerages (nome, cnpj, endereco, assessor, telefone, email, corretagem_milho, corretagem_boi, taxas, impostos, is_active) VALUES
('Nova Futura Investimentos', '11.111.111/0001-11', 'Av. Paulista, 1842 - São Paulo, SP', 'Ricardo Santos', '(11) 3333-1111', 'contato@novafutura.com.br', 2.50, 3.00, 0.10, 0.05, true),
('XP Investimentos', '02.332.886/0001-04', 'Av. Chedid Jafet, 75 - São Paulo, SP', 'Marcos Silva', '(11) 4004-3710', 'atendimento@xpi.com.br', 2.25, 2.75, 0.08, 0.05, true),
('BTG Pactual', '30.306.294/0001-45', 'Av. Brigadeiro Faria Lima, 3477 - São Paulo, SP', 'Ana Paula Costa', '(11) 3383-2000', 'atendimento@btgpactual.com', 2.00, 2.50, 0.07, 0.05, true),
('StoneX', '33.333.333/0001-33', 'Av. das Nações Unidas, 12995 - São Paulo, SP', 'João Pedro Oliveira', '(11) 3508-5000', 'brasil@stonex.com', 2.75, 3.25, 0.12, 0.05, true);

-- PARTE 5: CRIAR VINCULAÇÕES USUÁRIO-CORRETORA
-- ================================
-- Vincular Carlos Eduardo com todas as corretoras
INSERT INTO user_brokerages (user_id, brokerage_id, role)
SELECT u.id, b.id, 'trader'
FROM users u
CROSS JOIN brokerages b
WHERE u.email = 'carloseduardo@acexcapital.com'
AND b.nome IN ('Nova Futura Investimentos', 'XP Investimentos', 'BTG Pactual', 'StoneX');

-- Vincular Ângelo apenas com StoneX
INSERT INTO user_brokerages (user_id, brokerage_id, role)
SELECT u.id, b.id, 'trader'
FROM users u
CROSS JOIN brokerages b
WHERE u.email = 'angelocaiado@rialmaagropecuaria.com.br'
AND b.nome = 'StoneX';

-- PARTE 6: CRIAR USUÁRIOS NO AUTH.USERS
-- ================================
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuários no auth com IDs corretos
DO $$
DECLARE
    carlos_id UUID;
    angelo_id UUID;
    carlos_nome VARCHAR;
    carlos_cpf VARCHAR;
    carlos_telefone VARCHAR;
    angelo_nome VARCHAR;
    angelo_cpf VARCHAR;
    angelo_telefone VARCHAR;
BEGIN
    -- Pegar dados completos do Carlos
    SELECT id, nome, cpf, telefone 
    INTO carlos_id, carlos_nome, carlos_cpf, carlos_telefone
    FROM users 
    WHERE email = 'carloseduardo@acexcapital.com';
    
    -- Pegar dados completos do Ângelo
    SELECT id, nome, cpf, telefone 
    INTO angelo_id, angelo_nome, angelo_cpf, angelo_telefone
    FROM users 
    WHERE email = 'angelocaiado@rialmaagropecuaria.com.br';
    
    -- Criar Carlos Eduardo no auth
    IF carlos_id IS NOT NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            carlos_id,
            'authenticated',
            'authenticated',
            'carloseduardo@acexcapital.com',
            crypt('Acex@2025', gen_salt('bf')),
            now(),
            jsonb_build_object('nome', carlos_nome, 'cpf', carlos_cpf, 'telefone', carlos_telefone),
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    END IF;
    
    -- Criar Ângelo Caiado no auth
    IF angelo_id IS NOT NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            angelo_id,
            'authenticated',
            'authenticated',
            'angelocaiado@rialmaagropecuaria.com.br',
            crypt('Rialma@2025', gen_salt('bf')),
            now(),
            jsonb_build_object('nome', angelo_nome, 'cpf', angelo_cpf, 'telefone', angelo_telefone),
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;

-- PARTE 7: HABILITAR RLS EM TODAS AS TABELAS
-- ================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- PARTE 8: CRIAR POLÍTICAS RLS
-- ================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage own options" ON options;
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;

-- Criar novas políticas
-- Users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Brokerages
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

-- User_brokerages
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- Positions
CREATE POLICY "Users can manage own positions" ON positions
    FOR ALL USING (user_id = auth.uid());

-- Transactions
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- Options
CREATE POLICY "Users can manage own options" ON options
    FOR ALL USING (user_id = auth.uid());

-- Contracts
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- PARTE 9: VERIFICAÇÃO FINAL
-- ================================
WITH verificacao AS (
    SELECT 
        '=== RESUMO DO SISTEMA ===' as categoria,
        '' as detalhe,
        1 as ordem
    
    UNION ALL
    
    SELECT 
        'Total de Usuários',
        COUNT(*)::text || ' usuários',
        2
    FROM users
    
    UNION ALL
    
    SELECT 
        'Total de Corretoras',
        COUNT(*)::text || ' corretoras',
        3
    FROM brokerages
    
    UNION ALL
    
    SELECT 
        'Vinculações Usuário-Corretora',
        COUNT(*)::text || ' vinculações',
        4
    FROM user_brokerages
    
    UNION ALL
    
    SELECT 
        'Usuários no Auth',
        COUNT(*)::text || ' com login ativo',
        5
    FROM auth.users
    
    UNION ALL
    
    SELECT 
        '',
        '---',
        10
        
    UNION ALL
    
    SELECT 
        '=== USUÁRIOS E SUAS CORRETORAS ===',
        '',
        11
    
    UNION ALL
    
    SELECT 
        u.nome,
        string_agg(b.nome, ', ' ORDER BY b.nome),
        12 + ROW_NUMBER() OVER (ORDER BY u.nome)
    FROM users u
    LEFT JOIN user_brokerages ub ON u.id = ub.user_id
    LEFT JOIN brokerages b ON ub.brokerage_id = b.id
    GROUP BY u.id, u.nome
    
    UNION ALL
    
    SELECT 
        '',
        '---',
        20
        
    UNION ALL
    
    SELECT 
        '=== STATUS DE AUTENTICAÇÃO ===',
        '',
        21
    
    UNION ALL
    
    SELECT 
        u.nome,
        CASE 
            WHEN au.id IS NOT NULL THEN '✅ Login configurado'
            ELSE '❌ Sem login'
        END,
        22 + ROW_NUMBER() OVER (ORDER BY u.nome)
    FROM users u
    LEFT JOIN auth.users au ON u.id = au.id
    
    UNION ALL
    
    SELECT 
        '',
        '---',
        30
        
    UNION ALL
    
    SELECT 
        '=== CREDENCIAIS DE ACESSO ===',
        '',
        31
    
    UNION ALL
    
    SELECT 
        'Carlos Eduardo',
        'carloseduardo@acexcapital.com / Acex@2025',
        32
        
    UNION ALL
    
    SELECT 
        'Ângelo Caiado',
        'angelocaiado@rialmaagropecuaria.com.br / Rialma@2025',
        33
)
SELECT categoria, detalhe
FROM verificacao
ORDER BY ordem;