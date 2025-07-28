-- ================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ================================

-- Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Remover função is_admin se existir
DROP FUNCTION IF EXISTS is_admin();

-- ================================
-- CRIAR POLÍTICAS SIMPLES E SEGURAS
-- ================================

-- Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- USERS - Políticas básicas sem recursão
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- BROKERAGES - Acesso via join direto
CREATE POLICY "brokerages_select" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages ub
            WHERE ub.brokerage_id = brokerages.id
            AND ub.user_id = auth.uid()
        )
    );

-- USER_BROKERAGES - Acesso direto
CREATE POLICY "user_brokerages_select" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- POSITIONS - Acesso direto
CREATE POLICY "positions_all" ON positions
    FOR ALL USING (user_id = auth.uid());

-- TRANSACTIONS - Acesso direto
CREATE POLICY "transactions_all" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- OPTIONS - Acesso direto
CREATE POLICY "options_all" ON options
    FOR ALL USING (user_id = auth.uid());

-- CONTRACTS - Todos autenticados podem ver
CREATE POLICY "contracts_select" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- ================================
-- VERIFICAR RESULTADO
-- ================================

SELECT 
    'Políticas criadas:' as info,
    count(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;