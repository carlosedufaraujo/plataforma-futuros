-- =====================================================
-- VERIFICAR CONSTRAINTS E RLS DA TABELA POSITIONS
-- =====================================================

-- 1. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'positions'
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'positions'::regclass;

-- 3. Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'positions';

-- 4. Verificar políticas RLS detalhadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'positions';

-- 5. Verificar se RLS está habilitado
SELECT 
    relname,
    relrowsecurity,
    relforcerowsecurity
FROM pg_class
WHERE relname = 'positions';

-- 6. Desabilitar temporariamente RLS para teste
-- CUIDADO: Só use em desenvolvimento!
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- 7. Testar inserção sem RLS
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
    'CCMK25',
    'LONG',
    10,
    85.50,
    85.50,
    'EM_ABERTO',
    NOW(),
    0,
    'CCMK25',
    'Milho Maio 2025',
    27,
    'ton',
    23085,
    0
) RETURNING id;

-- 8. Re-habilitar RLS após teste
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;