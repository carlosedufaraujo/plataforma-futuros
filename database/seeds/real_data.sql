-- DADOS REAIS - CARLOS EDUARDO CEAC AGROPECUÁRIA
-- Script para inicializar sistema com dados internos reais

-- 1. USUÁRIO PRINCIPAL
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    cpf, 
    telefone, 
    endereco, 
    initial_capital, 
    current_capital,
    theme,
    is_active
) VALUES (
    '00000000-1111-2222-3333-444444444444',
    'carlos.eduardo@ceacagro.com.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewgYjvuPJ.YJ0K6G', -- password: admin123
    'Carlos Eduardo Almeida',
    '123.456.789-00', -- SUBSTITUA pelo CPF real
    '(11) 99999-9999', -- SUBSTITUA pelo telefone real
    'Rua das Palmeiras, 123 - São Paulo, SP', -- SUBSTITUA pelo endereço real
    500000.00, -- Capital inicial: R$ 500.000,00
    500000.00, -- Capital atual igual ao inicial
    'dark',
    true
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    telefone = EXCLUDED.telefone,
    endereco = EXCLUDED.endereco,
    updated_at = NOW();

-- 2. CORRETORAS REAIS
-- XP Investimentos
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
    '11111111-2222-3333-4444-555555555555',
    'XP Investimentos',
    '02.332.886/0001-04',
    'Av. Brigadeiro Faria Lima, 3300 - São Paulo, SP',
    'Roberto Silva', -- SUBSTITUA pelo nome real do assessor
    '(11) 3003-3000',
    'assessoria@xpi.com.br',
    2.50, -- Corretagem milho
    3.20, -- Corretagem boi
    0.35, -- Taxas
    15.80, -- Impostos
    true
) ON CONFLICT (cnpj) DO UPDATE SET
    assessor = EXCLUDED.assessor,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Rico Investimentos
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
    '22222222-3333-4444-5555-666666666666',
    'Rico Investimentos',
    '03.814.055/0001-74',
    'Av. Paulista, 1450 - São Paulo, SP',
    'Ana Paula Costa', -- SUBSTITUA pelo nome real do assessor
    '(11) 2050-5000',
    'suporte@rico.com.vc',
    2.80, -- Corretagem milho
    3.50, -- Corretagem boi
    0.28, -- Taxas
    16.20, -- Impostos
    true
) ON CONFLICT (cnpj) DO UPDATE SET
    assessor = EXCLUDED.assessor,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Clear Investimentos (adicionar se usar)
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
    '33333333-4444-5555-6666-777777777777',
    'Clear Corretora',
    '02.332.886/0011-11', -- SUBSTITUA pelo CNPJ real se usar
    'Av. Paulista, 1000 - São Paulo, SP',
    'João Santos', -- SUBSTITUA pelo nome real do assessor
    '(11) 4000-4000',
    'contato@clear.com.br',
    2.20, -- Corretagem milho
    2.90, -- Corretagem boi
    0.25, -- Taxas
    15.00, -- Impostos
    true
) ON CONFLICT (cnpj) DO NOTHING;

-- 3. VÍNCULOS USUÁRIO-CORRETORA (ACESSO ADMIN)
INSERT INTO user_brokerage_access (
    user_id,
    brokerage_id,
    role,
    granted_by,
    is_active
) VALUES 
(
    '00000000-1111-2222-3333-444444444444',
    '11111111-2222-3333-4444-555555555555',
    'admin',
    '00000000-1111-2222-3333-444444444444',
    true
),
(
    '00000000-1111-2222-3333-444444444444',
    '22222222-3333-4444-5555-666666666666',
    'admin',
    '00000000-1111-2222-3333-444444444444',
    true
),
(
    '00000000-1111-2222-3333-444444444444',
    '33333333-4444-5555-6666-777777777777',
    'admin',
    '00000000-1111-2222-3333-444444444444',
    true
) ON CONFLICT (user_id, brokerage_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

-- 4. CONFIGURAÇÕES DO USUÁRIO
INSERT INTO user_settings (
    user_id,
    api_url,
    risk_limit,
    auto_hedge,
    notifications
) VALUES (
    '00000000-1111-2222-3333-444444444444',
    'wss://api.b3.com.br/marketdata/v1',
    100000.00, -- Limite de risco: R$ 100.000,00
    false, -- Auto hedge desabilitado
    true -- Notificações habilitadas
) ON CONFLICT (user_id) DO UPDATE SET
    api_url = EXCLUDED.api_url,
    risk_limit = EXCLUDED.risk_limit,
    updated_at = NOW();

-- SISTEMA PRONTO PARA USO!
-- Próximos passos:
-- 1. Login: carlos.eduardo@ceacagro.com.br / admin123
-- 2. Selecionar corretora ativa
-- 3. Começar cadastro de posições reais

-- IMPORTANTE: AJUSTE OS DADOS ACIMA COM SUAS INFORMAÇÕES REAIS:
-- - CPF correto
-- - Telefone correto  
-- - Endereço correto
-- - Nomes dos assessores reais
-- - CNPJs das corretoras que você usa
-- - Valores de corretagem reais 