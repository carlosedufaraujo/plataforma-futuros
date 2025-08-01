-- CORREÇÃO SIMPLES DO ERRO 500
-- Remove políticas problemáticas e cria políticas permissivas

-- 1. Desabilitar RLS temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "admin_can_view_all_users" ON users;
DROP POLICY IF EXISTS "admin_can_manage_all_users" ON users;

DROP POLICY IF EXISTS "brokerages_select" ON brokerages;
DROP POLICY IF EXISTS "admin_can_view_all_brokerages" ON brokerages;
DROP POLICY IF EXISTS "admin_can_manage_all_brokerages" ON brokerages;

DROP POLICY IF EXISTS "user_brokerages_select" ON user_brokerages;
DROP POLICY IF EXISTS "admin_can_view_all_user_brokerages" ON user_brokerages;
DROP POLICY IF EXISTS "admin_can_manage_all_user_brokerages" ON user_brokerages;

DROP POLICY IF EXISTS "positions_all" ON positions;
DROP POLICY IF EXISTS "admin_can_view_all_positions" ON positions;
DROP POLICY IF EXISTS "admin_can_manage_all_positions" ON positions;

DROP POLICY IF EXISTS "transactions_all" ON transactions;
DROP POLICY IF EXISTS "admin_can_view_all_transactions" ON transactions;
DROP POLICY IF EXISTS "admin_can_manage_all_transactions" ON transactions;

DROP POLICY IF EXISTS "options_all" ON options;
DROP POLICY IF EXISTS "admin_can_view_all_options" ON options;
DROP POLICY IF EXISTS "admin_can_manage_all_options" ON options;

DROP POLICY IF EXISTS "contracts_select" ON contracts;

-- 3. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas temporárias permissivas
CREATE POLICY "temp_users_all_access" ON users
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_brokerages_all_access" ON brokerages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_user_brokerages_all_access" ON user_brokerages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_positions_all_access" ON positions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_transactions_all_access" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_options_all_access" ON options
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "temp_contracts_all_access" ON contracts
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Verificar resultado
SELECT 'CORREÇÃO APLICADA COM SUCESSO!' as resultado,
       count(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'; 