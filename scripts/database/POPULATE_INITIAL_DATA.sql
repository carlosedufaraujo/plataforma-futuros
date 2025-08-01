-- =====================================================
-- POPULAR BANCO COM DADOS INICIAIS
-- =====================================================

-- 1. Inserir usuários de teste (se não existirem)
INSERT INTO users (nome, cpf, email, telefone, endereco, is_active)
VALUES 
    ('Carlos Eduardo', '12345678901', 'carloseduardo@acexcapital.com', '11999999999', 'São Paulo, SP', true),
    ('Angelo Caiado', '98765432109', 'angelocaiado@rialmaagropecuaria.com.br', '11888888888', 'Goiânia, GO', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Inserir corretoras de teste (se não existirem)
INSERT INTO brokerages (nome, cnpj, endereco, assessor, telefone, email, corretagem_milho, corretagem_boi, taxas, impostos, is_active)
VALUES 
    ('XP Investimentos', '02332886000104', 'Av. Chedid Jafet, 75 - São Paulo, SP', 'João Silva', '1130039060', 'assessoria@xpi.com.br', 0.50, 0.75, 10.00, 0.00, true),
    ('BTG Pactual', '30306294000145', 'Av. Faria Lima, 3477 - São Paulo, SP', 'Maria Santos', '1133832000', 'assessoria@btgpactual.com', 0.45, 0.70, 12.00, 0.00, true),
    ('Modal Mais', '05389174000101', 'Av. Presidente Juscelino, 1909 - São Paulo, SP', 'Pedro Costa', '1135265800', 'assessoria@modalmais.com.br', 0.55, 0.80, 8.00, 0.00, true)
ON CONFLICT (cnpj) DO NOTHING;

-- 3. Inserir contratos de Milho
INSERT INTO contracts (symbol, name, commodity_type, exchange, contract_size, unit, tick_size, currency, months, daily_limit, margin_requirement, last_trading_day_rule, first_notice_day_rule, is_active)
VALUES 
    ('CCMH25', 'Milho Março 2025', 'MILHO', 'B3', 27, 'ton', 0.01, 'BRL', '["H"]', 8.00, 2000.00, 'Sexto dia útil anterior ao mês de vencimento', 'Primeiro dia útil do mês de vencimento', true),
    ('CCMK25', 'Milho Maio 2025', 'MILHO', 'B3', 27, 'ton', 0.01, 'BRL', '["K"]', 8.00, 2000.00, 'Sexto dia útil anterior ao mês de vencimento', 'Primeiro dia útil do mês de vencimento', true),
    ('CCMN25', 'Milho Julho 2025', 'MILHO', 'B3', 27, 'ton', 0.01, 'BRL', '["N"]', 8.00, 2000.00, 'Sexto dia útil anterior ao mês de vencimento', 'Primeiro dia útil do mês de vencimento', true),
    ('CCMU25', 'Milho Setembro 2025', 'MILHO', 'B3', 27, 'ton', 0.01, 'BRL', '["U"]', 8.00, 2000.00, 'Sexto dia útil anterior ao mês de vencimento', 'Primeiro dia útil do mês de vencimento', true),
    ('CCMZ25', 'Milho Dezembro 2025', 'MILHO', 'B3', 27, 'ton', 0.01, 'BRL', '["Z"]', 8.00, 2000.00, 'Sexto dia útil anterior ao mês de vencimento', 'Primeiro dia útil do mês de vencimento', true)
ON CONFLICT (symbol) DO NOTHING;

-- 4. Inserir contratos de Boi Gordo
INSERT INTO contracts (symbol, name, commodity_type, exchange, contract_size, unit, tick_size, currency, months, daily_limit, margin_requirement, last_trading_day_rule, first_notice_day_rule, is_active)
VALUES 
    ('BGIG25', 'Boi Gordo Fevereiro 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["G"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIJ25', 'Boi Gordo Abril 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["J"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIM25', 'Boi Gordo Maio 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["M"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIQ25', 'Boi Gordo Agosto 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["Q"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIV25', 'Boi Gordo Outubro 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["V"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIX25', 'Boi Gordo Novembro 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["X"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true),
    ('BGIZ25', 'Boi Gordo Dezembro 2025', 'BOI', 'B3', 330, '@', 0.01, 'BRL', '["Z"]', 2.50, 3000.00, 'Último dia útil do mês de vencimento', 'Não aplicável', true)
ON CONFLICT (symbol) DO NOTHING;

-- 5. Criar relacionamento usuário-corretora
INSERT INTO user_brokerages (user_id, brokerage_id)
SELECT u.id, b.id
FROM users u
CROSS JOIN brokerages b
WHERE u.email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br')
AND b.nome IN ('XP Investimentos', 'BTG Pactual')
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- 6. Verificar resultado
SELECT 
    '✅ Dados iniciais inseridos!' as status,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as usuarios_ativos,
    (SELECT COUNT(*) FROM brokerages WHERE is_active = true) as corretoras_ativas,
    (SELECT COUNT(*) FROM contracts WHERE is_active = true) as contratos_ativos;

-- 7. Mostrar exemplos para uso
SELECT 
    '📋 IDs para teste:' as info;

SELECT 
    'Usuário: ' || nome || ' - ID: ' || id as exemplo
FROM users 
WHERE email = 'carloseduardo@acexcapital.com'
LIMIT 1;

SELECT 
    'Corretora: ' || nome || ' - ID: ' || id as exemplo
FROM brokerages 
WHERE nome = 'XP Investimentos'
LIMIT 1;

SELECT 
    'Contrato: ' || symbol || ' - ID: ' || id as exemplo
FROM contracts 
WHERE symbol = 'CCMK25'
LIMIT 1;