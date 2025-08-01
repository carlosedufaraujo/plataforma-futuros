-- =====================================================
-- OBTER IDs VÁLIDOS DO BANCO
-- Execute este script primeiro para descobrir os IDs corretos
-- =====================================================

-- 1. Listar usuários ativos
SELECT 
    '=== USUÁRIOS ===' as section,
    id,
    nome,
    email
FROM users 
WHERE is_active = true
ORDER BY created_at DESC;

-- 2. Listar corretoras ativas
SELECT 
    '=== CORRETORAS ===' as section,
    id,
    nome
FROM brokerages 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Listar contratos ativos
SELECT 
    '=== CONTRATOS ===' as section,
    id,
    symbol,
    name
FROM contracts 
WHERE active = true
ORDER BY symbol
LIMIT 20;

-- 4. Verificar se existe alguma posição
SELECT 
    '=== POSIÇÕES EXISTENTES ===' as section,
    COUNT(*) as total_posicoes
FROM positions;

-- 5. Se houver posições, mostrar exemplo
SELECT 
    '=== EXEMPLO DE POSIÇÃO ===' as section,
    id,
    user_id,
    brokerage_id,
    contract,
    status
FROM positions
LIMIT 1;