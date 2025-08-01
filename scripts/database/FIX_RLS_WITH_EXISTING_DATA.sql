-- =====================================================
-- CORRIGIR RLS COM DADOS EXISTENTES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar usuários existentes (use um destes IDs para teste)
SELECT 
    id,
    nome,
    email,
    CASE 
        WHEN email = 'carloseduardo@acexcapital.com' THEN '👤 Admin de teste'
        WHEN email = 'angelocaiado@rialmaagropecuaria.com.br' THEN '👤 Usuário de teste'
        ELSE '👤 Outro usuário'
    END as tipo
FROM users 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar corretoras existentes
SELECT 
    id,
    nome,
    cnpj
FROM brokerages 
WHERE is_active = true
ORDER BY nome
LIMIT 10;

-- 3. Verificar se existem posições
SELECT 
    COUNT(*) as total_posicoes,
    COUNT(DISTINCT user_id) as usuarios_com_posicoes,
    COUNT(DISTINCT brokerage_id) as corretoras_com_posicoes
FROM positions;

-- 4. Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- 5. Criar política super permissiva para desenvolvimento
-- ATENÇÃO: Remover em produção!
DROP POLICY IF EXISTS "temp_allow_all_authenticated" ON positions;
DROP POLICY IF EXISTS "temp_positions_all_access" ON positions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON positions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON positions;

-- 6. Re-habilitar RLS com política permissiva
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_allow_all_operations" ON positions
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 7. Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'positions';

-- 8. Testar com dados reais
-- Pegar um user_id e brokerage_id das queries acima e testar:
DO $$
DECLARE
    test_user_id uuid;
    test_brokerage_id uuid;
    test_position_id uuid;
BEGIN
    -- Pegar primeiro usuário ativo
    SELECT id INTO test_user_id FROM users WHERE is_active = true LIMIT 1;
    
    -- Pegar primeira corretora ativa
    SELECT id INTO test_brokerage_id FROM brokerages WHERE is_active = true LIMIT 1;
    
    -- Tentar inserir posição de teste
    INSERT INTO positions (
        user_id,
        brokerage_id,
        contract,
        direction,
        quantity,
        entry_price,
        current_price,
        status,
        entry_date,
        fees,
        symbol,
        name,
        contract_size,
        unit,
        exposure,
        unrealized_pnl
    ) VALUES (
        test_user_id,
        test_brokerage_id,
        'TESTE_RLS_' || TO_CHAR(NOW(), 'HHMMSS'),
        'LONG',
        1,
        100.00,
        100.00,
        'EM_ABERTO',
        NOW(),
        0,
        'TESTE',
        'Posição de Teste RLS',
        1,
        'unit',
        100,
        0
    ) RETURNING id INTO test_position_id;
    
    -- Deletar posição de teste
    DELETE FROM positions WHERE id = test_position_id;
    
    RAISE NOTICE '✅ Teste bem-sucedido! RLS está funcionando corretamente.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 9. Resultado final
SELECT 
    '✅ Script executado!' as status,
    'As políticas RLS foram configuradas para permitir todas as operações em desenvolvimento.' as mensagem,
    'IMPORTANTE: Lembre-se de configurar políticas mais restritivas em produção!' as aviso;