-- =====================================================
-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR AGORA!
-- =====================================================
-- URL: https://supabase.com/dashboard/project/kdfevkbwohcajcwrqzor/sql/new
--
-- INSTRUÇÕES:
-- 1. Acesse o link acima
-- 2. Copie e cole todo este conteúdo
-- 3. Execute o script
-- =====================================================

-- 1. Verificar políticas atuais
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'positions';

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- 3. Testar inserção sem RLS
INSERT INTO positions (
    user_id,
    brokerage_id,
    contract_id,
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
    '2dc60bee-5466-4f7e-8e1d-00cf91ee6e97',
    '6b75b1d7-8cea-4823-9c2f-2ff236d32da6',
    'e82c3a6a-8f91-4d2f-a9cf-12ca5a8b67ad',
    'TESTE_RLS',
    'LONG',
    1,
    100.00,
    100.00,
    'EM_ABERTO',
    NOW(),
    0,
    'TESTE',
    'Teste RLS',
    1,
    'unit',
    100,
    0
) RETURNING id;

-- 4. Deletar a posição de teste
DELETE FROM positions WHERE contract = 'TESTE_RLS';

-- 5. Re-habilitar RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- 6. Criar política permissiva temporária para desenvolvimento
-- ATENÇÃO: Esta política é muito permissiva e deve ser removida em produção!
DROP POLICY IF EXISTS "temp_allow_all_authenticated" ON positions;

CREATE POLICY "temp_allow_all_authenticated" ON positions
    FOR ALL
    TO authenticated, anon  -- Permitir também anon para testes
    USING (true)
    WITH CHECK (true);

-- 7. Verificar se a política foi criada
SELECT * FROM pg_policies WHERE tablename = 'positions' AND policyname = 'temp_allow_all_authenticated';

-- 8. Mensagem final
SELECT '✅ Script executado! Tente criar uma posição novamente.' as mensagem;