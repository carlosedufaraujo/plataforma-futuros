-- SCRIPT SIMPLES PARA CORRIGIR LOGIN
-- Execute tudo de uma vez no Supabase SQL Editor

-- 1. Desabilitar RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "brokerages_select" ON brokerages;
DROP POLICY IF EXISTS "user_brokerages_select" ON user_brokerages;
DROP POLICY IF EXISTS "positions_all" ON positions;
DROP POLICY IF EXISTS "transactions_all" ON transactions;
DROP POLICY IF EXISTS "options_all" ON options;
DROP POLICY IF EXISTS "contracts_select" ON contracts;

-- Remover outras políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage own options" ON options;
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;

-- 3. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_brokerages_select" ON user_brokerages FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "brokerages_select" ON brokerages FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_brokerages WHERE brokerage_id = brokerages.id AND user_id = auth.uid())
);

CREATE POLICY "positions_all" ON positions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "options_all" ON options FOR ALL USING (user_id = auth.uid());
CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Verificar resultado
SELECT 'RLS CORRIGIDO!' as status, count(*) as total_policies FROM pg_policies WHERE schemaname = 'public'; 