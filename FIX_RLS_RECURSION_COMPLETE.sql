-- =============================================
-- FIX COMPLETO PARA RECURSÃO INFINITA NAS RLS
-- =============================================
-- Execute este script no Supabase SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expirations DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$ 
DECLARE
    pol RECORD;
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

-- 3. CRIAR POLÍTICAS PARA USERS (SEM RECURSÃO)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- 4. CRIAR POLÍTICAS PARA BROKERAGES
CREATE POLICY "Users can view their brokerages" ON brokerages
    FOR SELECT USING (
        id IN (
            SELECT brokerage_id 
            FROM user_brokerages 
            WHERE user_id = auth.uid()
        )
    );

-- 5. CRIAR POLÍTICAS PARA USER_BROKERAGES
CREATE POLICY "Users can view their own associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- 6. CRIAR POLÍTICAS PARA CONTRACTS
CREATE POLICY "Users can view contracts" ON contracts
    FOR ALL USING (true);

-- 7. CRIAR POLÍTICAS PARA POSITIONS
CREATE POLICY "Users can view their positions" ON positions
    FOR SELECT USING (
        user_id = auth.uid() 
        AND brokerage_id IN (
            SELECT brokerage_id 
            FROM user_brokerages 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their positions" ON positions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND brokerage_id IN (
            SELECT brokerage_id 
            FROM user_brokerages 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their positions" ON positions
    FOR UPDATE USING (
        user_id = auth.uid() 
        AND brokerage_id IN (
            SELECT brokerage_id 
            FROM user_brokerages 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their positions" ON positions
    FOR DELETE USING (
        user_id = auth.uid() 
        AND brokerage_id IN (
            SELECT brokerage_id 
            FROM user_brokerages 
            WHERE user_id = auth.uid()
        )
    );

-- 8. CRIAR POLÍTICAS PARA TRANSACTIONS
CREATE POLICY "Users can view their transactions" ON transactions
    FOR SELECT USING (
        position_id IN (
            SELECT id 
            FROM positions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (
        position_id IN (
            SELECT id 
            FROM positions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their transactions" ON transactions
    FOR UPDATE USING (
        position_id IN (
            SELECT id 
            FROM positions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their transactions" ON transactions
    FOR DELETE USING (
        position_id IN (
            SELECT id 
            FROM positions 
            WHERE user_id = auth.uid()
        )
    );

-- 9. CRIAR POLÍTICAS PARA EXPIRATIONS
CREATE POLICY "All users can view expirations" ON expirations
    FOR SELECT USING (true);

-- 10. REABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expirations ENABLE ROW LEVEL SECURITY;

-- 11. VERIFICAR RESULTADO
SELECT 
    tablename,
    policyname,
    cmd,
    substring(qual, 1, 100) as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;