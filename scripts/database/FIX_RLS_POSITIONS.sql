-- =====================================================
-- FIX RLS PARA POSITIONS - ERRO 409
-- =====================================================

-- 1. Verificar políticas atuais
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'positions';

-- 2. Remover políticas problemáticas (se existirem)
DROP POLICY IF EXISTS "Users can insert their own positions" ON positions;
DROP POLICY IF EXISTS "Users can view their own positions" ON positions;
DROP POLICY IF EXISTS "Users can update their own positions" ON positions;
DROP POLICY IF EXISTS "Users can delete their own positions" ON positions;

-- 3. Criar novas políticas mais permissivas para desenvolvimento
-- NOTA: Em produção, essas políticas devem ser mais restritivas

-- Política para SELECT (visualizar)
CREATE POLICY "Enable read access for authenticated users" ON positions
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IS NOT NULL
    );

-- Política para INSERT (criar)
CREATE POLICY "Enable insert for authenticated users" ON positions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Política para UPDATE (atualizar)
CREATE POLICY "Enable update for authenticated users" ON positions
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IS NOT NULL
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Política para DELETE (deletar)
CREATE POLICY "Enable delete for authenticated users" ON positions
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IS NOT NULL
    );

-- 4. Verificar se as novas políticas foram criadas
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'positions';

-- 5. Garantir que RLS está habilitado
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- 6. Teste rápido - tentar inserir uma posição de teste
-- Este teste deve funcionar agora
/*
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
    entry_date
) VALUES (
    '2dc60bee-5466-4f7e-8e1d-00cf91ee6e97',
    '6b75b1d7-8cea-4823-9c2f-2ff236d32da6',
    'e82c3a6a-8f91-4d2f-a9cf-12ca5a8b67ad',
    'TEST',
    'LONG',
    1,
    100.00,
    100.00,
    'EM_ABERTO',
    NOW()
);
*/